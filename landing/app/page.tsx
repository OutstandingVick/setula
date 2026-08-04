import { Hero } from "../components/Hero";
import {
  FinalCta,
  HowItWorks,
  Infrastructure,
  WhyArc,
  WhySetulaIntro,
} from "../components/JourneySections";

const demoUrl = process.env.NEXT_PUBLIC_DEMO_URL ?? "http://127.0.0.1:4000";

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
        <Hero demoUrl={demoUrl} />
        <HowItWorks />
        <WhySetulaIntro />
        <Infrastructure />
        <WhyArc />
        <FinalCta demoUrl={demoUrl} />
      </main>

      <footer className="footer-shell">
        <div>
          <span className="wordmark">Setula</span>
          <p>Hackathon prototype · not a production payment service.</p>
        </div>
        <nav className="footer-links" aria-label="Footer navigation">
          <a href="https://github.com/OutstandingVick/setula">GitHub</a>
          <a href="https://testnet.arcscan.app/tx/0x347ac773f6d280952fb84ad41347e0e8f543bc93262465904e0e55db022d4900">ArcScan proof</a>
          <a href="#infrastructure">Documentation</a>
        </nav>
      </footer>
    </>
  );
}
