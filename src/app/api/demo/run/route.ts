// src/app/api/demo/run/route.ts — preflight rate-limit gate for /demo.
//
// The /demo page is public (no auth required) and triggers a real on-chain
// settlement (capped at $0.05 USDC per CD-5). To avoid letting visitors drain
// the TREASURY wallet during the hackathon judging window, the DemoFlow client
// component POSTs here BEFORE starting the agent pipeline. The handler:
//
//   1. Builds the client fingerprint (x-forwarded-for first hop fallback).
//   2. Consumes one slot from the in-memory rate limiter:
//        - cooldown 60s between runs
//        - hourly quota 5 runs
//   3. Returns either `{ ok: true, runId, remainingHour }` or `{ ok: false,
//      reason, retryAfterSec }` so the UI can render the wait copy.
//
// We intentionally do NOT proxy the 4 agent calls or the /api/settle call from
// this route. Each agent invoke is already its own serverless function with
// its own metering; routing them through /api/demo/run would just add latency
// and a SPOF for the demo. The rate limiter is a gate, not a proxy.
//
// CD-9: only the fingerprint is read; nothing is persisted. The runId returned
// to the client is a fresh UUID v4 the client uses as `x-cobraya-request-id`
// header for the downstream agent calls (mirrors the negociar page contract).
import { NextRequest, NextResponse } from "next/server";
import { consume, fingerprintFromHeaders } from "@/lib/demo/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const fp = fingerprintFromHeaders((name) => req.headers.get(name));
  const result = consume(fp);

  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        reason: result.reason,
        retryAfterSec: result.retryAfterSec,
        remainingHour: result.remainingHour,
      },
      {
        status: 429,
        headers: result.retryAfterSec
          ? { "Retry-After": String(result.retryAfterSec) }
          : undefined,
      },
    );
  }

  return NextResponse.json({
    ok: true,
    runId: crypto.randomUUID(),
    remainingHour: result.remainingHour,
  });
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    { error: "method_not_allowed", allowed: ["POST"] },
    { status: 405, headers: { Allow: "POST" } },
  );
}
