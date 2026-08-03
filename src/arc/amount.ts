export const USDC_DECIMALS = 6;

// Reused from setula-arc-spike/src/amount.ts.
export function parseUsdc(value: string): bigint {
  const match = /^(0|[1-9]\d*)(?:\.(\d{1,6}))?$/.exec(value);
  if (!match) {
    throw new Error(
      `Invalid USDC amount "${value}"; use a non-negative decimal with at most ${USDC_DECIMALS} places`,
    );
  }
  const whole = BigInt(match[1] ?? "0");
  const fraction = (match[2] ?? "").padEnd(USDC_DECIMALS, "0");
  return whole * 10n ** BigInt(USDC_DECIMALS) + BigInt(fraction || "0");
}

export function formatUsdc(value: bigint): string {
  const sign = value < 0n ? "-" : "";
  const absolute = value < 0n ? -value : value;
  const scale = 10n ** BigInt(USDC_DECIMALS);
  const whole = absolute / scale;
  const fraction = (absolute % scale)
    .toString()
    .padStart(USDC_DECIMALS, "0")
    .replace(/0+$/, "");
  return `${sign}${whole}${fraction ? `.${fraction}` : ""}`;
}
