import Image from "next/image";
import {
  buildDemoUrl,
  calculateSandboxQuote,
  DEFAULT_AED_INPUT,
} from "../lib/quote";

type HeroProps = {
  demoUrl: string;
};

const defaultQuote = calculateSandboxQuote(DEFAULT_AED_INPUT);

export function Hero({ demoUrl }: HeroProps) {
  const continueUrl = defaultQuote ? buildDemoUrl(demoUrl, defaultQuote) : demoUrl;

  return (
    <section className="hero-shell" aria-labelledby="landing-title">
      <div className="hero-copy">
        <h1 id="landing-title">Pay in AED. They receive local currency.</h1>
        <p className="lede">
          Setula helps UAE agencies pay overseas contractors with exact recipient amounts,
          invoice-linked records and verifiable USDC settlement on Arc.
        </p>
        <div className="hero-actions">
          <a className="button" href={continueUrl}>Launch payment demo</a>
          <a className="text-link" href="#how-it-works">See how it works <span aria-hidden="true">↓</span></a>
        </div>
        <p className="trust-line">
          <span aria-hidden="true" className="trust-dot" />
          Arc Testnet prototype · Fiat entry and payout rails simulated
        </p>
      </div>

      <figure className="hero-demo-shot">
        <Image
          className="hero-demo-image"
          src="/setula-payment-entry.png"
          alt="Setula contractor payment screen showing an exact INR amount, invoice reference, payment route, and continue-to-quote action"
          width={1002}
          height={1320}
          priority
          sizes="(max-width: 980px) 100vw, 46vw"
        />
      </figure>
    </section>
  );
}
