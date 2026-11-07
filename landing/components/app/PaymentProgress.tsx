"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { buildProgressStages, canCompletePayout, hasSettlementEvidence } from "../../lib/payment-flow";
import { formatMoney, paymentOperationKey, rememberPaymentId } from "../../lib/app-data";
import { setulaApi, type PaymentAggregate } from "../../lib/setula-api";
import { ErrorState, PaymentStatusBadge, SummaryRow } from "./UI";
import { CopyValueButton } from "./CopyValueButton";

function time(value?: string) { return value ? new Intl.DateTimeFormat("en-AE", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" }).format(new Date(value)) : "Waiting"; }

export function PaymentProgress({ paymentId }: { paymentId: string }) {
  const started = useRef(false);
  const mounted = useRef(true);
  const [aggregate, setAggregate] = useState<PaymentAggregate | null>(null);
  const [loading, setLoading] = useState(true); const [busy, setBusy] = useState(""); const [error, setError] = useState("");
  const load = useCallback(async () => {
    try { const next = await setulaApi.getPayment(paymentId); if (mounted.current) { setAggregate(next); rememberPaymentId(paymentId); setError(""); } return next; }
    catch (cause) { if (mounted.current) setError(cause instanceof Error ? cause.message : "Unable to load payment. Check the connection and try again."); return null; }
    finally { if (mounted.current) setLoading(false); }
  }, [paymentId]);
  useEffect(() => () => { mounted.current = false; }, []);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    if (!aggregate || started.current || !["FUNDED", "SETTLEMENT_PENDING"].includes(aggregate.payment.status)) return;
    started.current = true; setBusy("Submitting settlement");
    void setulaApi.executeSettlement(paymentId, paymentOperationKey(paymentId, "settlement"))
      .then(() => mounted.current ? load() : null).catch(cause => { if (mounted.current) setError(cause instanceof Error ? `${cause.message} The original transfer key will be reused when you retry.` : "Settlement timed out. Retry safely with the same payment."); })
      .finally(() => { if (mounted.current) setBusy(""); });
  }, [aggregate, load, paymentId]);
  useEffect(() => { if (aggregate?.payment.status !== "SETTLEMENT_PENDING") return; const timer = window.setInterval(() => void load(), 2500); return () => window.clearInterval(timer); }, [aggregate?.payment.status, load]);
  async function retrySettlement() { started.current = false; setError(""); const current = await load(); if (current && ["FUNDED", "SETTLEMENT_PENDING"].includes(current.payment.status)) setAggregate({ ...current }); }
  async function completePayout() {
    if (!aggregate || busy) return; setBusy("Confirming INR delivery"); setError("");
    try { await setulaApi.completePayout(paymentId, paymentOperationKey(paymentId, "payout")); await load(); }
    catch (cause) { setError(cause instanceof Error ? `${cause.message} Confirm the payment is settled, then retry delivery.` : "Delivery confirmation failed. Retry after checking settlement status."); }
    finally { setBusy(""); }
  }
  if (loading) return <div className="progress-loading" role="status" aria-label="Loading payment progress" />;
  if (!aggregate) return <ErrorState title="Payment unavailable" message={error || "This payment could not be loaded."} onRetry={() => void load()} />;
  const failed = aggregate.payment.status === "SETTLEMENT_FAILED"; const evidence = hasSettlementEvidence(aggregate);
  return <div className="progress-layout">
    <section className="progress-card">
      <div className="progress-heading"><div><p className="section-kicker">{aggregate.payment.reference}</p><h2>Payment progress</h2></div><PaymentStatusBadge status={aggregate.payment.status} /></div>
      <div className="progress-stages" role="status" aria-live="polite">{buildProgressStages(aggregate).map(stage => <div className="progress-stage" data-state={stage.state} key={stage.key}><span className="stage-icon" aria-hidden="true">{stage.state === "complete" ? "✓" : stage.state === "failed" ? "!" : "·"}</span><div><strong>{stage.label}</strong><small>{stage.state === "failed" ? "Failed" : stage.state === "current" ? "In progress" : stage.state === "pending" ? "Pending" : time(stage.at)}</small></div></div>)}</div>
      {busy && <p className="operation-status" role="status">{busy}…</p>}
      {error && <div className="inline-error" role="alert"><strong>{failed ? "Insufficient USDC balance" : "Payment update paused"}</strong><p>{failed ? aggregate.settlement?.failureMessage ?? "The settlement wallet has insufficient USDC. No transfer was submitted." : error}</p>{!failed && <button type="button" className="app-button app-button-secondary" onClick={() => void retrySettlement()}>Retry settlement safely</button>}</div>}
      {failed && !error && <div className="inline-error" role="alert"><strong>Insufficient USDC balance</strong><p>{aggregate.settlement?.failureMessage ?? "The settlement wallet cannot cover this payment. No transfer was submitted and no payout is available."}</p></div>}
    </section>
    <aside className="evidence-card"><p className="section-kicker">Payment details</p><dl><SummaryRow label="AED funded" value={formatMoney(aggregate.quote.amountAedMinor / 100, "AED")} /><SummaryRow label="INR delivery" value={formatMoney(aggregate.invoice.amountInrMinor / 100, "INR")} /><SummaryRow label="USDC settlement" value={`${aggregate.quote.usdcAmount} USDC`} /></dl>
      {aggregate.settlement?.circleTransactionId && <div className="circle-status"><span>Circle status</span><strong>{aggregate.settlement.status}</strong></div>}
      {evidence && aggregate.settlement?.transactionHash && <div className="settlement-evidence"><span>Transaction hash</span><div className="copy-value"><code title={aggregate.settlement.transactionHash}>{aggregate.settlement.transactionHash}</code><CopyValueButton value={aggregate.settlement.transactionHash} /></div><a href={aggregate.settlement.arcScanUrl} target="_blank" rel="noopener noreferrer">View confirmed transaction on ArcScan</a></div>}
      {canCompletePayout(aggregate) && <button className="app-button app-button-primary" type="button" disabled={Boolean(busy)} onClick={() => void completePayout()}>{busy ? "Confirming delivery…" : "Confirm INR delivery"}</button>}
      {aggregate.payment.status === "DELIVERED" && aggregate.payment.receiptId && <Link className="app-button app-button-primary" href={`/app/pay/${encodeURIComponent(paymentId)}/receipt`}>View payment receipt</Link>}
    </aside>
  </div>;
}
