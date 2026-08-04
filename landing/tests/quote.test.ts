import { describe, expect, it } from "vitest";
import {
  buildDemoUrl,
  calculateSandboxQuote,
  formatMinor,
  parseAedToMinor,
  sanitizeAedInput,
} from "../lib/quote";

describe("landing sandbox quote", () => {
  it("calculates the default AED to INR quote with integer minor units", () => {
    expect(calculateSandboxQuote("4000")).toEqual({
      amountAedMinor: 400_000n,
      amountInrMinor: 9_100_000n,
    });
  });

  it("rounds fractional AED values to the nearest INR paise", () => {
    expect(calculateSandboxQuote("1234.56")?.amountInrMinor).toBe(2_808_624n);
  });

  it("normalizes grouping characters and limits precision", () => {
    expect(sanitizeAedInput("4,000.129")).toBe("4000.12");
  });

  it("rejects negative, zero, malformed, and oversized values", () => {
    expect(sanitizeAedInput("-10")).toBe("");
    expect(parseAedToMinor("-10")).toBeNull();
    expect(parseAedToMinor("0")).toBeNull();
    expect(parseAedToMinor("1.234")).toBeNull();
    expect(parseAedToMinor("1000000.01")).toBeNull();
  });

  it("formats whole and fractional minor-unit amounts", () => {
    expect(formatMinor(9_100_000n, "INR")).toBe("91,000");
    expect(formatMinor(123_456n, "AED")).toBe("1,234.56");
  });

  it("creates a demo URL carrying both quote values", () => {
    const quote = calculateSandboxQuote("4000");
    expect(quote).not.toBeNull();
    expect(buildDemoUrl("http://127.0.0.1:4000", quote!)).toBe(
      "http://127.0.0.1:4000?aedMinor=400000&inrMinor=9100000&source=landing-quote",
    );
  });
});
