// src/application/match-lender.ts — W4 wired to local lender-matcher agent.
// Public signature preserved (Invoice, ScoreResult → LenderMatch).
import { isDemoMode } from "@/infra/env";
import { mockMatch } from "@/infra/mock-adapter";
import { mxnToUSDC } from "@/core/settlement";
import type { AuctionResult, Invoice, LenderMatch, ScoreResult } from "@/types/invoice";

export async function matchLender(invoice: Invoice, score: ScoreResult): Promise<LenderMatch> {
  if (isDemoMode()) {
    return mockMatch(invoice, score);
  }

  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3010";
  try {
    const res = await fetch(`${base}/api/agents/cobraya-lender-matcher/invoke`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        band: score.band,
        amountMXN: invoice.amount,
        anchorBuyer: invoice.anchorBuyer,
        sector: invoice.sector,
      }),
    });
    if (!res.ok) throw new Error(`lender-matcher agent returned ${res.status}`);
    const auction = (await res.json()) as AuctionResult;
    const winner = auction.auction.find((a) => a.qualifies);
    const grossUSDC = mxnToUSDC(invoice.amount);
    if (!winner) {
      return {
        lenderId: "no-match",
        lenderName: "Sin lender que califique",
        advanceRate: 0,
        rateAPR: 0,
        estimatedSettlement: { grossUSDC, feeUSDC: 0, netUSDC: 0 },
      };
    }
    return {
      lenderId: winner.lenderId,
      lenderName: winner.lenderName,
      advanceRate: winner.advanceRatePct / 100,
      rateAPR: winner.aprPct,
      estimatedSettlement: {
        grossUSDC,
        feeUSDC: Math.round((grossUSDC * (winner.advanceRatePct / 100) - winner.netAmountUSDC) * 10000) / 10000,
        netUSDC: winner.netAmountUSDC,
      },
    };
  } catch {
    return mockMatch(invoice, score);
  }
}
