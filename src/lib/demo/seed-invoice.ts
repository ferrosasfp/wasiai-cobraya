// src/lib/demo/seed-invoice.ts — public /demo pre-seeded CFDI.
//
// The public demo runs the same agentic pipeline as /negociar but ALWAYS uses
// "Lupita · Tortillería La Esperanza" → Walmart, $48,500 MXN, 60 días. That's
// the canonical persona from the pitch deck (src/lib/mock-data.ts MOCK_PERSONAS[0]
// + BUYERS_TIER_1 Walmart entry) and from src/app/(marketing)/pitch/page.tsx
// ("Lupita los hace desde el celular. $48,500 MXN.").
//
// The UUID v4 must be FRESH on every run — the fraud-detector commits the
// invoice hash on-chain (CobrayaInvoiceCommitments contract) and would reject
// a second submission with `INVOICE_ALREADY_COMMITTED`. Same reason the regular
// /api/scan-invoice route calls crypto.randomUUID() on every POST.
//
// CD-9: only the public persona name + business name leak from this module.
// The RFC is the same synthetic RFC used in mock-data MOCK_PERSONAS — it's not
// a real fiscal identifier (it's marked as a demo persona).
import type { ScannedInvoicePayload } from "@/app/api/scan-invoice/route";

// Mirror MOCK_PERSONAS[0] from src/lib/mock-data.ts. Hard-coded here so a future
// reshuffle of mock-data ordering can't silently change what /demo shows.
const LUPITA_PERSONA = {
  rfcEmisor: "TLE850315ABC",
  personaName: "Lupita · Tortillería La Esperanza",
  // Mirrors BUYERS_TIER_1[0] (Walmart México, food retail).
  anchorBuyer: "Walmart México",
  sector: "food retail" as const,
  amountMXN: 48500,
  paymentTermsDays: 60 as const,
};

function isoDateOffset(days: number, base: Date = new Date()): string {
  const d = new Date(base.getTime() + days * 86400_000);
  return d.toISOString().slice(0, 10);
}

/**
 * Build a fresh ScannedInvoicePayload for the public /demo page. A new UUID v4
 * is generated on each call so the fraud-detector's on-chain commitment check
 * never collides with a previous /demo run.
 */
export function buildDemoInvoice(): ScannedInvoicePayload {
  return {
    uuidCfdi: crypto.randomUUID(),
    rfcEmisor: LUPITA_PERSONA.rfcEmisor,
    anchorBuyer: LUPITA_PERSONA.anchorBuyer,
    amountMXN: LUPITA_PERSONA.amountMXN,
    paymentTermsDays: LUPITA_PERSONA.paymentTermsDays,
    sector: LUPITA_PERSONA.sector,
    personaName: LUPITA_PERSONA.personaName,
    issueDate: isoDateOffset(0),
    dueDate: isoDateOffset(LUPITA_PERSONA.paymentTermsDays),
  };
}

// Exposed only for tests + documentation; runtime callers should use
// buildDemoInvoice() so they always get a fresh UUID.
export const DEMO_PERSONA_META = LUPITA_PERSONA;
