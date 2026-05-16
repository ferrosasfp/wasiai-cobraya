import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

function makeReq(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/agents/cobraya-fraud-detector/invoke", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

interface FraudResponse {
  isUnique?: boolean;
  commitTxHash?: string;
  rejectReason?: string;
  error?: string;
}

describe("/api/agents/cobraya-fraud-detector/invoke (W2.5)", () => {
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

  it("T-FRAUD-DEMO demo mode → returns mockFraudCheck output", async () => {
    vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "true");
    const { POST } = await import("@/app/api/agents/cobraya-fraud-detector/invoke/route");
    const res = await POST(
      makeReq({ uuidCfdi: "abc", rfcEmisor: "TLE850120ABC", amountMXN: 48500 }),
    );
    expect(res.status).toBe(200);
    const json = (await res.json()) as FraudResponse;
    expect(json.isUnique).toBe(true);
    expect(json.commitTxHash).toBe("0xMOCK_FRAUD_TX_HASH_DEMO_MODE");
  });

  it("T-FRAUD-3 invalid body (missing uuidCfdi) → 400", async () => {
    vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "false");
    const { POST } = await import("@/app/api/agents/cobraya-fraud-detector/invoke/route");
    const res = await POST(makeReq({ rfcEmisor: "TLE850120ABC", amountMXN: 48500 }));
    expect(res.status).toBe(400);
  });

  it("T-FRAUD-1 not configured (missing env) → 503 (defensive)", async () => {
    vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "false");
    vi.stubEnv("AVALANCHE_RPC_URL", "");
    vi.stubEnv("COBRAYA_COMMITMENTS_ADDRESS", "");
    vi.stubEnv("FRAUD_DETECTOR_PRIVATE_KEY", "");
    const { POST } = await import("@/app/api/agents/cobraya-fraud-detector/invoke/route");
    const res = await POST(
      makeReq({ uuidCfdi: "abc", rfcEmisor: "TLE850120ABC", amountMXN: 48500 }),
    );
    expect(res.status).toBe(503);
    const json = (await res.json()) as FraudResponse;
    expect(json.error).toBe("fraud_detector_not_configured");
  });

  it("T-FRAUD-2 viem readContract returns active=true → isUnique:false, no writeContract", async () => {
    vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "false");
    vi.stubEnv("AVALANCHE_RPC_URL", "https://api.avax-test.network/ext/bc/C/rpc");
    vi.stubEnv("COBRAYA_COMMITMENTS_ADDRESS", "0x5F8F8a31e51d8B2FEe0E0C2f1AffC3B4c6B12506");
    vi.stubEnv(
      "FRAUD_DETECTOR_PRIVATE_KEY",
      "0x1111111111111111111111111111111111111111111111111111111111111111",
    );

    const readContract = vi.fn(async () => [true, 12345n, "0xABCDEF1234567890123456789012345678901234"]);
    const writeContract = vi.fn(async () => "0xfeedbeef");
    const waitForTransactionReceipt = vi.fn(async () => ({ blockNumber: 99n }));

    vi.doMock("viem", async (orig) => {
      const real = await (orig() as Promise<Record<string, unknown>>);
      return {
        ...real,
        createPublicClient: () => ({ readContract, waitForTransactionReceipt }),
        createWalletClient: () => ({ writeContract }),
      };
    });

    const { POST } = await import("@/app/api/agents/cobraya-fraud-detector/invoke/route");
    const res = await POST(
      makeReq({ uuidCfdi: "abc", rfcEmisor: "TLE850120ABC", amountMXN: 48500 }),
    );
    expect(res.status).toBe(200);
    const json = (await res.json()) as FraudResponse;
    expect(json.isUnique).toBe(false);
    expect(json.rejectReason).toBe("INVOICE_ALREADY_COMMITTED");
    expect(writeContract).not.toHaveBeenCalled();
  });

  it("T-FRAUD-4 readContract throws → 502 NETWORK_ERROR (no crash)", async () => {
    vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "false");
    vi.stubEnv("AVALANCHE_RPC_URL", "https://api.avax-test.network/ext/bc/C/rpc");
    vi.stubEnv("COBRAYA_COMMITMENTS_ADDRESS", "0x5F8F8a31e51d8B2FEe0E0C2f1AffC3B4c6B12506");
    vi.stubEnv(
      "FRAUD_DETECTOR_PRIVATE_KEY",
      "0x1111111111111111111111111111111111111111111111111111111111111111",
    );
    const readContract = vi.fn(async () => {
      throw new Error("network down");
    });
    vi.doMock("viem", async (orig) => {
      const real = await (orig() as Promise<Record<string, unknown>>);
      return {
        ...real,
        createPublicClient: () => ({
          readContract,
          waitForTransactionReceipt: async () => ({ blockNumber: 0n }),
        }),
        createWalletClient: () => ({ writeContract: async () => "0x" }),
      };
    });
    const { POST } = await import("@/app/api/agents/cobraya-fraud-detector/invoke/route");
    const res = await POST(
      makeReq({ uuidCfdi: "abc", rfcEmisor: "TLE850120ABC", amountMXN: 48500 }),
    );
    expect(res.status).toBe(502);
    const json = (await res.json()) as FraudResponse;
    expect(json.rejectReason).toBe("NETWORK_ERROR");
    // CD-9: must not contain the private key
    const raw = JSON.stringify(json);
    expect(raw).not.toContain("1111111111111111111111111111111111111111111111111111111111111111");
  });
});
