import { beneficiary, type PaymentDraft } from "./app-data";
import type { PaymentAggregate, PaymentStatus, SetulaApi } from "./setula-api";

export async function preparePayment(api: SetulaApi, initial: PaymentDraft, persist: (draft: PaymentDraft) => void): Promise<PaymentAggregate> {
  const draft = { ...initial };
  if (!draft.beneficiaryId) { draft.beneficiaryId = (await api.createBeneficiary({ name: beneficiary.name, email: beneficiary.email, bankAccountLast4: beneficiary.bankAccountLast4 }, draft.keys.beneficiary)).id; persist(draft); }
  if (!draft.invoiceId) { draft.invoiceId = (await api.createInvoice({ beneficiaryId: draft.beneficiaryId, reference: draft.invoiceReference, amountInrMinor: Math.round(Number(draft.amountInr) * 100), description: draft.purpose }, draft.keys.invoice)).id; persist(draft); }
  if (!draft.quoteId) { draft.quoteId = (await api.createQuote(draft.invoiceId, draft.keys.quote)).id; persist(draft); }
  if (!draft.paymentId) { draft.paymentId = (await api.createPayment({ invoiceId: draft.invoiceId, quoteId: draft.quoteId }, draft.keys.payment)).id; persist(draft); }
  return api.getPayment(draft.paymentId);
}

export type ProgressStage = { key: string; label: string; state: "complete" | "current" | "pending" | "failed"; at?: string };
const stages: Array<{ key: string; label: string; statuses: PaymentStatus[] }> = [
  { key: "quote", label: "Quote created", statuses: ["QUOTED"] }, { key: "funding", label: "AED funding confirmed", statuses: ["FUNDED"] },
  { key: "submitted", label: "USDC settlement submitted", statuses: ["SETTLEMENT_PENDING"] }, { key: "confirmed", label: "USDC settlement confirmed", statuses: ["SETTLED"] },
  { key: "payout", label: "INR payout pending", statuses: ["PAYOUT_PENDING"] }, { key: "delivered", label: "Payment delivered", statuses: ["DELIVERED"] },
];
export function buildProgressStages(aggregate: PaymentAggregate): ProgressStage[] {
  const timeline = aggregate.payment.timeline; const failed = aggregate.payment.status === "SETTLEMENT_FAILED"; let reached = -1;
  return stages.map((stage, index) => { const entry = timeline.find(item => stage.statuses.includes(item.status)); if (entry) reached = index; if (failed && index === Math.max(2, reached + 1)) return { key: stage.key, label: stage.label, state: "failed", at: aggregate.settlement?.updatedAt }; if (entry) return { key: stage.key, label: stage.label, state: "complete", at: entry.at }; return { key: stage.key, label: stage.label, state: index === reached + 1 ? "current" : "pending" }; });
}
export function canCompletePayout(aggregate: PaymentAggregate) { return aggregate.payment.status === "PAYOUT_PENDING" && aggregate.settlement?.status === "COMPLETE"; }
export function hasSettlementEvidence(aggregate: PaymentAggregate) { return aggregate.settlement?.status === "COMPLETE" && Boolean(aggregate.settlement.transactionHash && aggregate.settlement.arcScanUrl); }
