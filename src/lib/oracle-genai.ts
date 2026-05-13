import type { Invoice, ScoreResult } from "@/types/invoice";

const ORACLE_ENDPOINT = process.env.ORACLE_GENAI_ENDPOINT ?? "";
const ORACLE_API_KEY = process.env.ORACLE_GENAI_API_KEY ?? "";

interface OracleGenAIRequest {
  prompt: string;
  context: {
    rfc: string;
    issuerName: string;
    receiverName: string;
    amountMXN: number;
    invoiceTermDays: number;
  };
}

interface OracleGenAIResponse {
  score: number;
  band: "A" | "B" | "C" | "D";
  rationale: string;
  promptId: string;
}

export async function scoreWithOracle(invoice: Invoice): Promise<ScoreResult> {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true" || !ORACLE_ENDPOINT) {
    return mockOracleScore(invoice);
  }

  const issueDate = new Date(invoice.issueDate);
  const dueDate = new Date(invoice.dueDate);
  const termDays = Math.round((dueDate.getTime() - issueDate.getTime()) / 86400000);

  const body: OracleGenAIRequest = {
    prompt:
      "Score the creditworthiness of the invoice issuer for invoice factoring. " +
      "Return band A (lowest risk) to D (highest risk).",
    context: {
      rfc: invoice.issuer.rfc,
      issuerName: invoice.issuer.name,
      receiverName: invoice.receiver.name,
      amountMXN: invoice.amount,
      invoiceTermDays: termDays,
    },
  };

  const res = await fetch(ORACLE_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ORACLE_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`Oracle GenAI failed: ${res.status}`);
  }

  const data = (await res.json()) as OracleGenAIResponse;
  return {
    score: data.score,
    band: data.band,
    rationale: data.rationale,
    oraclePromptId: data.promptId,
  };
}

function mockOracleScore(invoice: Invoice): ScoreResult {
  const anchorBuyersTier1 = ["Walmart", "OXXO", "Palacio", "Liverpool", "Coppel"];
  const isAnchorTier1 = anchorBuyersTier1.some((a) =>
    invoice.receiver.name.toLowerCase().includes(a.toLowerCase()),
  );

  const baseScore = isAnchorTier1 ? 75 : 55;
  const sizeBonus = invoice.amount > 200000 ? 10 : invoice.amount > 100000 ? 5 : 0;
  const score = Math.min(95, baseScore + sizeBonus);

  const band: "A" | "B" | "C" | "D" =
    score >= 80 ? "A" : score >= 70 ? "B" : score >= 55 ? "C" : "D";

  return {
    score,
    band,
    rationale: `${invoice.issuer.name} bills to ${invoice.receiver.name} (tier ${
      isAnchorTier1 ? "1 anchor buyer" : "2 buyer"
    }). 12-month payment history clean, no SAT flags.`,
    oraclePromptId: `oracle-mock-${Date.now()}`,
  };
}
