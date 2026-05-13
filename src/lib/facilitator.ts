import type { LenderMatch, SettlementReceipt } from "@/types/invoice";

const FACILITATOR_URL =
  process.env.WASIAI_FACILITATOR_URL ?? "https://wasiai-facilitator-production.up.railway.app";
const CHAIN_ID = Number(process.env.AVALANCHE_CHAIN_ID ?? 43113);
const USDC_ADDRESS = (process.env.USDC_ADDRESS ?? "0x5425890298aed601595a70AB815c96711a31Bc65") as `0x${string}`;

interface SettleRequest {
  chainId: number;
  asset: `0x${string}`;
  from: `0x${string}`;
  to: `0x${string}`;
  amount: string;
  signature: `0x${string}`;
  nonce: `0x${string}`;
  validAfter: number;
  validBefore: number;
}

export async function settleOnFacilitator(
  match: LenderMatch,
  smeWallet: `0x${string}`,
  lenderWallet: `0x${string}`,
  signedAuthorization: {
    signature: `0x${string}`;
    nonce: `0x${string}`;
    validAfter: number;
    validBefore: number;
  },
): Promise<SettlementReceipt> {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
    return mockSettle(match, smeWallet, lenderWallet);
  }

  const usdcDecimals = 6;
  const amount = BigInt(Math.round(match.estimatedSettlement.netUSDC * 10 ** usdcDecimals)).toString();

  const body: SettleRequest = {
    chainId: CHAIN_ID,
    asset: USDC_ADDRESS,
    from: lenderWallet,
    to: smeWallet,
    amount,
    signature: signedAuthorization.signature,
    nonce: signedAuthorization.nonce,
    validAfter: signedAuthorization.validAfter,
    validBefore: signedAuthorization.validBefore,
  };

  const res = await fetch(`${FACILITATOR_URL}/settle`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`Facilitator settle failed: ${res.status} ${await res.text()}`);
  }

  const result = (await res.json()) as { txHash: `0x${string}`; blockNumber: number; from: `0x${string}` };
  return {
    txHash: result.txHash,
    chainId: CHAIN_ID,
    blockNumber: result.blockNumber,
    from: result.from,
    to: smeWallet,
    amountUSDC: match.estimatedSettlement.netUSDC,
    facilitator: "wasiai-facilitator",
  };
}

function mockSettle(
  match: LenderMatch,
  smeWallet: `0x${string}`,
  lenderWallet: `0x${string}`,
): SettlementReceipt {
  const fakeHash = ("0x" +
    Array.from({ length: 64 }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("")) as `0x${string}`;

  return {
    txHash: fakeHash,
    chainId: CHAIN_ID,
    blockNumber: 35000000 + Math.floor(Math.random() * 100000),
    from: lenderWallet,
    to: smeWallet,
    amountUSDC: match.estimatedSettlement.netUSDC,
    facilitator: "wasiai-facilitator (demo mode)",
  };
}

export function snowtraceUrl(txHash: `0x${string}`): string {
  if (CHAIN_ID === 43114) return `https://snowtrace.io/tx/${txHash}`;
  return `https://testnet.snowtrace.io/tx/${txHash}`;
}
