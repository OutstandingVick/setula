import Image from "next/image";

type HeroProps = {
  demoUrl: string;
};

export function Hero({ demoUrl }: HeroProps) {
  return (
    <section className="hero-shell" aria-labelledby="landing-title">
      <div className="hero-copy">
        <h1 id="landing-title">Global payouts, made local.</h1>
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
