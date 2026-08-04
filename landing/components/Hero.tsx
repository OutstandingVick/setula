type HeroProps = {
  demoUrl: string;
};

const quoteRows = [
  ["Exchange rate", "1 AED = 22.75 INR"],
  ["Setula fee", "20.00 AED"],
  ["Partner / payout fee", "15.00 AED"],
  ["Estimated delivery", "Same business day"],
] as const;

export function Hero({ demoUrl }: HeroProps) {
  return (
    <section className="hero-shell" aria-labelledby="landing-title">
      <div className="hero-copy">
        <p className="eyebrow">Cross-border contractor payments</p>
        <h1 id="landing-title">Pay in AED. They receive local currency.</h1>
        <p className="lede">
          Setula helps UAE agencies pay overseas contractors with exact recipient amounts,
          invoice-linked records and verifiable USDC settlement on Arc.
        </p>
        <div className="hero-actions">
          <a className="button" href={demoUrl}>Launch payment demo</a>
          <a className="text-link" href="#how-it-works">See how it works <span aria-hidden="true">↓</span></a>
        </div>
        <p className="trust-line">
          <span aria-hidden="true" className="trust-dot" />
          Arc Testnet prototype · Fiat entry and payout rails simulated
        </p>
      </div>

      <div className="quote-card" aria-label="Sandbox AED to INR quote preview">
        <div className="quote-card-header">
          <div>
            <p className="quote-kicker">Sandbox partner quote</p>
            <p className="quote-caption">Exact recipient amount</p>
          </div>
          <span className="quote-status">Live preview</span>
        </div>

        <div className="amount-field">
          <label htmlFor="hero-send-preview">You send</label>
          <div className="amount-control">
            <input id="hero-send-preview" value="4,000" readOnly aria-describedby="hero-static-note" />
            <span className="currency-pill"><span aria-hidden="true">AE</span> AED</span>
          </div>
        </div>

        <div className="route-divider" aria-hidden="true"><span>→</span></div>

        <div className="amount-field amount-field-receive">
          <label htmlFor="hero-receive-preview">Contractor receives</label>
          <div className="amount-control">
            <input id="hero-receive-preview" value="91,000" readOnly />
            <span className="currency-pill currency-pill-inr"><span aria-hidden="true">IN</span> INR</span>
          </div>
        </div>

        <dl className="quote-breakdown">
          {quoteRows.map(([label, value]) => (
            <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
          ))}
        </dl>

        <a className="button quote-button" href={demoUrl} aria-describedby="hero-static-note">Continue to demo</a>
        <p className="quote-note" id="hero-static-note">Quote uses the fixed hackathon sandbox rate.</p>
      </div>
    </section>
  );
}
