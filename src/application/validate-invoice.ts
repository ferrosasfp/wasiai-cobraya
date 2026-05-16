// src/application/validate-invoice.ts — W2 wired to local cobraya-cfdi-validator agent.
// Public signature preserved (Invoice → ValidatorResult) for backwards compat with /api/validate route.
import { isDemoMode } from "@/infra/env";
import { mockValidate } from "@/infra/mock-adapter";
import type { Invoice, ValidatorResult } from "@/types/invoice";

interface ValidatorAgentResponse {
  isCompliant: boolean;
  anchorBuyerTier: 1 | "unknown";
  policyId: string;
  duplicateCheck: "clean" | "duplicate";
  rfcEmisorMasked: string;
}

export async function validateInvoice(invoice: Invoice): Promise<ValidatorResult> {
  if (isDemoMode()) {
    return mockValidate(invoice);
  }

  // Server-side fetch to the local agent endpoint. The route runs in the
  // same Next.js process — this is effectively an internal call for the
  // demo orchestrator. For full compose via wasiai-a2a, the demo page
  // talks to /api/agents/* directly (see /demo/page.tsx W6).
  // CD-22: no x-a2a-key needed for internal calls (this is server-side
  // fetching its own endpoint).
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3010";
  const res = await fetch(`${base}/api/agents/cobraya-cfdi-validator/invoke`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      uuidCfdi: invoice.uuid,
      rfcEmisor: invoice.issuer.rfc,
      amountMXN: invoice.amount,
      anchorBuyer: invoice.anchorBuyer,
    }),
  });
  if (!res.ok) {
    return {
      isValid: false,
      cfdiUuid: invoice.uuid,
      satMatch: false,
      duplicateCheck: "clean",
      reason: `validator agent returned ${res.status}`,
    };
  }
  const data = (await res.json()) as ValidatorAgentResponse;
  return {
    isValid: data.isCompliant,
    cfdiUuid: invoice.uuid,
    satMatch: data.anchorBuyerTier === 1,
    duplicateCheck: data.duplicateCheck,
    reason: data.isCompliant ? undefined : `policy ${data.policyId} not satisfied`,
  };
}
