import { once } from "node:events";
import { randomUUID } from "node:crypto";
import type { AddressInfo } from "node:net";
import { resolve } from "node:path";
import { z } from "zod";
import type {
  Beneficiary,
  Invoice,
  Payment,
  Quote,
  Receipt,
  Settlement,
} from "../src/domain.js";
import { createCircleClient, getUsdcBalance } from "../src/arc/circle.js";
import { ARC_BLOCKCHAIN, loadSettlementConfig, loadWalletState } from "../src/arc/config.js";
import { createHttpServer } from "../src/http.js";
import { ArcCircleSettlementGateway } from "../src/settlement.js";
import { SetulaService } from "../src/service.js";
import { JsonFileStore } from "../src/store.js";

const runtimeSchema = z.object({
  PORT: z.coerce.number().int().positive().max(65_535).default(4_000),
  DATA_FILE: z.string().min(1).default(".setula-data.json"),
  PAYOUT_CALLBACK_SECRET: z.string().min(12),
});

type PaymentAggregate = {
  payment: Payment;
  invoice: Invoice;
  quote: Quote;
  settlement?: Settlement;
  receipt?: Receipt;
};

type PayoutCallbackResult = {
  payment: Payment;
  receipt?: Receipt;
};

function ceilDiv(numerator: bigint, denominator: bigint): bigint {
  return (numerator + denominator - 1n) / denominator;
}

async function main(): Promise<void> {
  const runtime = runtimeSchema.parse(process.env);
  const configured = loadSettlementConfig();
  const wallets = loadWalletState();
  if (configured.CIRCLE_BLOCKCHAIN !== ARC_BLOCKCHAIN) {
    throw new Error("Configured blockchain is not Arc Testnet");
  }

  const circle = createCircleClient();
  const senderWalletResponse = await circle.getWallet({ id: wallets.walletA.id });
  const senderWallet = senderWalletResponse.data?.wallet;
  if (
    !senderWallet ||
    senderWallet.blockchain !== ARC_BLOCKCHAIN ||
    senderWallet.state !== "LIVE"
  ) {
    throw new Error("Sender wallet is not a live Arc Testnet wallet");
  }
  if (!/^0x[0-9a-fA-F]{40}$/.test(wallets.walletB.address)) {
    throw new Error("Recipient address is invalid");
  }

  const [senderBefore, recipientBefore] = await Promise.all([
    getUsdcBalance(circle, wallets.walletA.id),
    getUsdcBalance(circle, wallets.walletB.id),
  ]);
  if (senderBefore.baseUnits < 10_000n) {
    throw new Error("Sender has less than the required 0.01 USDC");
  }

  const service = new SetulaService(
    new JsonFileStore(resolve(runtime.DATA_FILE)),
    new ArcCircleSettlementGateway(),
    runtime.PAYOUT_CALLBACK_SECRET,
  );
  const server = createHttpServer(service);
  server.listen(runtime.PORT, "127.0.0.1");
  await once(server, "listening");
  const address = server.address() as AddressInfo;
  const baseUrl = `http://127.0.0.1:${address.port}`;

  async function post<T>(
    path: string,
    body: unknown,
    idempotencyKey: string,
    headers: Record<string, string> = {},
  ): Promise<T> {
    const response = await fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "idempotency-key": idempotencyKey,
        ...headers,
      },
      body: JSON.stringify(body),
    });
    const responseBody = (await response.json()) as unknown;
    if (!response.ok) {
      throw new Error(`API ${path} failed with HTTP ${response.status}: ${JSON.stringify(responseBody)}`);
    }
    return responseBody as T;
  }

  async function get<T>(path: string): Promise<T> {
    const response = await fetch(`${baseUrl}${path}`);
    const responseBody = (await response.json()) as unknown;
    if (!response.ok) {
      throw new Error(`API ${path} failed with HTTP ${response.status}: ${JSON.stringify(responseBody)}`);
    }
    return responseBody as T;
  }

  try {
    const runId = randomUUID().slice(0, 8).toUpperCase();
    const beneficiary = await post<Beneficiary>(
      "/api/beneficiaries",
      {
        name: "Setula India Contractor",
        email: `contractor-${runId.toLowerCase()}@example.test`,
        bankAccountLast4: "1234",
      },
      randomUUID(),
    );
    const invoice = await post<Invoice>(
      "/api/invoices",
      {
        beneficiaryId: beneficiary.id,
        reference: `INV-SETULA-${runId}`,
        amountInrMinor: 100,
        description: "Setula Arc Testnet validation invoice",
      },
      randomUUID(),
    );
    const quote = await post<Quote>(
      `/api/invoices/${invoice.id}/quotes`,
      {},
      randomUUID(),
    );
    if (quote.usdcAmount !== "0.01") {
      throw new Error(`Golden-path quote must settle exactly 0.01 USDC, got ${quote.usdcAmount}`);
    }
    const payment = await post<Payment>(
      "/api/payments",
      { invoiceId: invoice.id, quoteId: quote.id },
      randomUUID(),
    );
    await post<Payment>(
      `/api/payments/${payment.id}/funding-confirmations`,
      {},
      randomUUID(),
    );

    const settlementRequestKey = randomUUID();
    await post<Payment>(
      `/api/payments/${payment.id}/settlements`,
      {},
      settlementRequestKey,
    );
    const settledAggregate = await get<PaymentAggregate>(
      `/api/payments/${payment.id}`,
    );
    const settlement = settledAggregate.settlement;
    if (
      !settlement ||
      settlement.status !== "COMPLETE" ||
      !settlement.circleTransactionId ||
      !settlement.transactionHash ||
      !settlement.arcScanUrl
    ) {
      throw new Error("Successful payment is missing complete Arc settlement evidence");
    }
    const statesBeforePayout = settledAggregate.payment.timeline.map(({ status }) => status);
    const settledIndex = statesBeforePayout.indexOf("SETTLED");
    const payoutPendingIndex = statesBeforePayout.indexOf("PAYOUT_PENDING");
    if (settledIndex < 0 || payoutPendingIndex <= settledIndex) {
      throw new Error("SETTLED did not occur before PAYOUT_PENDING");
    }

    const circleTransaction = (
      await circle.getTransaction({ id: settlement.circleTransactionId })
    ).data?.transaction;
    if (circleTransaction?.state !== "COMPLETE") {
      throw new Error(
        `Circle transaction is not COMPLETE: ${circleTransaction?.state ?? "missing"}`,
      );
    }
    if (circleTransaction.txHash !== settlement.transactionHash) {
      throw new Error("Circle transaction hash does not match stored settlement hash");
    }
    const arcScanResponse = await fetch(settlement.arcScanUrl, { redirect: "follow" });
    if (!arcScanResponse.ok) {
      throw new Error(`ArcScan transaction page returned HTTP ${arcScanResponse.status}`);
    }

    const callback = await post<PayoutCallbackResult>(
      "/api/payout-callbacks",
      {
        callbackId: `payout-${runId}`,
        paymentId: payment.id,
        reference: invoice.reference,
        amountInrMinor: invoice.amountInrMinor,
        status: "DELIVERED",
      },
      randomUUID(),
      { "x-payout-callback-secret": runtime.PAYOUT_CALLBACK_SECRET },
    );
    if (callback.payment.status !== "DELIVERED" || !callback.receipt) {
      throw new Error("Valid payout callback did not deliver the payment and create a receipt");
    }
    const receipt = await get<Receipt>(`/api/receipts/${callback.receipt.id}`);
    const referencesMatch =
      invoice.reference === payment.reference &&
      payment.reference === receipt.reference &&
      receipt.invoiceId === invoice.id &&
      receipt.paymentId === payment.id;
    if (!referencesMatch) throw new Error("Invoice, payment, and receipt references do not match");

    const recipientAfterSuccess = await getUsdcBalance(circle, wallets.walletB.id);
    const successfulRecipientDelta =
      recipientAfterSuccess.baseUnits - recipientBefore.baseUnits;
    if (successfulRecipientDelta !== 10_000n) {
      throw new Error(
        `Recipient delta was not exactly 0.01 USDC: ${recipientAfterSuccess.amount}`,
      );
    }

    await post<Payment>(
      `/api/payments/${payment.id}/settlements`,
      {},
      settlementRequestKey,
    );
    const duplicateAggregate = await get<PaymentAggregate>(
      `/api/payments/${payment.id}`,
    );
    const recipientAfterDuplicate = await getUsdcBalance(circle, wallets.walletB.id);
    const duplicatePrevented =
      duplicateAggregate.settlement?.circleTransactionId === settlement.circleTransactionId &&
      duplicateAggregate.settlement?.transactionHash === settlement.transactionHash &&
      recipientAfterDuplicate.baseUnits === recipientAfterSuccess.baseUnits;
    if (!duplicatePrevented) throw new Error("Duplicate settlement protection failed");

    const senderAfterSuccess = await getUsdcBalance(circle, wallets.walletA.id);
    const attemptedFailureBaseUnits = senderAfterSuccess.baseUnits + 1_000_000n;
    const failureInvoiceMinor = Number(
      ceilDiv(attemptedFailureBaseUnits * 10_000n, 1_000_000n),
    );
    const failureInvoice = await post<Invoice>(
      "/api/invoices",
      {
        beneficiaryId: beneficiary.id,
        reference: `INV-SETULA-FAIL-${runId}`,
        amountInrMinor: failureInvoiceMinor,
        description: "Setula insufficient-balance validation invoice",
      },
      randomUUID(),
    );
    const failureQuote = await post<Quote>(
      `/api/invoices/${failureInvoice.id}/quotes`,
      {},
      randomUUID(),
    );
    const failurePayment = await post<Payment>(
      "/api/payments",
      { invoiceId: failureInvoice.id, quoteId: failureQuote.id },
      randomUUID(),
    );
    await post<Payment>(
      `/api/payments/${failurePayment.id}/funding-confirmations`,
      {},
      randomUUID(),
    );
    await post<Payment>(
      `/api/payments/${failurePayment.id}/settlements`,
      {},
      randomUUID(),
    );
    const failureAggregate = await get<PaymentAggregate>(
      `/api/payments/${failurePayment.id}`,
    );
    const failedStates = failureAggregate.payment.timeline.map(({ status }) => status);
    const noMisleadingExplorerLink =
      !failureAggregate.settlement?.transactionHash &&
      !failureAggregate.settlement?.arcScanUrl;
    if (
      failureAggregate.payment.status !== "SETTLEMENT_FAILED" ||
      failedStates.includes("SETTLED") ||
      !noMisleadingExplorerLink
    ) {
      throw new Error("Insufficient-balance payment did not fail safely");
    }

    const invalidPayoutResponse = await fetch(`${baseUrl}/api/payout-callbacks`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "idempotency-key": randomUUID(),
        "x-payout-callback-secret": runtime.PAYOUT_CALLBACK_SECRET,
      },
      body: JSON.stringify({
        callbackId: `payout-failure-${runId}`,
        paymentId: failurePayment.id,
        reference: failureInvoice.reference,
        amountInrMinor: failureInvoice.amountInrMinor,
        status: "DELIVERED",
      }),
    });
    if (invalidPayoutResponse.status !== 409) {
      throw new Error("Failed settlement accepted a payout callback");
    }
    const failureAfterCallback = await get<PaymentAggregate>(
      `/api/payments/${failurePayment.id}`,
    );
    const recipientAfterFailure = await getUsdcBalance(circle, wallets.walletB.id);
    const failurePathPassed =
      failureAfterCallback.payment.status === "SETTLEMENT_FAILED" &&
      recipientAfterFailure.baseUnits === recipientAfterDuplicate.baseUnits &&
      !failureAfterCallback.receipt;
    if (!failurePathPassed) throw new Error("Failure payment changed after payout callback");

    const evidence = {
      beneficiaryId: beneficiary.id,
      invoiceId: invoice.id,
      paymentReference: payment.reference,
      paymentStates: callback.payment.timeline.map(({ status }) => status),
      amountSettled: settlement.amountUsdc,
      circleTransactionStatus: circleTransaction.state,
      circleTransactionId: settlement.circleTransactionId,
      transactionHash: settlement.transactionHash,
      arcScanUrl: settlement.arcScanUrl,
      arcScanHttpStatus: arcScanResponse.status,
      receiptId: receipt.id,
      referencesMatch,
      balanceConfirmation: {
        senderBefore: senderBefore.amount,
        senderAfter: senderAfterSuccess.amount,
        recipientBefore: recipientBefore.amount,
        recipientAfter: recipientAfterSuccess.amount,
        recipientDelta: "0.01",
      },
      duplicatePreventionResult: {
        passed: duplicatePrevented,
        originalCircleTransactionIdRetained: true,
        originalTransactionHashRetained: true,
        recipientDuplicateDelta: "0",
      },
      failurePathResult: {
        passed: failurePathPassed,
        attemptedAmount: failureQuote.usdcAmount,
        finalState: failureAfterCallback.payment.status,
        everSettled: failedStates.includes("SETTLED"),
        payoutCallbackRejected: invalidPayoutResponse.status === 409,
        arcScanLinkGenerated: Boolean(failureAggregate.settlement?.arcScanUrl),
        recipientDelta: "0",
      },
    };
    console.log(JSON.stringify(evidence, null, 2));
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(JSON.stringify({ verification: "FAILED", message }));
  process.exitCode = 1;
});
