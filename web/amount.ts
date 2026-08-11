const MAX_INR_MINOR = BigInt(Number.MAX_SAFE_INTEGER);

export function normalizeInrInput(value: string): string {
  return value
    .trim()
    .replace(/^(?:INR|₹)\s*/i, "")
    .replaceAll(",", "")
    .replace(/\s/g, "");
}

export function parseInrMinor(value: string): number {
  const normalized = normalizeInrInput(value);
  if (!/^(?:\d+(?:\.\d{0,2})?|\.\d{1,2})$/.test(normalized)) {
    throw new Error("Enter a valid INR amount with no more than two decimal places.");
  }

  const [wholeInput = "0", fraction = ""] = normalized.split(".");
  const whole = wholeInput || "0";
  const minor = BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0") || "0");
  if (minor <= 0n) {
    throw new Error("The recipient amount must be greater than zero.");
  }
  if (minor > MAX_INR_MINOR) {
    throw new Error("The recipient amount is too large.");
  }
  return Number(minor);
}

export function calculateAedMinor(amountInrMinor: number): number {
  return Number((BigInt(amountInrMinor) * 100n + 2_275n - 1n) / 2_275n);
}
