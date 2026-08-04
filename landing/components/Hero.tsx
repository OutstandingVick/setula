"use client";

import { useMemo, useState } from "react";
import {
  calculateSandboxQuote,
  DEFAULT_AED_INPUT,
  formatMinor,
  sanitizeAedInput,
} from "../lib/quote";

type HeroProps = {
  demoUrl: string;
};

const quoteRows = [
  ["Exchange rate", "1 AED = 22.75 INR"],
  ["Setula fee · sandbox", "20.00 AED"],
  ["Partner / payout fee · sandbox", "15.00 AED"],
  ["Estimated delivery · sandbox", "Same business day"],
] as const;

export function Hero({ demoUrl }: HeroProps) {
  const [aedInput, setAedInput] = useState(DEFAULT_AED_INPUT);
  const quote = useMemo(() => calculateSandboxQuote(aedInput), [aedInput]);
  const inputError = quote === null ? "Enter an AED amount greater than 0 and no more than 1,000,000." : undefined;
  const receiveValue = quote ? formatMinor(quote.amountInrMinor, "INR") : "—";
  const continueUrl = useMemo(() => {
    if (!quote) return undefined;
    const params = new URLSearchParams({
      aedMinor: quote.amountAedMinor.toString(),
      inrMinor: quote.amountInrMinor.toString(),
      source: "landing-quote",
    });
    return `${demoUrl}${demoUrl.includes("?") ? "&" : "?"}${params.toString()}`;
  }, [demoUrl, quote]);

  function updateAmount(nextValue: string): void {
    const sanitized = sanitizeAedInput(nextValue);
    setAedInput(sanitized);
    const nextQuote = calculateSandboxQuote(sanitized);
    if (nextQuote) {
      window.dispatchEvent(new CustomEvent("setula:quote", {
        detail: { amountAedMinor: Number(nextQuote.amountAedMinor) },
      }));
    }
  }

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
          <a className="button" href={continueUrl ?? demoUrl}>Launch payment demo</a>
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

        <div className={`amount-field${inputError ? " amount-field-error" : ""}`}>
          <label htmlFor="hero-send">You send</label>
          <div className="amount-control">
            <input
              id="hero-send"
              value={aedInput}
              onChange={(event) => updateAmount(event.target.value)}
              onBlur={() => {
                if (quote) setAedInput(formatMinor(quote.amountAedMinor, "AED").replaceAll(",", ""));
              }}
              inputMode="decimal"
              autoComplete="off"
              aria-invalid={inputError ? "true" : "false"}
              aria-describedby={inputError ? "hero-amount-error hero-static-note" : "hero-static-note"}
            />
            <label className="sr-only" htmlFor="hero-send-currency">Send currency</label>
            <select className="currency-pill" id="hero-send-currency" value="AED" disabled aria-label="Send currency">
              <option value="AED">🇦🇪 AED</option>
            </select>
          </div>
          {inputError ? <p className="field-error" id="hero-amount-error">{inputError}</p> : null}
        </div>

        <div className="route-divider" aria-hidden="true"><span>→</span></div>

        <div className="amount-field amount-field-receive">
          <label htmlFor="hero-receive">Contractor receives</label>
          <div className="amount-control">
            <output id="hero-receive" className="receive-output" aria-live="polite">{receiveValue}</output>
            <label className="sr-only" htmlFor="hero-receive-currency">Receive currency</label>
            <select className="currency-pill currency-pill-inr" id="hero-receive-currency" value="INR" disabled aria-label="Receive currency">
              <option value="INR">🇮🇳 INR</option>
            </select>
          </div>
        </div>

        <dl className="quote-breakdown">
          {quoteRows.map(([label, value]) => (
            <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
          ))}
        </dl>

        <a className={`button quote-button${inputError ? " button-disabled" : ""}`} href={continueUrl} aria-disabled={inputError ? "true" : undefined} aria-describedby="hero-static-note">Continue to demo</a>
        <p className="quote-note" id="hero-static-note">Quote uses the fixed hackathon sandbox rate.</p>
      </div>
    </section>
  );
}
