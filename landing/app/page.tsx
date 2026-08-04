import { Hero } from "../components/Hero";
import {
  FinalCta,
  HowItWorks,
  Infrastructure,
  WhyArc,
} from "../components/JourneySections";
import { ProductProof } from "../components/ProductProof";
import { SetulaLogo } from "../components/SetulaLogo";

const demoUrl = process.env.NEXT_PUBLIC_DEMO_URL ?? "/pay";

export default function LandingPage() {
  return (
    <>
      <a className="skip-link" href="#landing-title">Skip to main content</a>
      <header className="site-header">
        <nav className="nav-shell" aria-label="Main navigation">
          <a className="wordmark" href="#top" aria-label="Setula">
            <SetulaLogo className="setula-logo setula-logo-nav" />
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
        <Hero demoUrl={demoUrl} />
        <HowItWorks />
        <ProductProof />
        <Infrastructure />
        <WhyArc />
        <FinalCta demoUrl={demoUrl} />
      </main>

      <footer className="site-footer">
        <div className="footer-shell">
          <div className="footer-main">
            <div className="footer-brand-block">
              <SetulaLogo className="setula-logo setula-logo-footer" theme="dark" />
              <p className="footer-tagline">Global payouts, made local.</p>
              <p className="footer-summary">
                Exact contractor payments with invoice-linked records and verifiable USDC settlement on Arc.
              </p>
              <a className="footer-demo-link" href={demoUrl}>Launch payment demo <span aria-hidden="true">↗</span></a>
            </div>
            <nav className="footer-nav" aria-label="Footer navigation">
              <div className="footer-column">
                <p>Product</p>
                <a href="#how-it-works">How it works</a>
                <a href="#infrastructure">Infrastructure</a>
                <a href="#why-arc">Why Arc</a>
                <a href={demoUrl}>Payment demo</a>
              </div>
              <div className="footer-column">
                <p>Build &amp; proof</p>
                <a href="https://github.com/OutstandingVick/setula">GitHub <span aria-hidden="true">↗</span></a>
                <a href="https://testnet.arcscan.app/tx/0x347ac773f6d280952fb84ad41347e0e8f543bc93262465904e0e55db022d4900">ArcScan transaction <span aria-hidden="true">↗</span></a>
                <a href="https://github.com/OutstandingVick/setula#readme">Documentation <span aria-hidden="true">↗</span></a>
              </div>
            </nav>
          </div>

          <div className="footer-status-row" aria-label="Prototype status">
            <p><span className="footer-status-dot" aria-hidden="true" /> Validated prototype</p>
            <div>
              <span>Arc Testnet</span>
              <span>Real USDC settlement</span>
              <span>Fiat rails simulated</span>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© 2026 Setula</p>
            <p>
              Setula is a hackathon prototype, not a production payment service.
              AED funding and INR payout are simulated; the referenced USDC settlement occurred on Arc Testnet.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
