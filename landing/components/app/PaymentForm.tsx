"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { beneficiary, createOperationKeys, saveDraft, type PaymentDraft } from "../../lib/app-data";
import { BeneficiaryCard, FormField, PrimaryButton } from "./UI";

function cleanAmount(value: string) {
  const normalized = value.replace(/[^\d.]/g, "");
  const [whole = "", ...decimals] = normalized.split(".");
  return decimals.length ? `${whole}.${decimals.join("").slice(0, 2)}` : whole;
}

export function validatePaymentInput(amount: string, purpose: string) {
  const numericAmount = Number(amount);
  return {
    amount: !Number.isFinite(numericAmount) || numericAmount <= 0 ? "Enter an INR amount greater than zero." : numericAmount > 99_999_999.99 ? "Enter an amount below INR 100,000,000." : "",
    purpose: purpose.trim() ? "" : "Enter a payment purpose before continuing.",
  };
}

export function PaymentForm() {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("");
  const [errors, setErrors] = useState({ amount: "", purpose: "" });
  const [loading, setLoading] = useState(false);
  const estimate = useMemo(() => (Number(amount) || 0) / 22.75, [amount]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validatePaymentInput(amount, purpose);
    setErrors(nextErrors);
    if (nextErrors.amount || nextErrors.purpose) return;
    setLoading(true);
    const draft: PaymentDraft = { amountInr: Number(amount).toFixed(2), purpose: purpose.trim(), invoiceReference: `INV-SETULA-${crypto.randomUUID().slice(0, 8).toUpperCase()}`, createdAt: new Date().toISOString(), keys: createOperationKeys() };
    saveDraft(draft);
    router.push("/app/pay/review");
  }

  return <form className="payment-form" onSubmit={submit} noValidate>
    <section className="amount-panel"><label htmlFor="amount">Contractor receives</label><div className="amount-input-row"><span aria-hidden="true">₹</span><input id="amount" name="amount" value={amount} onChange={e => { setAmount(cleanAmount(e.target.value)); setErrors(current => ({ ...current, amount: "" })); }} inputMode="decimal" autoComplete="off" placeholder="0.00" aria-describedby={errors.amount ? "amount-error" : "amount-estimate"} aria-invalid={Boolean(errors.amount)} /><span className="currency-fixed">INR</span></div><p id="amount-estimate">Estimated AED payment <strong>{new Intl.NumberFormat("en-AE", { style: "currency", currency: "AED" }).format(estimate)}</strong></p>{errors.amount && <p className="field-message field-error" id="amount-error">{errors.amount}</p>}</section>
    <BeneficiaryCard compact />
    <FormField id="purpose" name="purpose" label="Payment purpose" value={purpose} onChange={e => { setPurpose(e.target.value); setErrors(current => ({ ...current, purpose: "" })); }} placeholder="e.g. October design services" hint={`This description will appear with ${beneficiary.name}'s payment.`} error={errors.purpose} required />
    <div className="form-disclosure"><span>Sandbox estimate</span><p>The backend will return the authoritative AED quote on the next screen.</p></div>
    <PrimaryButton type="submit" disabled={loading}>{loading ? "Opening review…" : "Review payment"}</PrimaryButton>
  </form>;
}
