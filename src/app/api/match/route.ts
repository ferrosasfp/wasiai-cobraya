import { NextResponse } from "next/server";
import { runMatcher } from "@/lib/agents";
import type { Invoice, ScoreResult } from "@/types/invoice";

export async function POST(req: Request) {
  const body = (await req.json()) as { invoice: Invoice; score: ScoreResult };
  if (!body?.invoice || !body?.score) {
    return NextResponse.json({ error: "invoice and score required" }, { status: 400 });
  }
  const result = await runMatcher(body.invoice, body.score);
  return NextResponse.json({ result });
}
