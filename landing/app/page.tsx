const demoUrl = process.env.NEXT_PUBLIC_DEMO_URL ?? "http://127.0.0.1:4000";

const sections = [
  { id: "how-it-works", eyebrow: "One traceable journey", title: "How Setula works" },
  { id: "why-setula", eyebrow: "Product proof", title: "From invoice to reconciled receipt" },
  { id: "infrastructure", eyebrow: "Infrastructure", title: "One settlement layer. Multiple payment products." },
  { id: "why-arc", eyebrow: "Why Arc", title: "Settlement evidence a system can verify" },
] as const;

export default function LandingPage() {
  return (
    <>
      <header className="site-header">
        <nav className="nav-shell" aria-label="Main navigation">
          <a className="wordmark" href="#top" aria-label="Setula home">
            <span className="wordmark-mark" aria-hidden="true">S</span>
            <span>Setula</span>
          </a>
          <div className="nav-links">
            <a href="#how-it-works">How it works</a>
            <a href="#why-setula">Why Setula</a>
            <a href="#infrastructure">Infrastructure</a>
          </div>
          <a className="button button-small" href={demoUrl}>Launch demo</a>
        </nav>
      </header>

      <main id="top">
        <section className="hero-shell" aria-labelledby="landing-title">
          <div className="hero-placeholder">
            <p className="eyebrow">Cross-border contractor payments</p>
            <h1 id="landing-title">Pay in AED. They receive local currency.</h1>
            <p className="lede">A focused payment journey for UAE agencies and overseas contractors.</p>
          </div>
          <div className="product-placeholder" aria-label="Interactive quote calculator area">
            <span>Sandbox AED → INR quote</span>
          </div>
        </section>

        {sections.map((section) => (
          <section className="section-shell" id={section.id} key={section.id} aria-labelledby={`${section.id}-title`}>
            <p className="eyebrow">{section.eyebrow}</p>
            <h2 id={`${section.id}-title`}>{section.title}</h2>
          </section>
        ))}
      </main>

      <footer className="footer-shell">
        <span className="wordmark">Setula</span>
        <p>Arc Testnet prototype. Fiat entry and payout rails are simulated.</p>
      </footer>
    </>
  );
}
