import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

function makeReq(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/settle", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

interface SettleResponse {
  receipt?: {
    txHash?: string;
    deliveredAmountUSDC?: number;
  };
  error?: string;
  testnetCapUSDC?: number;
  requestedUSDC?: number;
  message?: string;
}

describe("/api/settle (W5)", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("T-SETTLE-1 happy path demo mode → receipt with mock tx hash", async () => {
    vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "true");
    vi.stubEnv("ONCHAIN_AMOUNT_CAP_USDC", "0.05");
    const { POST } = await import("@/app/api/settle/route");
    const res = await POST(
      makeReq({
        match: { lenderId: "lender-konfio", lenderName: "Konfío Express", netAmountUSDC: 0.04 },
      }),
    );
    expect(res.status).toBe(200);
    const json = (await res.json()) as SettleResponse;
    expect(json.receipt?.txHash).toMatch(/^0x[0-9a-f]+$/);
    expect(json.receipt?.deliveredAmountUSDC).toBe(0.04);
  });

  it("T-SETTLE-2 amount > cap → 422 cap_exceeded (CD-5, AC-7)", async () => {
    vi.stubEnv("ONCHAIN_AMOUNT_CAP_USDC", "0.05");
    const { POST } = await import("@/app/api/settle/route");
    const res = await POST(
      makeReq({
        match: { lenderId: "lender-konfio", lenderName: "Konfío Express", netAmountUSDC: 0.06 },
      }),
    );
    expect(res.status).toBe(422);
    const json = (await res.json()) as SettleResponse;
    expect(json.error).toBe("cap_exceeded");
    expect(json.testnetCapUSDC).toBe(0.05);
    expect(json.requestedUSDC).toBe(0.06);
  });

  it("T-SETTLE-3 facilitator throws → 502 settle_failed", async () => {
    vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "false");
    vi.stubEnv("ONCHAIN_AMOUNT_CAP_USDC", "0.05");
    vi.stubEnv(
      "TREASURY_PRIVATE_KEY",
      "0x1111111111111111111111111111111111111111111111111111111111111111",
    );
    vi.stubEnv("USDC_ADDRESS", "0x5425890298aed601595a70AB815c96711a31Bc65");
    vi.stubEnv("OWNER_ADDRESS", "0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa");

    vi.doMock("@/infra/facilitator-client", () => ({
      settleOnFacilitator: async () => {
        throw new Error("facilitator-down");
      },
    }));

    const { POST } = await import("@/app/api/settle/route");
    const res = await POST(
      makeReq({
        match: { lenderId: "lender-konfio", lenderName: "Konfío Express", netAmountUSDC: 0.04 },
      }),
    );
    expect(res.status).toBe(502);
    const json = (await res.json()) as SettleResponse;
    expect(json.error).toBe("settle_failed");
  });

  it("T-SETTLE-NO-OVERRIDE attacker sends smeWalletOverride → field ignored, settles to OWNER", async () => {
    // DT-Q (post-AR fix-pack BLQ-ALTO-1): `smeWalletOverride` must not redirect
    // the settle destination. The endpoint must silently drop the field and
    // resolve `to` from `OWNER_ADDRESS` server-side.
    vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "true");
    vi.stubEnv("ONCHAIN_AMOUNT_CAP_USDC", "0.05");
    vi.stubEnv("OWNER_ADDRESS", "0x1234567890123456789012345678901234567890");
    const attackerWallet = "0xDEADBEEFcafebabe0000000000000000000000ad";

    const { POST } = await import("@/app/api/settle/route");
    const res = await POST(
      makeReq({
        match: { lenderId: "lender-konfio", lenderName: "Konfío Express", netAmountUSDC: 0.04 },
        smeWalletOverride: attackerWallet, // attacker-controlled — must be ignored
      }),
    );
    expect(res.status).toBe(200);
    const json = (await res.json()) as SettleResponse;
    // Sanity: receipt is built even though override was supplied.
    expect(json.receipt?.txHash).toMatch(/^0x[0-9a-f]+$/);
    // The attacker wallet must NEVER appear anywhere in the response (which
    // includes the demo authorization echo).
    const raw = JSON.stringify(json);
    expect(raw.toLowerCase()).not.toContain(attackerWallet.toLowerCase());
  });

  it("T-SETTLE-4 missing TREASURY_PRIVATE_KEY → 502 with no key leak", async () => {
    vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "false");
    vi.stubEnv("ONCHAIN_AMOUNT_CAP_USDC", "0.05");
    vi.stubEnv("TREASURY_PRIVATE_KEY", "");
    vi.stubEnv("USDC_ADDRESS", "0x5425890298aed601595a70AB815c96711a31Bc65");

    const { POST } = await import("@/app/api/settle/route");
    const res = await POST(
      makeReq({
        match: { lenderId: "lender-konfio", lenderName: "Konfío Express", netAmountUSDC: 0.04 },
      }),
    );
    expect(res.status).toBe(502);
    const json = (await res.json()) as SettleResponse;
    expect(json.error).toBe("settle_failed");
    // Must NOT contain anything that looks like a key
    const raw = JSON.stringify(json);
    expect(raw).not.toContain("1111111111111111");
  });
});
