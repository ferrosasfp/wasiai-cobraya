import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { __resetDemoRateLimitForTests } from "@/lib/demo/rate-limit";
import { POST } from "@/app/api/demo/run/route";

function makeReq(headers: Record<string, string> = {}): NextRequest {
  return new NextRequest("http://localhost/api/demo/run", {
    method: "POST",
    headers,
  });
}

interface RunResponseOk {
  ok: true;
  runId: string;
  remainingHour: number;
}
interface RunResponseBlocked {
  ok: false;
  reason: "cooldown" | "quota";
  retryAfterSec: number;
  remainingHour: number;
}

beforeEach(() => {
  __resetDemoRateLimitForTests();
});

describe("/api/demo/run — rate-limit gate", () => {
  it("first call from an IP → 200 + runId UUID", async () => {
    const res = await POST(makeReq({ "x-forwarded-for": "1.2.3.4" }));
    expect(res.status).toBe(200);
    const body = (await res.json()) as RunResponseOk;
    expect(body.ok).toBe(true);
    expect(body.runId).toMatch(/^[0-9a-f-]{36}$/);
    expect(body.remainingHour).toBe(4);
  });

  it("AC-DEMO-5: second call within 60s from same IP → 429 cooldown", async () => {
    await POST(makeReq({ "x-forwarded-for": "9.9.9.9" }));
    const res = await POST(makeReq({ "x-forwarded-for": "9.9.9.9" }));
    expect(res.status).toBe(429);
    const body = (await res.json()) as RunResponseBlocked;
    expect(body.ok).toBe(false);
    expect(body.reason).toBe("cooldown");
    expect(body.retryAfterSec).toBeGreaterThan(0);
    expect(body.retryAfterSec).toBeLessThanOrEqual(60);
    // Retry-After header set so well-behaved clients honour it.
    expect(res.headers.get("Retry-After")).toBeTruthy();
  });

  it("different IPs do NOT share the cooldown window", async () => {
    await POST(makeReq({ "x-forwarded-for": "1.1.1.1" }));
    const res = await POST(makeReq({ "x-forwarded-for": "2.2.2.2" }));
    expect(res.status).toBe(200);
  });
});

describe("rate-limit unit tests — quota (AC-DEMO-5)", () => {
  it("6th call within an hour from the same fingerprint → quota block", async () => {
    const { consume } = await import("@/lib/demo/rate-limit");
    const fp = "10.0.0.1";
    const t0 = 1_700_000_000_000;
    // 5 runs spaced 61s apart → all succeed.
    for (let i = 0; i < 5; i += 1) {
      const r = consume(fp, t0 + i * 61_000);
      expect(r.ok).toBe(true);
    }
    // 6th run at t0 + 5*61s = within the hour → quota block.
    const sixth = consume(fp, t0 + 5 * 61_000);
    expect(sixth.ok).toBe(false);
    expect(sixth.reason).toBe("quota");
    expect(sixth.retryAfterSec).toBeGreaterThan(0);
  });

  it("after the hour rolls over the slot is reclaimed", async () => {
    const { consume } = await import("@/lib/demo/rate-limit");
    const fp = "10.0.0.2";
    const t0 = 1_800_000_000_000;
    for (let i = 0; i < 5; i += 1) {
      consume(fp, t0 + i * 61_000);
    }
    // > 1h after the first run, the oldest entry expires → quota free again.
    const after = consume(fp, t0 + 60 * 60 * 1000 + 1000);
    expect(after.ok).toBe(true);
  });
});
