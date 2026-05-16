// src/app/api/agents/cobraya-fraud-detector/invoke/route.ts — W2.5e
// CD-1: no any. CD-9: no key leak in logs/responses. CD-21: no env dumps.
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createPublicClient, createWalletClient, http, keccak256, encodePacked } from "viem";
import { avalancheFuji } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { COMMITMENTS_ABI } from "@/lib/abis/cobraya-invoice-commitments";
import { mockFraudCheck } from "@/infra/mock-adapter";

const InputSchema = z.object({
  uuidCfdi: z.string().min(1),
  rfcEmisor: z.string().min(1),
  amountMXN: z.number().positive(),
});

function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === "true";
}

const ZERO_BYTES32 = "0x0000000000000000000000000000000000000000000000000000000000000000" as const;

export async function POST(req: NextRequest) {
  const parsed = InputSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const { uuidCfdi, rfcEmisor, amountMXN } = parsed.data;

  const commitmentHash = keccak256(
    encodePacked(["string", "string", "uint256"], [uuidCfdi, rfcEmisor, BigInt(amountMXN)]),
  );

  if (isDemoMode()) {
    const mock = mockFraudCheck({ uuidCfdi, rfcEmisor, amountMXN });
    return NextResponse.json({ ...mock, receipt: null });
  }

  const rpcUrl = process.env.AVALANCHE_RPC_URL;
  const contractAddress = process.env.COBRAYA_COMMITMENTS_ADDRESS as `0x${string}` | undefined;
  const privateKey = process.env.FRAUD_DETECTOR_PRIVATE_KEY as `0x${string}` | undefined;

  if (!rpcUrl || !contractAddress || !privateKey) {
    // CD-9: do NOT enumerate which env var was missing — generic message.
    return NextResponse.json(
      { error: "fraud_detector_not_configured", commitmentHash, receipt: null },
      { status: 503 },
    );
  }

  try {
    const publicClient = createPublicClient({ chain: avalancheFuji, transport: http(rpcUrl) });

    const [active, ts, committer] = (await publicClient.readContract({
      address: contractAddress,
      abi: COMMITMENTS_ABI,
      functionName: "isCommitted",
      args: [commitmentHash],
    })) as [boolean, bigint, `0x${string}`];

    if (active) {
      return NextResponse.json({
        isUnique: false,
        commitmentHash,
        originalCommitTimestamp: Number(ts),
        originalCommitter: committer,
        rejectReason: "INVOICE_ALREADY_COMMITTED",
        receipt: null,
      });
    }

    const account = privateKeyToAccount(privateKey);
    const walletClient = createWalletClient({
      account,
      chain: avalancheFuji,
      transport: http(rpcUrl),
    });

    const txHash = await walletClient.writeContract({
      address: contractAddress,
      abi: COMMITMENTS_ABI,
      functionName: "commitInvoice",
      args: [commitmentHash, ZERO_BYTES32],
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash, confirmations: 1 });

    return NextResponse.json({
      isUnique: true,
      commitmentHash,
      commitTxHash: txHash,
      snowtraceUrl: `https://testnet.snowtrace.io/tx/${txHash}`,
      blockNumber: Number(receipt.blockNumber),
      timestamp: Math.floor(Date.now() / 1000),
      receipt: null,
    });
  } catch (err) {
    // CD-9: sanitize — only message string, never full stack/keys.
    const message = err instanceof Error ? err.message : "unknown";
    // Defensive: filter accidental key prefix leakage.
    const safe = message.replace(/0x[0-9a-fA-F]{40,}/g, "<redacted-hex>");
    return NextResponse.json(
      {
        isUnique: false,
        commitmentHash,
        rejectReason: "NETWORK_ERROR",
        error: safe,
        receipt: null,
      },
      { status: 502 },
    );
  }
}
