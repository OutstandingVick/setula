import { AppShell } from "../../../components/app/AppShell";
import { BackIcon } from "../../../components/app/Icons";
import { AppHeader } from "../../../components/app/UI";
import { PaymentForm } from "../../../components/app/PaymentForm";
import Link from "next/link";

export default function PayContractorPage() { return <AppShell current="payments"><Link href="/app" className="back-link"><BackIcon />Back to home</Link><AppHeader eyebrow="New payment" title="Pay contractor" description="Enter the exact amount Asha should receive in Indian rupees." /><PaymentForm /></AppShell>; }
