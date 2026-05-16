// src/app/api/agents/cobraya-lender-matcher/invoke/route.ts — W4
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { runAuction } from "@/core/matching";

const BandSchema = z.enum(["A", "B", "C", "D"]);
const InputSchema = z.object({
  band: BandSchema,
  amountMXN: z.number().positive(),
  anchorBuyer: z.string().min(1),
  sector: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const parsed = InputSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const result = runAuction(parsed.data);
  return NextResponse.json({ ...result, receipt: null });
}
