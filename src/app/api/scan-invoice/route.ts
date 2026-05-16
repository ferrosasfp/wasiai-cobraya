// src/app/api/scan-invoice/route.ts
// Returns a fresh CFDI with a unique v4 UUID. Persona-buyer pairing is
// semantically coherent (see generateRandomInvoice). No artificial delay
// here — the cinematic scan UX delay lives on the client.
//
// CD-9: no PII (full RFC) is logged to stdout; the issuer.rfc returned in the
// body is treated by downstream agents (validator, fraud-detector) which apply
// masking before persisting it to the audit trail.
import { NextResponse } from "next/server";
import { generateRandomInvoice } from "@/lib/mock-data";

export interface ScannedInvoicePayload {
  uuidCfdi: string;
  rfcEmisor: string;
  anchorBuyer: string;
  amountMXN: number;
  paymentTermsDays: 30 | 45 | 60 | 90;
  sector: "food retail" | "apparel" | "construction" | "services" | "retail";
  personaName: string;
  // Echo issueDate/dueDate so the UI can show "Vence en N días" without recomputing.
  issueDate: string;
  dueDate: string;
}

export async function POST(): Promise<NextResponse> {
  const inv = generateRandomInvoice();
  const body: ScannedInvoicePayload = {
    uuidCfdi: inv.uuid,
    rfcEmisor: inv.issuer.rfc,
    anchorBuyer: inv.anchorBuyer,
    amountMXN: inv.amount,
    paymentTermsDays: inv.paymentTermsDays as 30 | 45 | 60 | 90,
    sector: inv.sector,
    personaName: inv.issuer.name,
    issueDate: inv.issueDate,
    dueDate: inv.dueDate,
  };
  return NextResponse.json(body, { status: 200 });
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    { error: "method_not_allowed", allowed: ["POST"] },
    { status: 405, headers: { Allow: "POST" } },
  );
}
