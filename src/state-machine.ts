import type { Payment, PaymentStatus } from "./domain.js";
import { ConflictError } from "./errors.js";

const transitions: Record<PaymentStatus, ReadonlySet<PaymentStatus>> = {
  DRAFT: new Set(["QUOTED"]),
  QUOTED: new Set(["FUNDED"]),
  FUNDED: new Set(["SETTLEMENT_PENDING"]),
  SETTLEMENT_PENDING: new Set(["SETTLED", "SETTLEMENT_FAILED"]),
  SETTLED: new Set(["PAYOUT_PENDING"]),
  PAYOUT_PENDING: new Set(["DELIVERED", "PAYOUT_REJECTED"]),
  DELIVERED: new Set(),
  SETTLEMENT_FAILED: new Set(["REFUND_PENDING"]),
  PAYOUT_REJECTED: new Set(["REFUND_PENDING"]),
  REFUND_PENDING: new Set(["REFUNDED"]),
  REFUNDED: new Set(),
};

export function canTransition(from: PaymentStatus, to: PaymentStatus): boolean {
  return transitions[from].has(to);
}

export function transitionPayment(
  payment: Payment,
  to: PaymentStatus,
  at: string,
  detail?: string,
): void {
  if (!canTransition(payment.status, to)) {
    throw new ConflictError(
      `Invalid payment state transition: ${payment.status} -> ${to}`,
      "INVALID_STATE_TRANSITION",
    );
  }
  payment.status = to;
  payment.updatedAt = at;
  payment.timeline.push({ status: to, at, ...(detail ? { detail } : {}) });
}
