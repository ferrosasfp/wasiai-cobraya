import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { POST } from "@/app/api/agents/cobraya-cfdi-validator/invoke/route";
import { __resetSeenUuids } from "@/lib/agent-state/validator-store";
import { NextRequest } from "next/server";

function makeReq(body: unknown, headers: Record<string, string> = {}): NextRequest {
  return new NextRequest("http://localhost/api/agents/cobraya-cfdi-validator/invoke", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

interface ValidatorResponse {
  isCompliant?: boolean;
  anchorBuyerTier?: 1 | "unknown";
  duplicateCheckInstance?: "clean" | "duplicate";
  rfcEmisorMasked?: string;
  error?: string;
}

describe("/api/agents/cobraya-cfdi-validator/invoke (W2)", () => {
  beforeEach(() => {
    __resetSeenUuids();
    vi.unstubAllEnvs();
    vi.stubEnv("AUDIT_AUTH_SECRET", "test-audit-secret-fix-pack");
    vi.stubEnv(
      "VALIDATOR_HOT_KEY",
      "0x3333333333333333333333333333333333333333333333333333333333333333",
    );
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("T-CFDI-1 happy path Walmart + valid UUID → isCompliant:true, tier 1, clean", async () => {
    const res = await POST(
      makeReq({
        uuidCfdi: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        rfcEmisor: "TLE850120ABC",
        amountMXN: 48500,
        anchorBuyer: "Walmart México",
      }),
    );
    expect(res.status).toBe(200);
    const json = (await res.json()) as ValidatorResponse;
    expect(json.isCompliant).toBe(true);
    expect(json.anchorBuyerTier).toBe(1);
    expect(json.duplicateCheckInstance).toBe("clean");
  });

  it("T-CFDI-2 unknown buyer 'AcmeCorp' → isCompliant:false, tier 'unknown'", async () => {
    const res = await POST(
      makeReq({
        uuidCfdi: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
        rfcEmisor: "ACME920101XYZ",
        amountMXN: 100000,
        anchorBuyer: "AcmeCorp",
      }),
    );
    expect(res.status).toBe(200);
    const json = (await res.json()) as ValidatorResponse;
    expect(json.isCompliant).toBe(false);
    expect(json.anchorBuyerTier).toBe("unknown");
  });

  it("T-CFDI-3 invalid UUID format → 400 invalid_input", async () => {
    const res = await POST(
      makeReq({
        uuidCfdi: "not-a-uuid",
        rfcEmisor: "TLE850120ABC",
        amountMXN: 48500,
        anchorBuyer: "Walmart México",
      }),
    );
    expect(res.status).toBe(400);
    const json = (await res.json()) as ValidatorResponse;
    expect(json.error).toBe("invalid_input");
  });

  it("T-CFDI-4 amountMXN:0 → 400", async () => {
    const res = await POST(
      makeReq({
        uuidCfdi: "cccccccc-cccc-cccc-cccc-cccccccccccc",
        rfcEmisor: "TLE850120ABC",
        amountMXN: 0,
        anchorBuyer: "Walmart México",
      }),
    );
    expect(res.status).toBe(400);
  });

  it("T-CFDI-5 second POST same UUID → duplicate, isCompliant:false", async () => {
    const dup = "dddddddd-dddd-dddd-dddd-dddddddddddd";
    const body = {
      uuidCfdi: dup,
      rfcEmisor: "TLE850120ABC",
      amountMXN: 48500,
      anchorBuyer: "Walmart México",
    };
    await POST(makeReq(body));
    const res2 = await POST(makeReq(body));
    const json2 = (await res2.json()) as ValidatorResponse;
    expect(json2.duplicateCheckInstance).toBe("duplicate");
    expect(json2.isCompliant).toBe(false);
  });

  it("T-AGENT-MASK-RFC step.input in audit JSON masks rfcEmisor (BLQ-ALTO-2B)", async () => {
    const id = "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeed";
    await POST(
      makeReq(
        {
          uuidCfdi: "ffffffff-ffff-ffff-ffff-ffffffffffff",
          rfcEmisor: "TLE850120ABC",
          amountMXN: 48500,
          anchorBuyer: "Walmart México",
        },
        { "x-cobraya-request-id": id },
      ),
    );
    const { getTrail } = await import("@/infra/agent-signer");
    const trail = getTrail(id);
    expect(trail).toBeDefined();
    const stepInputJson = JSON.stringify(trail!.steps[0]?.input ?? {});
    // The masked field must be present (4-char prefix to match validator output mask).
    expect(stepInputJson).toContain("TLE8***");
    // The raw RFC must NOT leak into step.input.
    expect(stepInputJson).not.toContain("TLE850120ABC");
  });

  it("T-REQID-INVALID-CFDI x-cobraya-request-id with CRLF junk → 400 (BLQ-MED-1)", async () => {
    const res = await POST(
      makeReq(
        {
          uuidCfdi: "11111111-1111-1111-1111-111111111111",
          rfcEmisor: "TLE850120ABC",
          amountMXN: 48500,
          anchorBuyer: "Walmart México",
        },
        { "x-cobraya-request-id": "poison-not-a-uuid" },
      ),
    );
    expect(res.status).toBe(400);
    const json = (await res.json()) as { error?: string };
    expect(json.error).toBe("invalid_request_id");
  });

  it("T-AUDIT-COOKIE-EMITTED cfdi-validator response sets cobraya_audit_token cookie", async () => {
    const id = "22222222-2222-2222-2222-222222222222";
    const res = await POST(
      makeReq(
        {
          uuidCfdi: "33333333-3333-3333-3333-333333333333",
          rfcEmisor: "TLE850120ABC",
          amountMXN: 48500,
          anchorBuyer: "Walmart México",
        },
        { "x-cobraya-request-id": id },
      ),
    );
    expect(res.status).toBe(200);
    const setCookie = res.headers.get("set-cookie") ?? "";
    expect(setCookie).toContain(`cobraya_audit_token_${id}=`);
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toContain("SameSite=Strict");
  });

  it("T-AGENT-RECEIPT-FAIL hot key missing → 200 with receipt:null + warn log (BLQ-BAJO-3)", async () => {
    // Hot key not stubbed → signReceipt throws → catch sets receipt=null +
    // emits a structured console.warn. Response stays 200.
    vi.unstubAllEnvs();
    vi.stubEnv("AUDIT_AUTH_SECRET", "test-audit-secret-fix-pack");
    // VALIDATOR_HOT_KEY deliberately NOT set.
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const res = await POST(
      makeReq({
        uuidCfdi: "44444444-4444-4444-4444-444444444444",
        rfcEmisor: "TLE850120ABC",
        amountMXN: 48500,
        anchorBuyer: "Walmart México",
      }),
    );
    expect(res.status).toBe(200);
    const json = (await res.json()) as { receipt: unknown };
    expect(json.receipt).toBeNull();
    // Warn was emitted with structured fields — no stack, no err.message.
    expect(warnSpy).toHaveBeenCalledWith(
      "[cobraya-agent-receipt] signing failed:",
      expect.objectContaining({
        agentSlug: "cobraya-cfdi-validator",
        errorName: expect.any(String),
      }),
    );
    // Verify the warn payload does NOT include `stack` or `message`.
    const payload = warnSpy.mock.calls[0]?.[1] as Record<string, unknown> | undefined;
    expect(payload).toBeDefined();
    expect(payload!.stack).toBeUndefined();
    expect(payload!.message).toBeUndefined();
    warnSpy.mockRestore();
  });

  it("T-CFDI-MASK response masks rfcEmisor (CD-23)", async () => {
    const res = await POST(
      makeReq({
        uuidCfdi: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
        rfcEmisor: "TLE850120ABC",
        amountMXN: 48500,
        anchorBuyer: "Walmart México",
      }),
    );
    const json = (await res.json()) as ValidatorResponse;
    expect(json.rfcEmisorMasked).toMatch(/^TLE8\*\*\*$/);
    // Raw rfcEmisor MUST NOT appear in JSON output
    const raw = JSON.stringify(json);
    expect(raw).not.toContain("TLE850120ABC");
  });
});
