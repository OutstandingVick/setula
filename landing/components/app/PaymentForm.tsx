"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { beneficiary, DRAFT_STORAGE_KEY, inrToAed, PAYMENTS_STORAGE_KEY, type LocalPayment, type PaymentDraft } from "../../lib/app-data";
import { BeneficiaryCard, FormField, PrimaryButton } from "./UI";

function cleanAmount(value: string) {
  const normalized = value.replace(/[^\d.]/g, "");
  const [whole = "", ...decimals] = normalized.split(".");
  return decimals.length ? `${whole}.${decimals.join("").slice(0, 2)}` : whole;
}

export function PaymentForm() {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const estimate = useMemo(() => inrToAed(Number(amount) || 0), [amount]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) { setError("Enter an INR amount greater than zero."); return; }
    setLoading(true);
    const draft: PaymentDraft = { amountInr: Number(amount).toFixed(2), purpose: purpose.trim(), invoiceReference: `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`, createdAt: new Date().toISOString() };
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    const saved = JSON.parse(localStorage.getItem(PAYMENTS_STORAGE_KEY) ?? "[]") as LocalPayment[];
    localStorage.setItem(PAYMENTS_STORAGE_KEY, JSON.stringify([{ ...draft, id: crypto.randomUUID(), status: "Ready for review" }, ...saved].slice(0, 5)));
    router.push("/app/pay/review");
  }

  return <form className="payment-form" onSubmit={submit} noValidate>
    <section className="amount-panel"><label htmlFor="amount">Contractor receives</label><div className="amount-input-row"><span aria-hidden="true">₹</span><input id="amount" name="amount" value={amount} onChange={e => { setAmount(cleanAmount(e.target.value)); setError(""); }} inputMode="decimal" autoComplete="off" placeholder="0.00" aria-describedby="amount-estimate amount-error" aria-invalid={Boolean(error)} /><span className="currency-fixed">INR</span></div><p id="amount-estimate">Estimated AED payment <strong>{new Intl.NumberFormat("en-AE", { style: "currency", currency: "AED" }).format(estimate)}</strong></p>{error && <p className="field-message field-error" id="amount-error">{error}</p>}</section>
    <BeneficiaryCard compact />
    <FormField id="purpose" name="purpose" label="Payment purpose" value={purpose} onChange={e => setPurpose(e.target.value)} placeholder="e.g. October design services" hint={`This description will appear with ${beneficiary.name}'s payment.`} required />
    <div className="form-disclosure"><span>Sandbox estimate</span><p>The AED amount is indicative for Phase 1. No funds will move.</p></div>
    <PrimaryButton type="submit" disabled={loading}>{loading ? "Opening review…" : "Review payment"}</PrimaryButton>
  </form>;
}
