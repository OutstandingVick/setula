import { Hero } from "../components/Hero";
import {
  FinalCta,
  HowItWorks,
  Infrastructure,
  WhyArc,
} from "../components/JourneySections";
import { ProductProof } from "../components/ProductProof";
import { SetulaLogo } from "../components/SetulaLogo";

const demoUrl = process.env.NEXT_PUBLIC_DEMO_URL ?? "http://127.0.0.1:4000";

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
          <div className="footer-brand-row">
            <SetulaLogo className="setula-logo setula-logo-footer" />
            <div className="footer-status" aria-label="Prototype status">
              <span>Arc Testnet</span>
              <span>Fiat rails simulated</span>
            </div>
          </div>

          <nav className="footer-links" aria-label="Footer navigation">
            <a href="https://github.com/OutstandingVick/setula">
              <span>01</span>
              <strong>GitHub</strong>
              <small>Source code and project history</small>
            </a>
            <a href="https://testnet.arcscan.app/tx/0x347ac773f6d280952fb84ad41347e0e8f543bc93262465904e0e55db022d4900">
              <span>02</span>
              <strong>ArcScan proof</strong>
              <small>Inspect the validated settlement</small>
            </a>
            <a href="https://github.com/OutstandingVick/setula#readme">
              <span>03</span>
              <strong>Documentation</strong>
              <small>Read the MVP scope and run guide</small>
            </a>
          </nav>

          <div className="footer-disclosure">
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
