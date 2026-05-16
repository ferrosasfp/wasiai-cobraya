// src/app/api/agents/cobraya-cfdi-validator/invoke/route.ts — W2
// CD-1: no `any`. CD-9/CD-21: NO log de body completo ni env vars.
// CD-23: mask rfcEmisor partial in response.
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { BUYERS_TIER_1 } from "@/lib/mock-data";
import { isUuidSeen, markUuidSeen } from "@/lib/agent-state/validator-store";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const InputSchema = z.object({
  uuidCfdi: z.string(),
  rfcEmisor: z.string().min(1),
  amountMXN: z.number().positive(),
  anchorBuyer: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = InputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const { uuidCfdi, rfcEmisor, amountMXN, anchorBuyer } = parsed.data;

  if (!UUID_REGEX.test(uuidCfdi)) {
    return NextResponse.json(
      { error: "invalid_input", details: { uuidCfdi: ["invalid UUID format"] } },
      { status: 400 },
    );
  }

  const buyer = BUYERS_TIER_1.find((b) => b.name === anchorBuyer);
  const anchorBuyerTier: 1 | "unknown" = buyer ? 1 : "unknown";
  const isDuplicate = isUuidSeen(uuidCfdi);
  if (!isDuplicate) markUuidSeen(uuidCfdi);
  const duplicateCheck: "clean" | "duplicate" = isDuplicate ? "duplicate" : "clean";

  const isCompliant =
    amountMXN > 0 && anchorBuyerTier === 1 && duplicateCheck === "clean";
  const sector = buyer?.sector ?? "any";
  const policyId = `cobraya-tier-${anchorBuyerTier === 1 ? "1" : "unknown"}-${sector}-2026`;

  return NextResponse.json({
    isCompliant,
    anchorBuyerTier,
    policyId,
    duplicateCheck,
    rfcEmisorMasked: rfcEmisor.length >= 6 ? `${rfcEmisor.slice(0, 4)}***` : "***", // CD-23
    signedAt: new Date().toISOString(),
    // W5.5 will populate receipt with EIP-712 signature.
    receipt: null,
  });
}
