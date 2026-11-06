import Link from "next/link";
import { AppShell } from "../../../../components/app/AppShell";
import { BackIcon } from "../../../../components/app/Icons";
import { PaymentProgress } from "../../../../components/app/PaymentProgress";
import { AppHeader } from "../../../../components/app/UI";
export default async function PaymentProgressPage({ params }: { params: Promise<{ paymentId: string }> }) { const { paymentId } = await params; return <AppShell current="payments"><Link href="/app" className="back-link"><BackIcon />Back to payments</Link><AppHeader eyebrow="Live payment" title="Payment progress" description="Setula uses the backend record as the source of truth for every stage." /><PaymentProgress paymentId={paymentId} /></AppShell>; }
