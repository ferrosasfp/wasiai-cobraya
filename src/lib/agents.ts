import type { Invoice, LenderMatch, ScoreResult, ValidatorResult } from "@/types/invoice";

const A2A_URL = process.env.WASIAI_A2A_URL ?? "https://wasiai-a2a-production.up.railway.app";
const A2A_KEY = process.env.A2A_KEY ?? "";

interface ComposeStep {
  agent: string;
  capability: string;
  input: Record<string, unknown>;
}

interface ComposeResponse {
  results: Array<{
    agent: string;
    output: Record<string, unknown>;
  }>;
}

async function composeOnA2A(steps: ComposeStep[]): Promise<ComposeResponse> {
  const res = await fetch(`${A2A_URL}/compose`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-a2a-key": A2A_KEY,
    },
    body: JSON.stringify({ steps }),
  });
  if (!res.ok) {
    throw new Error(`A2A compose failed: ${res.status} ${await res.text()}`);
  }
  return (await res.json()) as ComposeResponse;
}

export async function runValidator(invoice: Invoice): Promise<ValidatorResult> {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
    return mockValidator(invoice);
  }
  const response = await composeOnA2A([
    {
      agent: "invoice-validator",
      capability: "cfdi.validate",
      input: { uuid: invoice.uuid, issuerRfc: invoice.issuer.rfc, amount: invoice.amount },
    },
  ]);
  return response.results[0].output as unknown as ValidatorResult;
}

export async function runScorer(invoice: Invoice): Promise<ScoreResult> {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
    return mockScorer(invoice);
  }
  const response = await composeOnA2A([
    {
      agent: "credit-scorer",
      capability: "credit.score",
      input: { issuerRfc: invoice.issuer.rfc, amount: invoice.amount, currency: invoice.currency },
    },
  ]);
  return response.results[0].output as unknown as ScoreResult;
}

export async function runMatcher(invoice: Invoice, score: ScoreResult): Promise<LenderMatch> {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
    return mockMatcher(invoice, score);
  }
  const response = await composeOnA2A([
    {
      agent: "lender-matcher",
      capability: "lender.match",
      input: { amount: invoice.amount, currency: invoice.currency, band: score.band },
    },
  ]);
  return response.results[0].output as unknown as LenderMatch;
}

function mockValidator(invoice: Invoice): ValidatorResult {
  return {
    isValid: true,
    cfdiUuid: invoice.uuid,
    satMatch: true,
    duplicateCheck: "clean",
  };
}

function mockScorer(invoice: Invoice): ScoreResult {
  const ranges: Array<{ min: number; band: "A" | "B" | "C" | "D"; score: number }> = [
    { min: 200000, band: "A", score: 87 },
    { min: 100000, band: "B", score: 74 },
    { min: 20000, band: "C", score: 62 },
    { min: 0, band: "D", score: 49 },
  ];
  const hit = ranges.find((r) => invoice.amount >= r.min) ?? ranges[ranges.length - 1];
  return {
    score: hit.score,
    band: hit.band,
    rationale: `Issuer ${invoice.issuer.name} has consistent 30-day payment history with anchor buyer ${invoice.receiver.name}.`,
    oraclePromptId: "oracle-genai-mock-prompt-001",
  };
}

function mockMatcher(invoice: Invoice, score: ScoreResult): LenderMatch {
  const mxnUsdcRate = 19.85;
  const grossUSDC = Math.round((invoice.amount / mxnUsdcRate) * 100) / 100;

  const lenders = [
    { id: "lnd-arkangeles-fund-i", name: "Arkangeles Fund I", apr: 14.5, advance: 0.92, accepts: ["A", "B"] },
    { id: "lnd-bankaool-sme", name: "Bankaool SME Pool", apr: 18.0, advance: 0.88, accepts: ["A", "B", "C"] },
    { id: "lnd-latam-yield-dao", name: "LATAM Yield DAO", apr: 24.0, advance: 0.80, accepts: ["B", "C", "D"] },
  ];
  const pick = lenders.find((l) => l.accepts.includes(score.band)) ?? lenders[lenders.length - 1];

  const advanced = grossUSDC * pick.advance;
  const fee = Math.round((advanced * (pick.apr / 100) * (60 / 365)) * 100) / 100;
  const net = Math.round((advanced - fee) * 100) / 100;

  return {
    lenderId: pick.id,
    lenderName: pick.name,
    advanceRate: pick.advance,
    rateAPR: pick.apr,
    estimatedSettlement: {
      grossUSDC: Math.round(advanced * 100) / 100,
      feeUSDC: fee,
      netUSDC: net,
    },
  };
}
