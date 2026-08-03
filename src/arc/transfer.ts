import type { CircleDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";
import { formatUsdc, parseUsdc } from "./amount.js";
import { getUsdcBalance } from "./circle.js";
import {
  explorerTransactionUrl,
  loadRuntimeConfig,
  type WalletState,
} from "./config.js";

export type TransferEvidence = {
  circleTransactionId: string;
  transactionHash: string;
  explorerUrl: string;
};

export function isSuccessfulState(state: string): boolean {
  return state === "COMPLETE";
}

// This is the proven sendOneTransfer flow from setula-arc-spike/src/transfer.ts,
// narrowed only to the evidence required by the backend.
export async function sendOneTransfer(
  client: CircleDeveloperControlledWalletsClient,
  wallets: WalletState,
  options: { paymentId: string; idempotencyKey: string; amount: string },
): Promise<TransferEvidence> {
  const expectedBaseUnits = parseUsdc(options.amount);
  if (expectedBaseUnits <= 0n) throw new Error("Transfer amount must be positive");

  const [senderBefore, recipientBefore] = await Promise.all([
    getUsdcBalance(client, wallets.walletA.id),
    getUsdcBalance(client, wallets.walletB.id),
  ]);
  if (senderBefore.baseUnits < expectedBaseUnits) {
    throw new Error(
      `Insufficient Wallet A USDC before submission: ${senderBefore.amount} < ${options.amount}`,
    );
  }
  if (!senderBefore.tokenId) {
    throw new Error("Circle did not return the Arc USDC token ID for Wallet A");
  }

  const created = await client.createTransaction({
    walletId: wallets.walletA.id,
    tokenId: senderBefore.tokenId,
    amount: [options.amount],
    destinationAddress: wallets.walletB.address,
    fee: { type: "level", config: { feeLevel: "MEDIUM" } },
    refId: options.paymentId,
    idempotencyKey: options.idempotencyKey,
  });
  const circleTransactionId = created.data?.id;
  if (!circleTransactionId) throw new Error("Circle did not return a transaction ID");

  const runtime = loadRuntimeConfig();
  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(new Error("Circle transaction polling timed out")),
    runtime.POLL_TIMEOUT_MS,
  );
  let transaction;
  try {
    const response = await client.getTransaction({
      id: circleTransactionId,
      waitForState: "COMPLETE",
      pollingInterval: runtime.POLL_INTERVAL_MS,
      signal: controller.signal,
    });
    transaction = response.data?.transaction;
  } finally {
    clearTimeout(timer);
  }

  if (!transaction || !isSuccessfulState(transaction.state)) {
    throw new Error(
      `Circle transaction ${circleTransactionId} was not successful (state: ${transaction?.state ?? "missing"})`,
    );
  }
  if (!transaction.txHash) {
    throw new Error(
      `Circle transaction ${circleTransactionId} completed without a transaction hash`,
    );
  }

  const recipientAfter = await getUsdcBalance(client, wallets.walletB.id);
  const recipientDelta = recipientAfter.baseUnits - recipientBefore.baseUnits;
  // A retry after a process crash can recover Circle's original COMPLETE
  // transaction using the persisted idempotency key. In that case its balance
  // effect predates recipientBefore, so a zero delta is expected on reconciliation.
  if (recipientDelta !== expectedBaseUnits && recipientDelta !== 0n) {
    throw new Error(
      `Recipient balance delta mismatch: expected ${options.amount}, observed ${formatUsdc(recipientDelta)}`,
    );
  }

  return {
    circleTransactionId,
    transactionHash: transaction.txHash,
    explorerUrl: explorerTransactionUrl(transaction.txHash),
  };
}
