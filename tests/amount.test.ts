import { describe, expect, it } from "vitest";
import { calculateAedMinor, normalizeInrInput, parseInrMinor } from "../web/amount.js";

describe("INR amount input", () => {
  it("accepts plain, grouped, currency-prefixed, and fractional values", () => {
    expect(parseInrMinor("91000")).toBe(9_100_000);
    expect(parseInrMinor("91,000.50")).toBe(9_100_050);
    expect(parseInrMinor("₹ 1,25,000.25")).toBe(12_500_025);
    expect(parseInrMinor("INR .50")).toBe(50);
  });

  it("normalizes display formatting without changing the numeric value", () => {
    expect(normalizeInrInput(" INR 1,23,456.78 ")).toBe("123456.78");
  });

  it("rejects zero, negative, malformed, over-precision, and unsafe values", () => {
    expect(() => parseInrMinor("0")).toThrow("greater than zero");
    expect(() => parseInrMinor("-1")).toThrow("valid INR amount");
    expect(() => parseInrMinor("12.345")).toThrow("valid INR amount");
    expect(() => parseInrMinor("abc")).toThrow("valid INR amount");
    expect(() => parseInrMinor("90071992547410")).toThrow("too large");
  });

  it("calculates the matching AED sandbox estimate", () => {
    expect(calculateAedMinor(parseInrMinor("91,000"))).toBe(400_000);
    expect(calculateAedMinor(parseInrMinor("1"))).toBe(5);
  });
});
