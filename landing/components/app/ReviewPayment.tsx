"use client";

import { useEffect, useState } from "react";
import { beneficiary, DRAFT_STORAGE_KEY, formatMoney, inrToAed, SANDBOX_FEE_AED, type PaymentDraft } from "../../lib/app-data";
import { EmptyIcon } from "./Icons";
import { SecondaryLink, SummaryRow } from "./UI";

export function ReviewPayment() {
  const [draft, setDraft] = useState<PaymentDraft | null | undefined>(undefined);
  useEffect(() => {
    try { const saved = localStorage.getItem(DRAFT_STORAGE_KEY); setDraft(saved ? JSON.parse(saved) as PaymentDraft : null); }
    catch { setDraft(null); }
  }, []);
  if (draft === undefined) return <div className="review-loading" aria-label="Loading payment review" />;
  if (!draft) return <section className="missing-draft"><span><EmptyIcon /></span><h2>No payment to review</h2><p>Enter the contractor amount and payment purpose first.</p><SecondaryLink href="/app/pay">Start a payment</SecondaryLink></section>;
  const inr = Number(draft.amountInr);
  const aed = inrToAed(inr);
  return <div className="review-layout"><section className="review-card"><div className="review-hero"><p>Contractor receives</p><strong>{formatMoney(inr, "INR")}</strong><span>Estimated total {formatMoney(aed + SANDBOX_FEE_AED, "AED")}</span></div><dl className="review-summary"><SummaryRow label="Contractor" value={<span>{beneficiary.name}<small>{beneficiary.bank} · {beneficiary.account}</small></span>} /><SummaryRow label="Invoice reference" value={draft.invoiceReference} /><SummaryRow label="Payment purpose" value={draft.purpose} /><SummaryRow label="AED amount" value={formatMoney(aed, "AED")} /><SummaryRow label="INR amount" value={formatMoney(inr, "INR")} /><SummaryRow label="Fees (sandbox estimate)" value={formatMoney(SANDBOX_FEE_AED, "AED")} /><SummaryRow label="Estimated total" value={formatMoney(aed + SANDBOX_FEE_AED, "AED")} emphasis /></dl></section><aside className="route-card"><p className="section-kicker">Payment route</p><h2>Local in, local out</h2><div className="route-step"><span>1</span><div><strong>Pay in AED</strong><p>Studio North funds the payment in the UAE.</p></div></div><div className="route-line" /><div className="route-step"><span>2</span><div><strong>Setula processes payment</strong><p>Settlement infrastructure stays behind the experience.</p></div></div><div className="route-line" /><div className="route-step"><span>3</span><div><strong>Asha receives INR</strong><p>Delivered to the saved HDFC Bank account.</p></div></div><div className="phase2-note"><strong>Backend integration arrives in Phase 2</strong><p>Approval is disabled in this local-only preview. No payment can be executed.</p></div><button className="app-button app-button-primary" type="button" disabled>Approve payment</button><SecondaryLink href="/app/pay">Edit payment</SecondaryLink></aside></div>;
}
