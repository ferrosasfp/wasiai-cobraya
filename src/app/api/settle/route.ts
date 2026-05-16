// src/app/api/settle/route.ts — W5 + W5.5 wiring
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { parseUnits } from "viem";
import { signTransferAuthorization } from "@/infra/eip3009-signer";
import { settleOnFacilitator } from "@/infra/facilitator-client";
import { ONCHAIN_AMOUNT_CAP_USDC, OWNER_ADDRESS, FACILITATOR_URL } from "@/infra/env";
import { mockSettle } from "@/infra/mock-adapter";
import { pushSettlement } from "@/infra/agent-signer";
import type { AuditSettlement } from "@/types/audit-trail";

const MatchSchema = z.object({
  lenderId: z.string(),
  lenderName: z.string(),
  netAmountUSDC: z.number().nonnegative(),
});

// DT-Q (fix-pack post-AR): `smeWalletOverride` removed from the input schema.
// Demo invariant: the SME wallet is always the OWNER (Lupita). Allowing the
// caller to override `to` is a treasury-drain vector. The destination is now
// resolved server-side from `OWNER_ADDRESS`. Strict object — any extra key in
// the payload is silently dropped by zod's default behaviour.
const InputSchema = z.object({
  match: MatchSchema,
});

function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === "true";
}

export async function POST(req: NextRequest) {
  const parsed = InputSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const { match } = parsed.data;
  const amountUSDC = match.netAmountUSDC;
  const requestId = req.headers.get("x-cobraya-request-id");

  // CD-5 + AC-7: server-side cap enforcement.
  if (amountUSDC > ONCHAIN_AMOUNT_CAP_USDC) {
    return NextResponse.json(
      {
        error: "cap_exceeded",
        testnetCapUSDC: ONCHAIN_AMOUNT_CAP_USDC,
        requestedUSDC: amountUSDC,
        message: `testnet cap — mainnet would settle full $${amountUSDC}`,
      },
      { status: 422 },
    );
  }

  if (isDemoMode()) {
    const to = (OWNER_ADDRESS ?? "0x0000000000000000000000000000000000000000") as `0x${string}`;
    const fake = mockSettle(
      {
        lenderId: match.lenderId,
        lenderName: match.lenderName,
        advanceRate: 0,
        rateAPR: 0,
        estimatedSettlement: { grossUSDC: 0, feeUSDC: 0, netUSDC: amountUSDC },
      },
      to,
      to,
    );
    const settlement: AuditSettlement = {
      authorization: {
        domain: {
          name: "USD Coin",
          version: "2",
          chainId: 43113,
          verifyingContract: (process.env.USDC_ADDRESS ??
            "0x5425890298aed601595a70AB815c96711a31Bc65") as `0x${string}`,
        },
        primaryType: "TransferWithAuthorization",
        message: {
          from: to,
          to,
          value: parseUnits(amountUSDC.toString(), 6).toString(),
          validAfter: "0",
          validBefore: String(Math.floor(Date.now() / 1000) + 300),
          nonce: "0x" + "0".repeat(64),
        },
      },
      signature: "0xMOCK_SIGNATURE" as `0x${string}`,
      txHash: fake.txHash,
      blockNumber: fake.blockNumber,
      snowtraceUrl: `https://testnet.snowtrace.io/tx/${fake.txHash}`,
      deliveredAmountUSDC: amountUSDC,
      facilitatorUrl: FACILITATOR_URL,
    };
    if (requestId) pushSettlement(requestId, settlement);

    return NextResponse.json({
      receipt: {
        txHash: fake.txHash,
        snowtraceUrl: settlement.snowtraceUrl,
        deliveredAmountUSDC: amountUSDC,
        blockNumber: fake.blockNumber,
      },
      traces: [],
    });
  }

  try {
    const to = OWNER_ADDRESS as `0x${string}`;
    const valueOnchain = parseUnits(amountUSDC.toString(), 6);
    const auth = await signTransferAuthorization({ to, valueOnchain });
    const settlement = await settleOnFacilitator({
      authorization: auth,
      lenderId: match.lenderId,
    });

    if (requestId) {
      const audit: AuditSettlement = {
        authorization: {
          domain: {
            name: "USD Coin",
            version: "2",
            chainId: 43113,
            verifyingContract: (process.env.USDC_ADDRESS ??
              "0x5425890298aed601595a70AB815c96711a31Bc65") as `0x${string}`,
          },
          primaryType: "TransferWithAuthorization",
          message: {
            from: auth.from,
            to: auth.to,
            value: auth.value.toString(),
            validAfter: auth.validAfter.toString(),
            validBefore: auth.validBefore.toString(),
            nonce: auth.nonce,
          },
        },
        signature: auth.signature,
        txHash: settlement.txHash,
        blockNumber: settlement.blockNumber,
        snowtraceUrl: settlement.snowtraceUrl,
        deliveredAmountUSDC: settlement.deliveredAmountUSDC,
        facilitatorUrl: FACILITATOR_URL,
      };
      pushSettlement(requestId, audit);
    }

    return NextResponse.json({
      receipt: {
        txHash: settlement.txHash,
        snowtraceUrl: settlement.snowtraceUrl,
        deliveredAmountUSDC: settlement.deliveredAmountUSDC,
        blockNumber: settlement.blockNumber,
      },
      traces: [],
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    const safe = message.replace(/0x[0-9a-fA-F]{40,}/g, "<redacted-hex>");
    return NextResponse.json({ error: "settle_failed", message: safe }, { status: 502 });
  }
}
