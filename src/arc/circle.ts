import {
  initiateDeveloperControlledWalletsClient,
  type CircleDeveloperControlledWalletsClient,
} from "@circle-fin/developer-controlled-wallets";
import { parseUsdc } from "./amount.js";
import {
  ARC_USDC_ADDRESS,
  loadCredentials,
  loadSettlementConfig,
} from "./config.js";

// Reused from setula-arc-spike/src/circle.ts.
export function createCircleClient(): CircleDeveloperControlledWalletsClient {
  const credentials = loadCredentials();
  return initiateDeveloperControlledWalletsClient({
    apiKey: credentials.CIRCLE_API_KEY,
    entitySecret: credentials.CIRCLE_ENTITY_SECRET,
  });
}

export async function getUsdcBalance(
  client: CircleDeveloperControlledWalletsClient,
  walletId: string,
): Promise<{ amount: string; baseUnits: bigint; tokenId: string }> {
  const response = await client.getWalletTokenBalance({
    id: walletId,
    tokenAddresses: [ARC_USDC_ADDRESS],
  });
  const balances = response.data?.tokenBalances ?? [];
  const usdc = balances.find(
    ({ token }) =>
      token.tokenAddress?.toLowerCase() === ARC_USDC_ADDRESS.toLowerCase(),
  );

  if (!usdc) return { amount: "0", baseUnits: 0n, tokenId: "" };
  const configured = loadSettlementConfig();
  if (usdc.token.id !== configured.CIRCLE_USDC_TOKEN_ID) {
    throw new Error(
      "Configured Circle USDC token ID does not match Wallet A Arc USDC",
    );
  }
  if (usdc.token.decimals !== undefined && usdc.token.decimals !== 6) {
    throw new Error(
      `Unexpected Arc USDC decimals from Circle: ${usdc.token.decimals}`,
    );
  }
  return {
    amount: usdc.amount,
    baseUnits: parseUsdc(usdc.amount),
    tokenId: usdc.token.id,
  };
}
