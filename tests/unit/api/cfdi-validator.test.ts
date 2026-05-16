import { describe, it, expect, beforeEach } from "vitest";
import { POST } from "@/app/api/agents/cobraya-cfdi-validator/invoke/route";
import { __resetSeenUuids } from "@/lib/agent-state/validator-store";
import { NextRequest } from "next/server";

function makeReq(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/agents/cobraya-cfdi-validator/invoke", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

interface ValidatorResponse {
  isCompliant?: boolean;
  anchorBuyerTier?: 1 | "unknown";
  duplicateCheck?: "clean" | "duplicate";
  rfcEmisorMasked?: string;
  error?: string;
}

describe("/api/agents/cobraya-cfdi-validator/invoke (W2)", () => {
  beforeEach(() => {
    __resetSeenUuids();
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
    expect(json.duplicateCheck).toBe("clean");
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
    expect(json2.duplicateCheck).toBe("duplicate");
    expect(json2.isCompliant).toBe(false);
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
