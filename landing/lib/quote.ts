export const INR_PER_AED_NUMERATOR = 2_275n;
export const INR_PER_AED_DENOMINATOR = 100n;
export const DEFAULT_AED_INPUT = "4000";
export const MAX_AED_MINOR = 100_000_000n;

export type SandboxQuote = {
  amountAedMinor: bigint;
  amountInrMinor: bigint;
};

export function sanitizeAedInput(value: string): string {
  const normalized = value.replaceAll(",", "").replace(/[^\d.]/g, "");
  const [whole = "", ...fractionParts] = normalized.split(".");
  const fraction = fractionParts.join("").slice(0, 2);
  const trimmedWhole = whole.replace(/^0+(?=\d)/, "").slice(0, 9);
  const safeWhole = trimmedWhole || (normalized.startsWith(".") ? "0" : "");
  return normalized.includes(".") ? `${safeWhole}.${fraction}` : safeWhole;
}

export function parseAedToMinor(value: string): bigint | null {
  if (!/^\d+(?:\.\d{0,2})?$/.test(value)) return null;
  const [whole = "0", fraction = ""] = value.split(".");
  const amount = BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0") || "0");
  if (amount <= 0n || amount > MAX_AED_MINOR) return null;
  return amount;
}

export function calculateSandboxQuote(value: string): SandboxQuote | null {
  const amountAedMinor = parseAedToMinor(value);
  if (amountAedMinor === null) return null;
  const amountInrMinor =
    (amountAedMinor * INR_PER_AED_NUMERATOR + INR_PER_AED_DENOMINATOR / 2n) /
    INR_PER_AED_DENOMINATOR;
  return { amountAedMinor, amountInrMinor };
}

export function formatMinor(amountMinor: bigint, currency: "AED" | "INR"): string {
  return new Intl.NumberFormat("en", {
    style: "decimal",
    minimumFractionDigits: amountMinor % 100n === 0n ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(Number(amountMinor) / 100);
}
