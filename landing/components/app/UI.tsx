import Link from "next/link";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";
import { ArrowIcon, EmptyIcon } from "./Icons";
import type { PaymentAggregate, PaymentStatus } from "../../lib/setula-api";
import { beneficiary, formatDate, formatMoney } from "../../lib/app-data";

export function AppHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return <header className="app-header"><div>{eyebrow && <p className="app-eyebrow">{eyebrow}</p>}<h1>{title}</h1>{description && <p className="app-description">{description}</p>}</div>{action}</header>;
}

export function PrimaryLink({ href, children }: { href: string; children: ReactNode }) {
  return <Link className="app-button app-button-primary" href={href}>{children}<ArrowIcon /></Link>;
}

export function SecondaryLink({ href, children }: { href: string; children: ReactNode }) {
  return <Link className="app-button app-button-secondary" href={href}>{children}</Link>;
}

export function PrimaryButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className="app-button app-button-primary" {...props}>{props.children}<ArrowIcon /></button>;
}

export function CurrencyAmount({ amount, currency, label }: { amount: number; currency: "AED" | "INR"; label: string }) {
  return <div className="currency-amount"><span>{label}</span><strong>{formatMoney(amount, currency)}</strong></div>;
}

export function BeneficiaryCard({ compact = false }: { compact?: boolean }) {
  return <section className={`beneficiary-card${compact ? " beneficiary-card-compact" : ""}`} id="contractor" aria-labelledby="beneficiary-title">
    <div className="beneficiary-heading"><div className="app-avatar" aria-hidden="true">{beneficiary.initials}</div><div><p className="section-kicker">Beneficiary</p><h2 id="beneficiary-title">{beneficiary.name}</h2><p>{beneficiary.role}</p></div><span className="verified-mark">Verified</span></div>
    <dl className="beneficiary-details"><div><dt>Bank</dt><dd>{beneficiary.bank}</dd></div><div><dt>Account</dt><dd>{beneficiary.account}</dd></div><div><dt>Location</dt><dd>{beneficiary.location}</dd></div></dl>
  </section>;
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const label = status.replaceAll("_", " ").toLowerCase().replace(/^./, value => value.toUpperCase());
  return <span className="status-badge" data-status={status}><span aria-hidden="true" />{label}</span>;
}

export function PaymentListItem({ aggregate }: { aggregate: PaymentAggregate }) {
  return <Link className="payment-list-item" href={`/app/pay/${aggregate.payment.id}`}><div className="payment-list-avatar">AR</div><div className="payment-list-copy"><strong>Asha Rao</strong><span>{aggregate.payment.reference} · {formatDate(aggregate.payment.createdAt)}</span></div><div className="payment-list-value"><strong>{formatMoney(aggregate.invoice.amountInrMinor / 100, "INR")}</strong><PaymentStatusBadge status={aggregate.payment.status} /></div></Link>;
}

export function EmptyState() {
  return <div className="empty-state"><span className="empty-icon"><EmptyIcon /></span><h3>No payments yet</h3><p>Your contractor payments will appear here after you prepare them.</p><SecondaryLink href="/app/pay">Create your first payment</SecondaryLink></div>;
}

type FieldProps = { label: string; hint?: string; error?: string } & InputHTMLAttributes<HTMLInputElement>;
export function FormField({ label, hint, error, ...props }: FieldProps) {
  const hintId = props.id ? `${props.id}-hint` : undefined;
  const errorId = props.id ? `${props.id}-error` : undefined;
  return <div className="form-field"><label htmlFor={props.id}>{label}</label><input aria-describedby={error ? errorId : hint ? hintId : undefined} aria-invalid={Boolean(error)} {...props} />{error ? <p className="field-message field-error" id={errorId}>{error}</p> : hint ? <p className="field-message" id={hintId}>{hint}</p> : null}</div>;
}

export function SummaryRow({ label, value, emphasis = false }: { label: string; value: ReactNode; emphasis?: boolean }) {
  return <div className={`summary-row${emphasis ? " summary-row-emphasis" : ""}`}><dt>{label}</dt><dd>{value}</dd></div>;
}

export function ErrorState({ title, message, onRetry }: { title: string; message: string; onRetry?: () => void }) {
  return <div className="error-state" role="alert"><h2>{title}</h2><p>{message}</p>{onRetry && <button className="app-button app-button-secondary" type="button" onClick={onRetry}>Try again</button>}</div>;
}
