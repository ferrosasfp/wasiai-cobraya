// src/app/api/agents/cobraya-fraud-detector/invoke/route.ts — W2.5 + W5.5 wiring
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createPublicClient, createWalletClient, http, keccak256, encodePacked, stringToBytes } from "viem";
import { avalancheFuji } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { COMMITMENTS_ABI } from "@/lib/abis/cobraya-invoice-commitments";
import { mockFraudCheck } from "@/infra/mock-adapter";
import { signReceipt, getAgentAddress, pushStep } from "@/infra/agent-signer";
import { isValidUuidV4 } from "@/lib/uuid-validator";
import { buildAuditCookieHeader } from "@/lib/audit-auth";

const InputSchema = z.object({
  uuidCfdi: z.string().min(1),
  rfcEmisor: z.string().min(1),
  amountMXN: z.number().positive(),
});

const SLUG = "cobraya-fraud-detector";
const PRICE_USDC = 0.005;

function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === "true";
}

interface FraudOutput {
  isUnique: boolean;
  commitmentHash: `0x${string}`;
  commitTxHash?: `0x${string}`;
  snowtraceUrl?: string;
  blockNumber?: number;
  timestamp?: number;
  originalCommitTimestamp?: number;
  originalCommitter?: `0x${string}`;
  rejectReason?: string;
  // BLQ-MED-2: keccak256(`${requestId}:${commitmentHash}`) — recorded in the
  // onchain `metadataPointer` arg of `commitInvoice` so the audit trail JSON is
  // cross-verifiable against the on-chain log. ZERO_BYTES32 had been a
  // missed-opportunity attack vector (no audit anchor).
  metadataPointer?: `0x${string}`;
}

async function maybePushAuditStep(
  requestId: string | null,
  inputRaw: { uuidCfdi: string; rfcEmisor: string; amountMXN: number },
  inputMasked: Record<string, unknown>,
  output: FraudOutput,
  t0: number,
  success: boolean,
): Promise<Awaited<ReturnType<typeof signReceipt>> | null> {
  let receipt: Awaited<ReturnType<typeof signReceipt>> | null = null;
  try {
    receipt = await signReceipt({
      agentSlug: SLUG,
      stepIndex: 1,
      // BLQ-ALTO-2B: hash over RAW input so EIP-712 verifies against original
      // canonical payload; masked copy is what we store in the audit JSON.
      input: inputRaw,
      output: output as unknown as Record<string, unknown>,
      startedAt: t0,
      priceUsdc: PRICE_USDC,
    });
    if (requestId) {
      pushStep(requestId, {
        stepIndex: 1,
        agentSlug: SLUG,
        agentName: "Cobraya Fraud Detector",
        priceUsdc: PRICE_USDC,
        agentSigner: getAgentAddress(SLUG),
        input: inputMasked,
        output: output as unknown as Record<string, unknown>,
        success,
        latencyMs: Date.now() - t0,
        receipt,
        onchain: output.commitTxHash
          ? {
              txHash: output.commitTxHash,
              blockNumber: output.blockNumber ?? 0,
              snowtraceUrl: output.snowtraceUrl ?? "",
            }
          : null,
      });
    }
  } catch (err) {
    // BLQ-BAJO-3: log signer failure structurally (no stack, no err.message).
    console.warn("[cobraya-agent-receipt] signing failed:", {
      agentSlug: SLUG,
      requestId,
      errorName: err instanceof Error ? err.name : "unknown",
    });
    receipt = null;
  }
  return receipt;
}

function maskRfc(rfc: string): string {
  // Mask format consistent with cfdi-validator's `output.rfcEmisorMasked`:
  // 4-char prefix + "***". Audit JSON `step.input` shows the same shape so a
  // human eyeballing the trail sees identical redaction across steps.
  return rfc.length >= 6 ? `${rfc.slice(0, 4)}***` : "***";
}

function withAuditCookie(res: NextResponse, requestId: string | null): NextResponse {
  if (requestId) {
    try {
      res.headers.append("Set-Cookie", buildAuditCookieHeader(requestId));
    } catch {
      /* AUDIT_AUTH_SECRET missing — cookie omitted. */
    }
  }
  return res;
}

export async function POST(req: NextRequest) {
  const t0 = Date.now();
  const parsed = InputSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const { uuidCfdi, rfcEmisor, amountMXN } = parsed.data;

  // BLQ-MED-1: validate header before threading it anywhere downstream.
  const requestIdHeader = req.headers.get("x-cobraya-request-id");
  if (requestIdHeader && !isValidUuidV4(requestIdHeader)) {
    return NextResponse.json({ error: "invalid_request_id" }, { status: 400 });
  }
  const requestId = requestIdHeader;

  const commitmentHash = keccak256(
    encodePacked(["string", "string", "uint256"], [uuidCfdi, rfcEmisor, BigInt(amountMXN)]),
  ) as `0x${string}`;

  // BLQ-MED-2: bind onchain commit ↔ off-chain audit trail via metadataPointer.
  // The commit's primary key is `commitmentHash` (already unique); this field
  // is the audit anchor: keccak256(`${requestId}:${commitmentHash}`) so a
  // verifier holding the audit JSON can pull the onchain event and assert
  // metadataPointer == keccak256(`${trail.requestId}:${step.commitmentHash}`).
  // When no requestId is supplied (e.g., direct API consumers without audit
  // tracking), we still emit a non-zero pointer (`anon:` prefix) — purely a
  // defensive choice so the field never reverts to ZERO_BYTES32 (which would
  // be indistinguishable from "audit anchor missing").
  const metadataPointer = (requestId
    ? keccak256(stringToBytes(`${requestId}:${commitmentHash}`))
    : keccak256(stringToBytes(`anon:${commitmentHash}`))) as `0x${string}`;

  // BLQ-ALTO-2B: split raw (for receipt inputHash) vs masked (for audit JSON).
  const inputForReceipt = { uuidCfdi, rfcEmisor, amountMXN };
  const inputForAudit = { uuidCfdi, rfcEmisorMasked: maskRfc(rfcEmisor), amountMXN };

  if (isDemoMode()) {
    const mock = mockFraudCheck({ uuidCfdi, rfcEmisor, amountMXN });
    const output: FraudOutput = {
      isUnique: mock.isUnique,
      commitmentHash: mock.commitmentHash as `0x${string}`,
      commitTxHash: mock.commitTxHash,
      snowtraceUrl: mock.snowtraceUrl,
      blockNumber: mock.blockNumber,
      timestamp: mock.timestamp,
    };
    const receipt = await maybePushAuditStep(
      requestId,
      inputForReceipt,
      inputForAudit,
      output,
      t0,
      mock.isUnique,
    );
    return withAuditCookie(NextResponse.json({ ...output, receipt }), requestId);
  }

  const rpcUrl = process.env.AVALANCHE_RPC_URL;
  const contractAddress = process.env.COBRAYA_COMMITMENTS_ADDRESS as `0x${string}` | undefined;
  const privateKey = process.env.FRAUD_DETECTOR_PRIVATE_KEY as `0x${string}` | undefined;

  if (!rpcUrl || !contractAddress || !privateKey) {
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
      const output: FraudOutput = {
        isUnique: false,
        commitmentHash,
        originalCommitTimestamp: Number(ts),
        originalCommitter: committer,
        rejectReason: "INVOICE_ALREADY_COMMITTED",
      };
      const receipt = await maybePushAuditStep(
        requestId,
        inputForReceipt,
        inputForAudit,
        output,
        t0,
        false,
      );
      return withAuditCookie(NextResponse.json({ ...output, receipt }), requestId);
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
      args: [commitmentHash, metadataPointer],
    });

    const receiptOnchain = await publicClient.waitForTransactionReceipt({
      hash: txHash,
      confirmations: 1,
    });

    const output: FraudOutput = {
      isUnique: true,
      commitmentHash,
      commitTxHash: txHash,
      snowtraceUrl: `https://testnet.snowtrace.io/tx/${txHash}`,
      blockNumber: Number(receiptOnchain.blockNumber),
      timestamp: Math.floor(Date.now() / 1000),
      metadataPointer,
    };
    const receipt = await maybePushAuditStep(
      requestId,
      inputForReceipt,
      inputForAudit,
      output,
      t0,
      true,
    );
    return withAuditCookie(NextResponse.json({ ...output, receipt }), requestId);
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
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
