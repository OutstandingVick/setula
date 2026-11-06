"use client";

import { useEffect, useState } from "react";
import { inrToAed, PAYMENTS_STORAGE_KEY, type LocalPayment } from "../../lib/app-data";
import { AppHeader, BeneficiaryCard, CurrencyAmount, EmptyState, PaymentListItem, PrimaryLink } from "./UI";

export function Dashboard() {
  const [payments, setPayments] = useState<LocalPayment[] | null>(null);
  useEffect(() => {
    try { setPayments(JSON.parse(localStorage.getItem(PAYMENTS_STORAGE_KEY) ?? "[]") as LocalPayment[]); }
    catch { setPayments([]); }
  }, []);
  const count = payments?.length ?? 0;
  const total = payments?.reduce((sum, payment) => sum + Number(payment.amountInr || 0), 0) ?? 0;
  return <>
    <AppHeader eyebrow="Friday, 6 November" title="Good morning, Studio North" description="Pay your international contractors with a clear AED total and local-currency delivery." action={<PrimaryLink href="/app/pay">Pay contractor</PrimaryLink>} />
    <section className="summary-grid" aria-label="Payment summary"><CurrencyAmount label="Estimated AED total" amount={inrToAed(total)} currency="AED" /><CurrencyAmount label="Contractor receives" amount={total} currency="INR" /><div className="summary-note"><span>Payment corridor</span><strong>UAE → India</strong><small>{count} prepared · AED payment · INR delivery</small></div></section>
    <div className="dashboard-grid"><BeneficiaryCard /><section className="recent-card" id="payments" aria-labelledby="recent-title"><div className="section-heading"><div><p className="section-kicker">Activity</p><h2 id="recent-title">Recent payments</h2></div><span>{count} total</span></div>{payments === null ? <div className="loading-block" aria-label="Loading payments" /> : payments.length ? <div className="payment-list">{payments.map(payment => <PaymentListItem key={payment.id} payment={payment} />)}</div> : <EmptyState />}</section></div>
  </>;
}
