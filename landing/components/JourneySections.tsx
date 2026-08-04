type FinalCtaProps = { demoUrl: string };

const journeySteps = [
  {
    number: "01",
    title: "Enter the invoice",
    copy: "Set the exact amount the contractor should receive.",
    tag: "AED funding · simulated",
  },
  {
    number: "02",
    title: "Settle through Arc",
    copy: "USDC moves between institutional payment partners under the hood.",
    tag: "Arc settlement · real",
  },
  {
    number: "03",
    title: "Deliver local currency",
    copy: "The contractor receives INR while the business receives one reconciled record.",
    tag: "INR payout · simulated",
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
  ["USDC settlement", "The demonstrated payment moves USDC between payment-partner wallets on Arc Testnet."],
  ["Predictable dollar costs", "Settlement value and network costs remain legible in dollar-denominated terms."],
  ["Deterministic confirmation", "The payment advances only after Circle reports the successful terminal transaction state."],
  ["Verifiable evidence", "A transaction hash and ArcScan record make settlement machine-checkable and publicly inspectable."],
] as const;

export function HowItWorks() {
  return (
    <section className="section-shell journey-section" id="how-it-works" aria-labelledby="how-it-works-title">
      <div className="section-heading">
        <p className="eyebrow">One traceable journey</p>
        <h2 id="how-it-works-title">How Setula works</h2>
        <p>One invoice, one payment reference, and a clear boundary between funding, settlement, and delivery.</p>
      </div>
      <div className="journey-grid">
        {journeySteps.map((step) => (
          <article className="journey-card" key={step.number}>
            <span className="step-number">{step.number}</span>
            <h3>{step.title}</h3>
            <p>{step.copy}</p>
            <span className={step.number === "02" ? "scope-tag scope-tag-real" : "scope-tag"}>{step.tag}</span>
          </article>
        ))}
      </div>
      <SettlementVisual />
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
        {arcReasons.map(([title, copy], index) => (
          <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{copy}</p></article>
        ))}
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
      <a className="button button-light" href={demoUrl}>Launch the Setula demo</a>
      <p>Uses a real USDC settlement transaction on Arc Testnet.</p>
    </section>
  );
}
import { SettlementVisual } from "./SettlementVisual";
