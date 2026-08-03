import { InsufficientBalanceError } from "./errors.js";
import { createCircleClient } from "./arc/circle.js";
import { loadWalletState } from "./arc/config.js";
import { sendOneTransfer } from "./arc/transfer.js";

export type SettlementRequest = {
  paymentId: string;
  idempotencyKey: string;
  amountUsdc: string;
};

export type SettlementResult = {
  circleTransactionId: string;
  transactionHash: string;
  arcScanUrl: string;
};

export interface SettlementGateway {
  transfer(request: SettlementRequest): Promise<SettlementResult>;
}

export class ArcCircleSettlementGateway implements SettlementGateway {
  async transfer(request: SettlementRequest): Promise<SettlementResult> {
    try {
      const evidence = await sendOneTransfer(
        createCircleClient(),
        loadWalletState(),
        {
          paymentId: request.paymentId,
          idempotencyKey: request.idempotencyKey,
          amount: request.amountUsdc,
        },
      );
      return {
        circleTransactionId: evidence.circleTransactionId,
        transactionHash: evidence.transactionHash,
        arcScanUrl: evidence.explorerUrl,
      };
    } catch (error) {
      const candidate = error as Error & { code?: string | number };
      if (
        candidate.code === 155258 ||
        /insufficient/i.test(candidate.message)
      ) {
        throw new InsufficientBalanceError(candidate.message);
      }
      throw error;
    }
  }
}
