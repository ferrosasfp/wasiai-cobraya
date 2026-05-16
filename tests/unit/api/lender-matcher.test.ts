import { describe, it, expect } from "vitest";
import { POST } from "@/app/api/agents/cobraya-lender-matcher/invoke/route";
import { NextRequest } from "next/server";
import type { AuctionResult } from "@/types/invoice";

function makeReq(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/agents/cobraya-lender-matcher/invoke", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("/api/agents/cobraya-lender-matcher/invoke (W4)", () => {
  it("T-MATCHER-1 band B food retail $48.5K → BBVA disqualified by band", async () => {
    const res = await POST(
      makeReq({
        band: "B",
        amountMXN: 48500,
        anchorBuyer: "Walmart México",
        sector: "food retail",
      }),
    );
    expect(res.status).toBe(200);
    const json = (await res.json()) as AuctionResult;
    expect(json.auction.length).toBeGreaterThanOrEqual(4);
    expect(json.auction[0].qualifies).toBe(true);
    const bbva = json.auction.find((a) => a.lenderId === "lender-bbva-bridge");
    expect(bbva).toBeDefined();
    expect(bbva!.qualifies).toBe(false);
  });

  it("T-MATCHER-2 band A apparel $28.2K → BBVA disqualified by amount", async () => {
    const res = await POST(
      makeReq({
        band: "A",
        amountMXN: 28200,
        anchorBuyer: "Bimbo",
        sector: "apparel",
      }),
    );
    const json = (await res.json()) as AuctionResult;
    const bbva = json.auction.find((a) => a.lenderId === "lender-bbva-bridge");
    expect(bbva!.rejectionReason).toBe("amount out of range");
  });

  it("T-MATCHER-3 band C construction → recommended Konfío, only one qualifies", async () => {
    const res = await POST(
      makeReq({
        band: "C",
        amountMXN: 156800,
        anchorBuyer: "Cemex",
        sector: "construction",
      }),
    );
    const json = (await res.json()) as AuctionResult;
    expect(json.recommendedLender).toBe("lender-konfio");
    const qualifying = json.auction.filter((a) => a.qualifies);
    expect(qualifying.length).toBe(1);
  });

  it("T-AUCTION-SHAPE all items have required fields + monotonic ranks", async () => {
    const res = await POST(
      makeReq({
        band: "A",
        amountMXN: 100000,
        anchorBuyer: "Walmart México",
        sector: "retail",
      }),
    );
    const json = (await res.json()) as AuctionResult;
    json.auction.forEach((a, i) => {
      expect(a.rank).toBe(i + 1);
      expect(typeof a.lenderId).toBe("string");
      expect(typeof a.netAmountUSDC).toBe("number");
      expect(typeof a.qualifies).toBe("boolean");
    });
  });

  it("T-AUCTION-DETERMINISM same input → same ordering", async () => {
    const body = {
      band: "A" as const,
      amountMXN: 100000,
      anchorBuyer: "Walmart México",
      sector: "retail",
    };
    const a = (await (await POST(makeReq(body))).json()) as AuctionResult;
    const b = (await (await POST(makeReq(body))).json()) as AuctionResult;
    expect(a.auction.map((x) => x.lenderId)).toEqual(b.auction.map((x) => x.lenderId));
    expect(a.recommendedLender).toBe(b.recommendedLender);
  });
});
