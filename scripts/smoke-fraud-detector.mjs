#!/usr/bin/env node
// Smoke test the deployed CobrayaInvoiceCommitments via direct viem call.
// Usage: node scripts/smoke-fraud-detector.mjs
// Reads env from .env.local.
import { readFileSync } from "node:fs";
import { createPublicClient, createWalletClient, http, keccak256, encodePacked } from "viem";
import { avalancheFuji } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

// Load .env.local manually (avoid extra deps).
const envText = readFileSync(".env.local", "utf8");
for (const line of envText.split("\n")) {
  if (!line || line.startsWith("#")) continue;
  const idx = line.indexOf("=");
  if (idx < 0) continue;
  const key = line.slice(0, idx).trim();
  const val = line.slice(idx + 1).trim();
  if (!process.env[key]) process.env[key] = val;
}

const ABI = [
  {
    type: "function",
    name: "commitInvoice",
    stateMutability: "nonpayable",
    inputs: [
      { name: "hash", type: "bytes32" },
      { name: "metadataPointer", type: "bytes32" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "isCommitted",
    stateMutability: "view",
    inputs: [{ name: "hash", type: "bytes32" }],
    outputs: [
      { name: "active", type: "bool" },
      { name: "ts", type: "uint64" },
      { name: "committer", type: "address" },
    ],
  },
];

const RPC = process.env.AVALANCHE_RPC_URL;
const CONTRACT = process.env.COBRAYA_COMMITMENTS_ADDRESS;
const PK = process.env.FRAUD_DETECTOR_PRIVATE_KEY;

if (!RPC || !CONTRACT || !PK) {
  console.error("Missing env vars; run from repo root with .env.local populated");
  process.exit(1);
}

const publicClient = createPublicClient({ chain: avalancheFuji, transport: http(RPC) });
const account = privateKeyToAccount(PK);
const walletClient = createWalletClient({ account, chain: avalancheFuji, transport: http(RPC) });

const uuidCfdi = process.argv[2] ?? "11111111-1111-1111-1111-111111111111";
const rfcEmisor = "TLE850120ABC";
const amountMXN = 48500;

const commitmentHash = keccak256(
  encodePacked(["string", "string", "uint256"], [uuidCfdi, rfcEmisor, BigInt(amountMXN)]),
);
console.log("commitmentHash:", commitmentHash);

const [active, ts, committer] = await publicClient.readContract({
  address: CONTRACT,
  abi: ABI,
  functionName: "isCommitted",
  args: [commitmentHash],
});

console.log("isCommitted →", { active, ts: Number(ts), committer });

if (active) {
  console.log("Already committed — would return isUnique:false in /api response.");
  process.exit(0);
}

console.log("Submitting commitInvoice tx…");
const txHash = await walletClient.writeContract({
  address: CONTRACT,
  abi: ABI,
  functionName: "commitInvoice",
  args: [commitmentHash, "0x0000000000000000000000000000000000000000000000000000000000000000"],
});
console.log("tx submitted:", txHash);
const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash, confirmations: 1 });
console.log("block:", Number(receipt.blockNumber));
console.log("snowtrace:", `https://testnet.snowtrace.io/tx/${txHash}`);
