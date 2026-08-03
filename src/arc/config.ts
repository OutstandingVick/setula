import { z } from "zod";

export const ARC_BLOCKCHAIN = "ARC-TESTNET" as const;
export const ARC_EXPLORER_URL = "https://testnet.arcscan.app";
export const ARC_USDC_ADDRESS =
  "0x3600000000000000000000000000000000000000";

const credentialsSchema = z.object({
  CIRCLE_API_KEY: z.string().min(1, "CIRCLE_API_KEY is required"),
  CIRCLE_ENTITY_SECRET: z
    .string()
    .regex(
      /^[0-9a-f]{64}$/,
      "CIRCLE_ENTITY_SECRET must be the registered 32-byte lowercase hex secret",
    ),
});

const runtimeSchema = z.object({
  POLL_INTERVAL_MS: z.coerce.number().int().positive().default(2_000),
  POLL_TIMEOUT_MS: z.coerce.number().int().positive().default(180_000),
});

const settlementSchema = z.object({
  CIRCLE_BLOCKCHAIN: z.literal(ARC_BLOCKCHAIN),
  CIRCLE_USDC_TOKEN_ID: z.string().uuid(),
});

const walletSchema = z.object({
  walletA: z.object({
    id: z.string().uuid(),
    address: z.string().regex(/^0x[0-9a-fA-F]{40}$/),
  }),
  walletB: z.object({
    id: z.string().uuid(),
    address: z.string().regex(/^0x[0-9a-fA-F]{40}$/),
  }),
});

export type WalletState = z.infer<typeof walletSchema>;

export function loadCredentials() {
  return credentialsSchema.parse(process.env);
}

export function loadRuntimeConfig() {
  return runtimeSchema.parse(process.env);
}

export function loadSettlementConfig() {
  return settlementSchema.parse(process.env);
}

export function loadWalletState(): WalletState {
  return walletSchema.parse({
    walletA: {
      id: process.env.CIRCLE_WALLET_A_ID,
      address: process.env.CIRCLE_WALLET_A_ADDRESS,
    },
    walletB: {
      id: process.env.CIRCLE_WALLET_B_ID,
      address: process.env.CIRCLE_WALLET_B_ADDRESS,
    },
  });
}

export function explorerTransactionUrl(txHash: string): string {
  if (!/^0x[0-9a-fA-F]{64}$/.test(txHash)) {
    throw new Error(`Circle returned an invalid Arc transaction hash: ${txHash}`);
  }
  return `${ARC_EXPLORER_URL}/tx/${txHash}`;
}
