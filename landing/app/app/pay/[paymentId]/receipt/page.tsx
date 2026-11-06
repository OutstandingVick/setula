import Link from "next/link";
import { AppShell } from "../../../../../components/app/AppShell";
import { BackIcon } from "../../../../../components/app/Icons";
import { PaymentReceipt } from "../../../../../components/app/PaymentReceipt";
import { AppHeader } from "../../../../../components/app/UI";
export default async function ReceiptPage({ params }: { params: Promise<{ paymentId: string }> }) { const { paymentId } = await params; return <AppShell current="payments"><Link href={`/app/pay/${paymentId}`} className="back-link"><BackIcon />Back to payment</Link><AppHeader eyebrow="Payment record" title="Receipt" description="Invoice, payment, delivery, and settlement evidence in one record." /><PaymentReceipt paymentId={paymentId} /></AppShell>; }
