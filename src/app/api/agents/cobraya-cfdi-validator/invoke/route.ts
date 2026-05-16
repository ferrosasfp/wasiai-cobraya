// src/app/api/agents/cobraya-cfdi-validator/invoke/route.ts — W2 + W5.5 wiring
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { BUYERS_TIER_1 } from "@/lib/mock-data";
import { isUuidSeen, markUuidSeen } from "@/lib/agent-state/validator-store";
import { isValidUuidV4 } from "@/lib/uuid-validator";
import { buildAuditCookieHeader } from "@/lib/audit-auth";
import {
  signReceipt,
  getAgentAddress,
  getOrInitTrail,
  pushStep,
} from "@/infra/agent-signer";

const SLUG = "cobraya-cfdi-validator";
const PRICE_USDC = 0.001;

const InputSchema = z.object({
  uuidCfdi: z.string(),
  rfcEmisor: z.string().min(1),
  amountMXN: z.number().positive(),
  anchorBuyer: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const t0 = Date.now();
  const body = await req.json().catch(() => null);
  const parsed = InputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const { uuidCfdi, rfcEmisor, amountMXN, anchorBuyer } = parsed.data;

  if (!isValidUuidV4(uuidCfdi)) {
    return NextResponse.json(
      { error: "invalid_input", details: { uuidCfdi: ["invalid UUID format"] } },
      { status: 400 },
    );
  }

  // BLQ-MED-1: validate x-cobraya-request-id header shape before threading it
  // into the audit buffer (defends against CRLF injection / poisoned keys).
  const requestIdHeader = req.headers.get("x-cobraya-request-id");
  if (requestIdHeader && !isValidUuidV4(requestIdHeader)) {
    return NextResponse.json(
      { error: "invalid_request_id" },
      { status: 400 },
    );
  }
  const requestId = requestIdHeader;

  const buyer = BUYERS_TIER_1.find((b) => b.name === anchorBuyer);
  const anchorBuyerTier: 1 | "unknown" = buyer ? 1 : "unknown";
  const isDuplicate = isUuidSeen(uuidCfdi);
  if (!isDuplicate) markUuidSeen(uuidCfdi);
  // BLQ-BAJO-2 rename: `duplicateCheckInstance` makes it explicit that this is
  // a process-scoped check (validator-store is in-memory). The authoritative
  // cross-instance/global dup check is performed by the fraud-detector via the
  // onchain `CobrayaInvoiceCommitments` contract — see W2.5.
  const duplicateCheckInstance: "clean" | "duplicate" = isDuplicate ? "duplicate" : "clean";

  const isCompliant =
    amountMXN > 0 && anchorBuyerTier === 1 && duplicateCheckInstance === "clean";
  const sector = buyer?.sector ?? "any";
  const policyId = `cobraya-tier-${anchorBuyerTier === 1 ? "1" : "unknown"}-${sector}-2026`;

  const output = {
    isCompliant,
    anchorBuyerTier,
    policyId,
    duplicateCheckInstance,
    rfcEmisorMasked: rfcEmisor.length >= 6 ? `${rfcEmisor.slice(0, 4)}***` : "***",
    signedAt: new Date().toISOString(),
  };

  // W5.5 — sign EIP-712 receipt + push to audit trail (best-effort, never blocks
  // the response on signer failures: caller wants the agent answer, audit
  // trail is a bonus).
  let receipt: Awaited<ReturnType<typeof signReceipt>> | null = null;
  // BLQ-ALTO-2B: receipt inputHash commits to RAW so verifiers can validate
  // EIP-712 against the original payload; the audit-step `input` field stores
  // MASKED so the downloadable JSON never echoes raw PII.
  const inputForReceipt = { uuidCfdi, rfcEmisor, amountMXN, anchorBuyer };
  const inputForAudit = {
    uuidCfdi,
    rfcEmisorMasked: output.rfcEmisorMasked,
    amountMXN,
    anchorBuyer,
  };
  try {
    receipt = await signReceipt({
      agentSlug: SLUG,
      stepIndex: 0,
      input: inputForReceipt,
      output,
      startedAt: t0,
      priceUsdc: PRICE_USDC,
    });
    if (requestId) {
      getOrInitTrail(requestId, {
        uuid: uuidCfdi,
        rfcEmisorMasked: output.rfcEmisorMasked,
        amountMXN,
        anchorBuyer,
        paymentTermsDays: 60,
        sector,
      });
      pushStep(requestId, {
        stepIndex: 0,
        agentSlug: SLUG,
        agentName: "Cobraya CFDI Validator",
        priceUsdc: PRICE_USDC,
        agentSigner: getAgentAddress(SLUG),
        input: inputForAudit,
        output,
        success: isCompliant,
        latencyMs: Date.now() - t0,
        receipt,
        onchain: null,
      });
    }
  } catch (err) {
    // BLQ-BAJO-3: surface signer failure as a structured warn (no stack, no
    // err.message — could include privkey). Receipt is omitted so the agent
    // response stays usable.
    console.warn("[cobraya-agent-receipt] signing failed:", {
      agentSlug: SLUG,
      requestId,
      errorName: err instanceof Error ? err.name : "unknown",
    });
    receipt = null;
  }

  // BLQ-ALTO-2A: when we successfully attached a step to a requestId-bound
  // trail, emit an httpOnly cookie that gates the future
  // GET /api/audit-trail/[requestId] download. Best-effort: if
  // AUDIT_AUTH_SECRET is missing the build of the cookie throws — we keep the
  // agent response 200 (the audit download will simply 403 later).
  const res = NextResponse.json({ ...output, receipt });
  if (requestId) {
    try {
      res.headers.append("Set-Cookie", buildAuditCookieHeader(requestId));
    } catch {
      /* AUDIT_AUTH_SECRET missing — leave cookie absent. */
    }
  }
  return res;
}
