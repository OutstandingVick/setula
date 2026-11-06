import Link from "next/link";
import { AppShell } from "../../../../components/app/AppShell";
import { BackIcon } from "../../../../components/app/Icons";
import { ReviewPayment } from "../../../../components/app/ReviewPayment";
import { AppHeader } from "../../../../components/app/UI";

export default function ReviewPage() { return <AppShell current="payments"><Link href="/app/pay" className="back-link"><BackIcon />Edit payment</Link><AppHeader eyebrow="Final check" title="Review payment" description="Confirm the contractor, invoice, and estimated AED total." /><ReviewPayment /></AppShell>; }
