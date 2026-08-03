export const paymentStatuses = [
  "DRAFT",
  "QUOTED",
  "FUNDED",
  "SETTLEMENT_PENDING",
  "SETTLED",
  "PAYOUT_PENDING",
  "DELIVERED",
  "SETTLEMENT_FAILED",
  "PAYOUT_REJECTED",
  "REFUND_PENDING",
  "REFUNDED",
] as const;

export type PaymentStatus = (typeof paymentStatuses)[number];

export type TimelineEntry = {
  status: PaymentStatus;
  at: string;
  detail?: string;
};

export type Beneficiary = {
  id: string;
  reference: string;
  name: string;
  email: string;
  bankAccountLast4: string;
  createdAt: string;
};

export type Invoice = {
  id: string;
  beneficiaryId: string;
  reference: string;
  amountInrMinor: number;
  description: string;
  createdAt: string;
};

export type Quote = {
  id: string;
  invoiceId: string;
  reference: string;
  amountInrMinor: number;
  rateInrPerAed: string;
  amountAedMinor: number;
  usdcAmount: string;
  expiresAt: string;
  createdAt: string;
};

export type Payment = {
  id: string;
  invoiceId: string;
  quoteId: string;
  reference: string;
  status: PaymentStatus;
  timeline: TimelineEntry[];
  settlementId?: string;
  payoutId?: string;
  receiptId?: string;
  createdAt: string;
  updatedAt: string;
};

export type Settlement = {
  id: string;
  paymentId: string;
  reference: string;
  idempotencyKey: string;
  amountUsdc: string;
  status: "PENDING" | "COMPLETE" | "FAILED";
  circleTransactionId?: string;
  transactionHash?: string;
  arcScanUrl?: string;
  failureCode?: string;
  failureMessage?: string;
  createdAt: string;
  updatedAt: string;
};

export type Payout = {
  id: string;
  paymentId: string;
  reference: string;
  amountInrMinor: number;
  status: "PENDING" | "DELIVERED" | "REJECTED";
  callbackId?: string;
  createdAt: string;
  updatedAt: string;
};

export type Receipt = {
  id: string;
  paymentId: string;
  invoiceId: string;
  settlementId: string;
  payoutId: string;
  reference: string;
  amountInrMinor: number;
  amountUsdc: string;
  transactionHash: string;
  arcScanUrl: string;
  deliveredAt: string;
};

export type IdempotencyRecord = {
  scope: string;
  key: string;
  fingerprint: string;
  resourceId: string;
};

export type Database = {
  beneficiaries: Record<string, Beneficiary>;
  invoices: Record<string, Invoice>;
  quotes: Record<string, Quote>;
  payments: Record<string, Payment>;
  settlements: Record<string, Settlement>;
  payouts: Record<string, Payout>;
  receipts: Record<string, Receipt>;
  idempotency: Record<string, IdempotencyRecord>;
};

export function emptyDatabase(): Database {
  return {
    beneficiaries: {},
    invoices: {},
    quotes: {},
    payments: {},
    settlements: {},
    payouts: {},
    receipts: {},
    idempotency: {},
  };
}
