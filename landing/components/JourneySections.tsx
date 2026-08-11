import {
  ArrowRightLeft,
  CircleCheck,
  CircleDollarSign,
  CircleX,
  CopyCheck,
  FileText,
  Gauge,
  ScanSearch,
  ShieldCheck,
  Webhook,
} from "lucide-react";
import { SettlementVisual } from "./SettlementVisual";

type FinalCtaProps = { demoUrl: string };

const journeySteps = [
  {
    number: "01",
    icon: FileText,
    title: "Enter the invoice",
    copy: "Set the exact amount the contractor should receive.",
    tag: "AED funding · simulated",
  },
  {
    number: "02",
    icon: ArrowRightLeft,
    title: "Settle through Arc",
    copy: "USDC moves between institutional payment partners under the hood.",
    tag: "Arc settlement · real",
  },
  {
    number: "03",
    icon: CircleCheck,
    title: "Deliver local currency",
    copy: "The contractor receives INR while the business receives one reconciled record.",
    tag: "INR payout · simulated",
  },
] as const;

const safetyRules = [
  {
    icon: CopyCheck,
    title: "Duplicate protected",
    copy: "One payment cannot create two Arc transfers, even when a request is repeated.",
  },
  {
    icon: CircleX,
    title: "Failed means failed",
    copy: "Insufficient USDC balance produces SETTLEMENT_FAILED, never a misleading settled state.",
  },
  {
    icon: Webhook,
    title: "Delivery is callback-gated",
    copy: "The payment reaches DELIVERED only after the authenticated payout callback succeeds.",
  },
] as const;

const infrastructureLayers = [
  "Quote engine",
  "Payment-purpose rules",
  "Settlement adapter",
  "Payout adapter",
  "Ledger and reconciliation",
  "Recovery workflows",
] as const;

const futureApplications = ["Contractor payouts", "Supplier payments", "Tuition payments", "Family remittances"] as const;

const arcReasons = [
  {
    icon: CircleDollarSign,
    title: "USDC settlement",
    copy: "The demonstrated payment moves USDC between payment-partner wallets on Arc Testnet.",
  },
  {
    icon: Gauge,
    title: "Predictable dollar costs",
    copy: "Settlement value and network costs remain legible in dollar-denominated terms.",
  },
  {
    icon: ShieldCheck,
    title: "Deterministic confirmation",
    copy: "The payment advances only after Circle reports the successful terminal transaction state.",
  },
  {
    icon: ScanSearch,
    title: "Verifiable evidence",
    copy: "A transaction hash and ArcScan record make settlement machine-checkable and publicly inspectable.",
  },
] as const;

export function HowItWorks() {
  return (
    <section className="section-shell journey-section" id="how-it-works" aria-labelledby="how-it-works-title">
      <h2 className="sr-only" id="how-it-works-title">How Setula works</h2>

      <div className="journey-highlights">
        {journeySteps.map((step) => {
          const Icon = step.icon;
          return (
            <article className="journey-highlight" key={step.number}>
              <span className="journey-orb" aria-hidden="true">
                <Icon strokeWidth={1.8} />
              </span>
              <h3>{step.title}</h3>
              <p>{step.copy}</p>
              <span className={step.number === "02" ? "journey-scope journey-scope-real" : "journey-scope"}>{step.tag}</span>
            </article>
          );
        })}
      </div>

      <div className="journey-feature">
        <div className="journey-feature-copy">
          <h3>Settled. Delivered. Verified.</h3>
          <p>
            Setula keeps funding, Arc settlement and local payout as separate states.
            Finance teams can see exactly where a payment is—and prove it with one reconciled record.
          </p>
          <a className="button journey-proof-button" href="https://testnet.arcscan.app/tx/0x347ac773f6d280952fb84ad41347e0e8f543bc93262465904e0e55db022d4900">
            View the ArcScan proof
          </a>
        </div>
        <div className="journey-feature-visual">
          <SettlementVisual />
        </div>
      </div>

      <div className="safeguard-grid">
        {safetyRules.map((rule) => {
          const Icon = rule.icon;
          return (
            <article className="safeguard" key={rule.title}>
              <span className="safeguard-orb" aria-hidden="true">
                <Icon strokeWidth={1.8} />
              </span>
              <h3>{rule.title}</h3>
              <p>{rule.copy}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function Infrastructure() {
  return (
    <section className="section-shell infrastructure-section" id="infrastructure" aria-labelledby="infrastructure-title">
      <div className="section-heading section-heading-light">
        <p className="eyebrow">Infrastructure</p>
        <h2 id="infrastructure-title">One settlement layer. Multiple payment products.</h2>
        <p>Setula separates product-specific payment rules from reusable settlement, payout, evidence, and recovery components.</p>
      </div>
      <div className="infrastructure-grid">
        <div className="layer-stack" aria-label="Reusable Setula infrastructure layers">
          {infrastructureLayers.map((layer, index) => (
            <div key={layer}><span>{String(index + 1).padStart(2, "0")}</span><strong>{layer}</strong></div>
          ))}
        </div>
        <aside className="future-card">
          <p className="future-label">Future applications</p>
          <p>These are possible adaptations of the reusable layer—not products available in this MVP.</p>
          <ul>{futureApplications.map((application) => <li key={application}>{application}</li>)}</ul>
        </aside>
      </div>
    </section>
  );
}

export function WhyArc() {
  return (
    <section className="section-shell arc-section" id="why-arc" aria-labelledby="why-arc-title">
      <div className="section-heading">
        <p className="eyebrow">Why Arc</p>
        <h2 id="why-arc-title">Settlement evidence a system can verify.</h2>
        <p>Arc is the demonstrated USDC settlement rail. It does not perform the simulated AED funding or local INR delivery.</p>
      </div>
      <div className="reason-grid">
        {arcReasons.map((reason) => {
          const Icon = reason.icon;
          return (
            <article key={reason.title}>
              <span className="reason-icon" aria-hidden="true">
                <Icon strokeWidth={1.8} />
              </span>
              <h3>{reason.title}</h3>
              <p>{reason.copy}</p>
            </article>
          );
        })}
      </div>
      <p className="disclosure">Arc Testnet is used for this hackathon prototype; this page does not present it as production infrastructure.</p>
    </section>
  );
}

export function FinalCta({ demoUrl }: FinalCtaProps) {
  return (
    <section className="final-cta" aria-labelledby="final-cta-title">
      <p className="eyebrow">Working prototype</p>
      <h2 id="final-cta-title">See one cross-border payment from quote to delivery.</h2>
      <a className="button button-light" href={demoUrl}>Start a payment</a>
      <p>Uses a real USDC settlement transaction on Arc Testnet.</p>
    </section>
  );
}
