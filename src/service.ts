import { createHash, randomUUID } from "node:crypto";
import type {
  Beneficiary,
  Database,
  Invoice,
  Payment,
  Payout,
  Quote,
  Receipt,
  Settlement,
} from "./domain.js";
import {
  ConflictError,
  InsufficientBalanceError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "./errors.js";
import type { SettlementGateway } from "./settlement.js";
import { transitionPayment } from "./state-machine.js";
import type { Store } from "./store.js";

const INR_PER_AED_NUMERATOR = 2_275n;
const INR_PER_AED_DENOMINATOR = 100n;
// Deterministic sandbox settlement rate: 100.00 INR per USDC. This lets the
// validation invoice of 1.00 INR settle as exactly 0.01 USDC.
const INR_PER_USDC_MINOR = 10_000n;
const QUOTE_TTL_MS = 15 * 60 * 1_000;

type Clock = () => Date;

function ceilDiv(numerator: bigint, denominator: bigint): bigint {
  return (numerator + denominator - 1n) / denominator;
}

function formatUsdcBaseUnits(value: bigint): string {
  const whole = value / 1_000_000n;
  const fraction = (value % 1_000_000n)
    .toString()
    .padStart(6, "0")
    .replace(/0+$/, "");
  return `${whole}${fraction ? `.${fraction}` : ""}`;
}

function fingerprint(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function requireIdempotencyKey(key: string): void {
  if (!key || key.length > 200) {
    throw new ValidationError("A valid Idempotency-Key header is required");
  }
}

export class SetulaService {
  private queue: Promise<void> = Promise.resolve();

  constructor(
    private readonly store: Store,
    private readonly settlementGateway: SettlementGateway,
    private readonly payoutCallbackSecret: string,
    private readonly clock: Clock = () => new Date(),
  ) {}

  private exclusive<T>(operation: () => Promise<T>): Promise<T> {
    const result = this.queue.then(operation, operation);
    this.queue = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  }

  private existingIdempotentResource<T>(
    database: Database,
    scope: string,
    key: string,
    expectedFingerprint: string,
    resources: Record<string, T>,
  ): T | undefined {
    requireIdempotencyKey(key);
    const record = database.idempotency[`${scope}:${key}`];
    if (!record) return undefined;
    if (record.fingerprint !== expectedFingerprint) {
      throw new ConflictError(
        "Idempotency key was already used with a different request",
        "IDEMPOTENCY_KEY_REUSED",
      );
    }
    const resource = resources[record.resourceId];
    if (!resource) throw new Error("Idempotency record points to missing resource");
    return resource;
  }

  private recordIdempotency(
    database: Database,
    scope: string,
    key: string,
    requestFingerprint: string,
    resourceId: string,
  ): void {
    database.idempotency[`${scope}:${key}`] = {
      scope,
      key,
      fingerprint: requestFingerprint,
      resourceId,
    };
  }

  async createBeneficiary(
    input: Pick<Beneficiary, "name" | "email" | "bankAccountLast4">,
    idempotencyKey: string,
  ): Promise<Beneficiary> {
    return this.exclusive(async () => {
      const database = await this.store.load();
      const requestFingerprint = fingerprint(input);
      const existing = this.existingIdempotentResource(
        database,
        "beneficiary:create",
        idempotencyKey,
        requestFingerprint,
        database.beneficiaries,
      );
      if (existing) return existing;

      const now = this.clock().toISOString();
      const beneficiary: Beneficiary = {
        id: randomUUID(),
        reference: `BEN-${randomUUID().slice(0, 8).toUpperCase()}`,
        ...input,
        createdAt: now,
      };
      database.beneficiaries[beneficiary.id] = beneficiary;
      this.recordIdempotency(
        database,
        "beneficiary:create",
        idempotencyKey,
        requestFingerprint,
        beneficiary.id,
      );
      await this.store.save(database);
      return beneficiary;
    });
  }

  async createInvoice(
    input: {
      beneficiaryId: string;
      reference: string;
      amountInrMinor: number;
      description: string;
    },
    idempotencyKey: string,
  ): Promise<Invoice> {
    return this.exclusive(async () => {
      const database = await this.store.load();
      if (!database.beneficiaries[input.beneficiaryId]) {
        throw new NotFoundError("Beneficiary");
      }
      const requestFingerprint = fingerprint(input);
      const existing = this.existingIdempotentResource(
        database,
        "invoice:create",
        idempotencyKey,
        requestFingerprint,
        database.invoices,
      );
      if (existing) return existing;
      if (Object.values(database.invoices).some((item) => item.reference === input.reference)) {
        throw new ConflictError("Invoice reference already exists");
      }

      const invoice: Invoice = {
        id: randomUUID(),
        ...input,
        createdAt: this.clock().toISOString(),
      };
      database.invoices[invoice.id] = invoice;
      this.recordIdempotency(
        database,
        "invoice:create",
        idempotencyKey,
        requestFingerprint,
        invoice.id,
      );
      await this.store.save(database);
      return invoice;
    });
  }

  async createQuote(invoiceId: string, idempotencyKey: string): Promise<Quote> {
    return this.exclusive(async () => {
      const database = await this.store.load();
      const invoice = database.invoices[invoiceId];
      if (!invoice) throw new NotFoundError("Invoice");
      const requestFingerprint = fingerprint({ invoiceId });
      const existing = this.existingIdempotentResource(
        database,
        `quote:create:${invoiceId}`,
        idempotencyKey,
        requestFingerprint,
        database.quotes,
      );
      if (existing) return existing;

      const amountInrMinor = BigInt(invoice.amountInrMinor);
      const amountAedMinor = ceilDiv(
        amountInrMinor * INR_PER_AED_DENOMINATOR,
        INR_PER_AED_NUMERATOR,
      );
      const usdcBaseUnits = ceilDiv(amountInrMinor * 1_000_000n, INR_PER_USDC_MINOR);
      const createdAt = this.clock();
      const quote: Quote = {
        id: randomUUID(),
        invoiceId,
        reference: invoice.reference,
        amountInrMinor: invoice.amountInrMinor,
        rateInrPerAed: "22.75",
        amountAedMinor: Number(amountAedMinor),
        usdcAmount: formatUsdcBaseUnits(usdcBaseUnits),
        expiresAt: new Date(createdAt.getTime() + QUOTE_TTL_MS).toISOString(),
        createdAt: createdAt.toISOString(),
      };
      database.quotes[quote.id] = quote;
      this.recordIdempotency(
        database,
        `quote:create:${invoiceId}`,
        idempotencyKey,
        requestFingerprint,
        quote.id,
      );
      await this.store.save(database);
      return quote;
    });
  }

  async createPayment(
    input: { invoiceId: string; quoteId: string },
    idempotencyKey: string,
  ): Promise<Payment> {
    return this.exclusive(async () => {
      const database = await this.store.load();
      const requestFingerprint = fingerprint(input);
      const existing = this.existingIdempotentResource(
        database,
        "payment:create",
        idempotencyKey,
        requestFingerprint,
        database.payments,
      );
      if (existing) return existing;

      const invoice = database.invoices[input.invoiceId];
      const quote = database.quotes[input.quoteId];
      if (!invoice) throw new NotFoundError("Invoice");
      if (!quote || quote.invoiceId !== invoice.id) {
        throw new ValidationError("Quote does not belong to the invoice");
      }
      if (new Date(quote.expiresAt).getTime() <= this.clock().getTime()) {
        throw new ConflictError("Quote has expired", "QUOTE_EXPIRED");
      }

      const now = this.clock().toISOString();
      const payment: Payment = {
        id: randomUUID(),
        invoiceId: invoice.id,
        quoteId: quote.id,
        reference: invoice.reference,
        status: "DRAFT",
        timeline: [{ status: "DRAFT", at: now }],
        createdAt: now,
        updatedAt: now,
      };
      transitionPayment(payment, "QUOTED", now, "Sandbox quote approved");
      database.payments[payment.id] = payment;
      this.recordIdempotency(
        database,
        "payment:create",
        idempotencyKey,
        requestFingerprint,
        payment.id,
      );
      await this.store.save(database);
      return payment;
    });
  }

  async confirmFunding(paymentId: string, idempotencyKey: string): Promise<Payment> {
    return this.exclusive(async () => {
      const database = await this.store.load();
      const requestFingerprint = fingerprint({ paymentId });
      const existing = this.existingIdempotentResource(
        database,
        `funding:confirm:${paymentId}`,
        idempotencyKey,
        requestFingerprint,
        database.payments,
      );
      if (existing) return existing;
      const payment = database.payments[paymentId];
      if (!payment) throw new NotFoundError("Payment");
      transitionPayment(payment, "FUNDED", this.clock().toISOString(), "AED funding simulated");
      this.recordIdempotency(
        database,
        `funding:confirm:${paymentId}`,
        idempotencyKey,
        requestFingerprint,
        payment.id,
      );
      await this.store.save(database);
      return payment;
    });
  }

  async executeSettlement(paymentId: string, idempotencyKey: string): Promise<Payment> {
    return this.exclusive(async () => {
      requireIdempotencyKey(idempotencyKey);
      const database = await this.store.load();
      const payment = database.payments[paymentId];
      if (!payment) throw new NotFoundError("Payment");

      if (["SETTLED", "PAYOUT_PENDING", "DELIVERED"].includes(payment.status)) {
        return payment;
      }
      let settlement = payment.settlementId
        ? database.settlements[payment.settlementId]
        : undefined;

      if (payment.status === "FUNDED") {
        const quote = database.quotes[payment.quoteId];
        if (!quote) throw new NotFoundError("Quote");
        const now = this.clock().toISOString();
        settlement = {
          id: randomUUID(),
          paymentId,
          reference: payment.reference,
          idempotencyKey: randomUUID(),
          amountUsdc: quote.usdcAmount,
          status: "PENDING",
          createdAt: now,
          updatedAt: now,
        };
        database.settlements[settlement.id] = settlement;
        payment.settlementId = settlement.id;
        transitionPayment(payment, "SETTLEMENT_PENDING", now);
        await this.store.save(database);
      } else if (payment.status !== "SETTLEMENT_PENDING") {
        throw new ConflictError(
          `Cannot settle payment in ${payment.status}`,
          "INVALID_STATE_TRANSITION",
        );
      }

      if (!settlement) throw new Error("Pending payment has no settlement record");

      try {
        const result = await this.settlementGateway.transfer({
          paymentId,
          idempotencyKey: settlement.idempotencyKey,
          amountUsdc: settlement.amountUsdc,
        });
        const latest = await this.store.load();
        const latestPayment = latest.payments[paymentId];
        const latestSettlement = latest.settlements[settlement.id];
        if (!latestPayment || !latestSettlement) {
          throw new Error("Settlement state disappeared during transfer");
        }
        const now = this.clock().toISOString();
        latestSettlement.status = "COMPLETE";
        latestSettlement.circleTransactionId = result.circleTransactionId;
        latestSettlement.transactionHash = result.transactionHash;
        latestSettlement.arcScanUrl = result.arcScanUrl;
        latestSettlement.updatedAt = now;
        transitionPayment(latestPayment, "SETTLED", now, "Arc transaction succeeded");

        const invoice = latest.invoices[latestPayment.invoiceId];
        if (!invoice) throw new NotFoundError("Invoice");
        const payout: Payout = {
          id: randomUUID(),
          paymentId,
          reference: latestPayment.reference,
          amountInrMinor: invoice.amountInrMinor,
          status: "PENDING",
          createdAt: now,
          updatedAt: now,
        };
        latest.payouts[payout.id] = payout;
        latestPayment.payoutId = payout.id;
        transitionPayment(latestPayment, "PAYOUT_PENDING", now);
        this.recordIdempotency(
          latest,
          `settlement:execute:${paymentId}`,
          idempotencyKey,
          fingerprint({ paymentId }),
          paymentId,
        );
        await this.store.save(latest);
        return latestPayment;
      } catch (error) {
        if (!(error instanceof InsufficientBalanceError)) throw error;
        const latest = await this.store.load();
        const latestPayment = latest.payments[paymentId];
        const latestSettlement = latest.settlements[settlement.id];
        if (!latestPayment || !latestSettlement) throw error;
        const now = this.clock().toISOString();
        latestSettlement.status = "FAILED";
        latestSettlement.failureCode = error.code;
        latestSettlement.failureMessage = error.message;
        latestSettlement.updatedAt = now;
        transitionPayment(latestPayment, "SETTLEMENT_FAILED", now, error.message);
        await this.store.save(latest);
        return latestPayment;
      }
    });
  }

  async receivePayoutCallback(
    input: {
      callbackId: string;
      paymentId: string;
      reference: string;
      amountInrMinor: number;
      status: "DELIVERED" | "REJECTED";
    },
    idempotencyKey: string,
    callbackSecret: string,
  ): Promise<{ payment: Payment; payout: Payout; receipt?: Receipt }> {
    return this.exclusive(async () => {
      if (callbackSecret !== this.payoutCallbackSecret) throw new UnauthorizedError();
      const database = await this.store.load();
      const requestFingerprint = fingerprint(input);
      const scope = "payout:callback";
      const prior = this.existingIdempotentResource(
        database,
        scope,
        idempotencyKey,
        requestFingerprint,
        database.payments,
      );
      if (prior) {
        const priorPayout = prior.payoutId ? database.payouts[prior.payoutId] : undefined;
        if (!priorPayout) throw new Error("Payment has no payout");
        const priorReceipt = prior.receiptId ? database.receipts[prior.receiptId] : undefined;
        return { payment: prior, payout: priorPayout, ...(priorReceipt ? { receipt: priorReceipt } : {}) };
      }

      const callbackPayout = Object.values(database.payouts).find(
        (item) => item.callbackId === input.callbackId,
      );
      if (callbackPayout) {
        const callbackPayment = database.payments[callbackPayout.paymentId];
        if (
          !callbackPayment ||
          callbackPayment.id !== input.paymentId ||
          callbackPayment.reference !== input.reference ||
          callbackPayout.amountInrMinor !== input.amountInrMinor ||
          callbackPayout.status !== input.status
        ) {
          throw new ConflictError(
            "Payout callback ID was already used with different data",
            "DUPLICATE_CALLBACK_ID",
          );
        }
        const callbackReceipt = callbackPayment.receiptId
          ? database.receipts[callbackPayment.receiptId]
          : undefined;
        this.recordIdempotency(
          database,
          scope,
          idempotencyKey,
          requestFingerprint,
          callbackPayment.id,
        );
        await this.store.save(database);
        return {
          payment: callbackPayment,
          payout: callbackPayout,
          ...(callbackReceipt ? { receipt: callbackReceipt } : {}),
        };
      }

      const payment = database.payments[input.paymentId];
      if (!payment) throw new NotFoundError("Payment");
      const payout = payment.payoutId ? database.payouts[payment.payoutId] : undefined;
      const invoice = database.invoices[payment.invoiceId];
      const settlement = payment.settlementId
        ? database.settlements[payment.settlementId]
        : undefined;
      if (!payout || !invoice || !settlement) {
        throw new ConflictError("Payment is not ready for payout callback");
      }
      if (payment.status !== "PAYOUT_PENDING") {
        throw new ConflictError(
          `Cannot apply payout callback in ${payment.status}`,
          "INVALID_STATE_TRANSITION",
        );
      }
      if (
        input.reference !== payment.reference ||
        input.reference !== invoice.reference ||
        input.reference !== payout.reference
      ) {
        throw new ValidationError("Payout reference does not match the payment and invoice");
      }
      if (input.amountInrMinor !== invoice.amountInrMinor) {
        throw new ValidationError("Payout amount does not match the invoice");
      }
      const now = this.clock().toISOString();
      payout.callbackId = input.callbackId;
      payout.updatedAt = now;
      if (input.status === "REJECTED") {
        payout.status = "REJECTED";
        transitionPayment(payment, "PAYOUT_REJECTED", now);
        this.recordIdempotency(database, scope, idempotencyKey, requestFingerprint, payment.id);
        await this.store.save(database);
        return { payment, payout };
      }

      if (
        settlement.status !== "COMPLETE" ||
        !settlement.transactionHash ||
        !settlement.arcScanUrl
      ) {
        throw new ConflictError("Arc settlement is not complete");
      }
      payout.status = "DELIVERED";
      transitionPayment(payment, "DELIVERED", now, "INR payout callback accepted");
      const receipt: Receipt = {
        id: randomUUID(),
        paymentId: payment.id,
        invoiceId: invoice.id,
        settlementId: settlement.id,
        payoutId: payout.id,
        reference: invoice.reference,
        amountInrMinor: invoice.amountInrMinor,
        amountUsdc: settlement.amountUsdc,
        transactionHash: settlement.transactionHash,
        arcScanUrl: settlement.arcScanUrl,
        deliveredAt: now,
      };
      database.receipts[receipt.id] = receipt;
      payment.receiptId = receipt.id;
      this.recordIdempotency(database, scope, idempotencyKey, requestFingerprint, payment.id);
      await this.store.save(database);
      return { payment, payout, receipt };
    });
  }

  async simulatePayout(
    paymentId: string,
    status: "DELIVERED" | "REJECTED",
    idempotencyKey: string,
  ): Promise<{ payment: Payment; payout: Payout; receipt?: Receipt }> {
    const aggregate = await this.getPayment(paymentId);
    return this.receivePayoutCallback(
      {
        callbackId: `demo-${idempotencyKey}`,
        paymentId,
        reference: aggregate.payment.reference,
        amountInrMinor: aggregate.invoice.amountInrMinor,
        status,
      },
      idempotencyKey,
      this.payoutCallbackSecret,
    );
  }

  async getPayment(paymentId: string): Promise<{
    payment: Payment;
    invoice: Invoice;
    quote: Quote;
    settlement?: Settlement;
    payout?: Payout;
    receipt?: Receipt;
  }> {
    const database = await this.store.load();
    const payment = database.payments[paymentId];
    if (!payment) throw new NotFoundError("Payment");
    const invoice = database.invoices[payment.invoiceId];
    const quote = database.quotes[payment.quoteId];
    if (!invoice || !quote) throw new Error("Payment relations are missing");
    const settlement = payment.settlementId
      ? database.settlements[payment.settlementId]
      : undefined;
    const payout = payment.payoutId ? database.payouts[payment.payoutId] : undefined;
    const receipt = payment.receiptId ? database.receipts[payment.receiptId] : undefined;
    return {
      payment,
      invoice,
      quote,
      ...(settlement ? { settlement } : {}),
      ...(payout ? { payout } : {}),
      ...(receipt ? { receipt } : {}),
    };
  }

  async getReceipt(receiptId: string): Promise<Receipt> {
    const database = await this.store.load();
    const receipt = database.receipts[receiptId];
    if (!receipt) throw new NotFoundError("Receipt");
    return receipt;
  }
}
