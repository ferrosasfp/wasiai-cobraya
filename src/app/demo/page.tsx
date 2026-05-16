// src/app/demo/page.tsx — Cobraya dynamic invoices flow
// Phase 0  marketplace /discover (mantenido a través de AuditPanel/TraceConsole
//          que muestran resultados de pipeline previo).
// Phase 1  InvoiceScanner — el usuario "escanea" la factura, se genera un CFDI
//          fresh con UUID v4 único, y aparece la InvoiceCard en state "pending".
// Phase 2  User taps "Negociar esta factura" → 4-step compose pipeline.
// Phase 3  Sign & Settle.
// Phase 4  InvoiceCard morph a state "sold" + botón "Escanear otra factura"
//          reinicia el flow manteniendo histórico de sesión.
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type {
  Invoice,
  ScoreResult,
  AuctionResult,
  AuctionLender,
} from "@/types/invoice";
import type { ScannedInvoicePayload } from "@/app/api/scan-invoice/route";
import { BrandIcon } from "@/components/BrandIcon";
import { InvoiceScanner } from "@/components/InvoiceScanner";
import { InvoiceCard, type InvoiceCardState } from "@/components/InvoiceCard";
import { PipelineProgress } from "@/components/PipelineProgress";
import { LenderAuctionPanel } from "@/components/LenderAuctionPanel";
import { Settlement } from "@/components/Settlement";
import { AuditPanel, type AuditStepDisplay } from "@/components/AuditPanel";
import { TraceConsole } from "@/components/TraceConsole";

interface ValidatorResponse {
  isCompliant: boolean;
  anchorBuyerTier: 1 | "unknown";
  policyId: string;
  duplicateCheckInstance: "clean" | "duplicate";
  rfcEmisorMasked: string;
}

interface FraudResponse {
  isUnique: boolean;
  commitmentHash: `0x${string}`;
  commitTxHash?: `0x${string}`;
}

interface SettlementReceiptShape {
  txHash?: `0x${string}`;
  snowtraceUrl?: string;
  deliveredAmountUSDC?: number;
}

interface SoldInvoice {
  scanned: ScannedInvoicePayload;
  lenderName: string;
  netAmountUSDC: number;
  txHash: `0x${string}`;
  snowtraceUrl?: string;
  requestId: string;
}

function scannedToInvoice(s: ScannedInvoicePayload): Invoice {
  return {
    id: `inv-${s.uuidCfdi}`,
    uuid: s.uuidCfdi,
    uuidSat: s.uuidCfdi,
    issuer: { name: s.personaName, rfc: s.rfcEmisor },
    receiver: { name: s.anchorBuyer, rfc: "" },
    amount: s.amountMXN,
    currency: "MXN",
    issueDate: s.issueDate,
    dueDate: s.dueDate,
    anchorBuyer: s.anchorBuyer,
    paymentTermsDays: s.paymentTermsDays,
    sector: s.sector,
    status: "issued",
  };
}

function parseSettleReceipt(s: unknown): SettlementReceiptShape | null {
  if (!s || typeof s !== "object") return null;
  const obj = s as Record<string, unknown>;
  const candidate =
    obj.receipt && typeof obj.receipt === "object"
      ? (obj.receipt as Record<string, unknown>)
      : obj;
  if (typeof candidate.txHash !== "string") return null;
  return {
    txHash: candidate.txHash as `0x${string}`,
    snowtraceUrl:
      typeof candidate.snowtraceUrl === "string" ? candidate.snowtraceUrl : undefined,
    deliveredAmountUSDC:
      typeof candidate.deliveredAmountUSDC === "number"
        ? candidate.deliveredAmountUSDC
        : undefined,
  };
}

export default function DemoPage() {
  const [requestId, setRequestId] = useState<string | null>(null);
  const [scanned, setScanned] = useState<ScannedInvoicePayload | null>(null);
  const [cardState, setCardState] = useState<InvoiceCardState>("pending");
  const [cardError, setCardError] = useState<string | null>(null);

  const [validator, setValidator] = useState<ValidatorResponse | null>(null);
  const [fraud, setFraud] = useState<FraudResponse | null>(null);
  const [score, setScore] = useState<ScoreResult | null>(null);
  const [auction, setAuction] = useState<AuctionResult | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<AuctionLender | null>(null);
  const [settlement, setSettlement] = useState<unknown>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latencies, setLatencies] = useState<Record<number, number>>({});

  // Session histórico — facturas vendidas en esta sesión.
  const [soldHistory, setSoldHistory] = useState<SoldInvoice[]>([]);

  function resetForNextScan() {
    setRequestId(null);
    setScanned(null);
    setCardState("pending");
    setCardError(null);
    setValidator(null);
    setFraud(null);
    setScore(null);
    setAuction(null);
    setSelectedMatch(null);
    setSettlement(null);
    setError(null);
    setLatencies({});
  }

  function handleScanConfirm(payload: ScannedInvoicePayload) {
    setScanned(payload);
    setCardState("pending");
    setCardError(null);
  }

  async function runPipeline() {
    if (!scanned || isRunning) return;
    const inv = scannedToInvoice(scanned);
    setValidator(null);
    setFraud(null);
    setScore(null);
    setAuction(null);
    setSelectedMatch(null);
    setSettlement(null);
    setError(null);
    setCardError(null);
    setLatencies({});
    setIsRunning(true);
    setCardState("negotiating");
    const id = crypto.randomUUID();
    setRequestId(id);

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "x-cobraya-request-id": id,
    };

    try {
      // Step 1 serial — validator.
      const t0 = Date.now();
      const vRes = await fetch("/api/agents/cobraya-cfdi-validator/invoke", {
        method: "POST",
        headers,
        body: JSON.stringify({
          uuidCfdi: inv.uuid,
          rfcEmisor: inv.issuer.rfc,
          amountMXN: inv.amount,
          anchorBuyer: inv.anchorBuyer,
        }),
      });
      const vJson = (await vRes.json()) as ValidatorResponse;
      setValidator(vJson);
      setLatencies((m) => ({ ...m, 0: Date.now() - t0 }));
      if (!vJson.isCompliant) {
        setError("CFDI no compliant — pipeline stopped");
        setCardState("failed");
        setCardError("CFDI no compliant");
        return;
      }

      // Steps 2 + 3 parallel (DT-J).
      const t1 = Date.now();
      const [fRes, sRes] = await Promise.all([
        fetch("/api/agents/cobraya-fraud-detector/invoke", {
          method: "POST",
          headers,
          body: JSON.stringify({
            uuidCfdi: inv.uuid,
            rfcEmisor: inv.issuer.rfc,
            amountMXN: inv.amount,
          }),
        }),
        fetch("/api/agents/cobraya-credit-scorer/invoke", {
          method: "POST",
          headers,
          body: JSON.stringify({
            amountMXN: inv.amount,
            anchorBuyer: inv.anchorBuyer,
            paymentTermsDays: inv.paymentTermsDays,
            sector: inv.sector,
          }),
        }),
      ]);
      const fJson = (await fRes.json()) as FraudResponse;
      const sJson = (await sRes.json()) as ScoreResult;
      setFraud(fJson);
      setScore(sJson);
      const parallelLatency = Date.now() - t1;
      setLatencies((m) => ({ ...m, 1: parallelLatency, 2: parallelLatency }));
      if (!fJson.isUnique) {
        setError("Invoice already committed onchain");
        setCardState("failed");
        setCardError("Factura ya cedida onchain");
        return;
      }

      // Step 4 serial — matcher.
      const t3 = Date.now();
      const mRes = await fetch("/api/agents/cobraya-lender-matcher/invoke", {
        method: "POST",
        headers,
        body: JSON.stringify({
          band: sJson.band,
          amountMXN: inv.amount,
          anchorBuyer: inv.anchorBuyer,
          sector: inv.sector,
        }),
      });
      const aJson = (await mRes.json()) as AuctionResult;
      setAuction(aJson);
      setLatencies((m) => ({ ...m, 3: Date.now() - t3 }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Pipeline failed";
      setError(msg);
      setCardState("failed");
      setCardError(msg);
    } finally {
      setIsRunning(false);
    }
  }

  async function signAndSettle() {
    if (!selectedMatch || !requestId || isSigning || !scanned) return;
    setIsSigning(true);
    setError(null);
    try {
      const res = await fetch("/api/settle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-cobraya-request-id": requestId,
        },
        body: JSON.stringify({
          match: {
            lenderId: selectedMatch.lenderId,
            lenderName: selectedMatch.lenderName,
            netAmountUSDC: selectedMatch.netAmountUSDC,
          },
        }),
      });
      const json = (await res.json()) as unknown;
      setSettlement(json);
      const receipt = parseSettleReceipt(json);
      if (receipt && receipt.txHash) {
        const sold: SoldInvoice = {
          scanned,
          lenderName: selectedMatch.lenderName,
          netAmountUSDC: receipt.deliveredAmountUSDC ?? selectedMatch.netAmountUSDC,
          txHash: receipt.txHash,
          snowtraceUrl: receipt.snowtraceUrl,
          requestId,
        };
        setSoldHistory((prev) => [sold, ...prev]);
        setCardState("sold");
      } else {
        setCardState("failed");
        setCardError("Settlement sin tx hash");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Settle failed";
      setError(msg);
      setCardState("failed");
      setCardError(msg);
    } finally {
      setIsSigning(false);
    }
  }

  // Derive AuditPanel rows from in-flight state.
  const auditSteps = useMemo<AuditStepDisplay[]>(() => {
    const rows: AuditStepDisplay[] = [];
    if (validator) {
      rows.push({
        stepIndex: 0,
        agentSlug: "cobraya-cfdi-validator",
        success: validator.isCompliant,
        latencyMs: latencies[0] ?? 0,
      });
    }
    if (fraud) {
      rows.push({
        stepIndex: 1,
        agentSlug: "cobraya-fraud-detector",
        success: fraud.isUnique,
        latencyMs: latencies[1] ?? 0,
      });
    }
    if (score) {
      rows.push({
        stepIndex: 2,
        agentSlug: "cobraya-credit-scorer",
        success: true,
        latencyMs: latencies[2] ?? 0,
      });
    }
    if (auction) {
      rows.push({
        stepIndex: 3,
        agentSlug: "cobraya-lender-matcher",
        success: auction.recommendedLender !== null,
        latencyMs: latencies[3] ?? 0,
      });
    }
    return rows;
  }, [validator, fraud, score, auction, latencies]);

  const settleReceipt = parseSettleReceipt(settlement);
  const isSettled = settleReceipt !== null && cardState === "sold";

  return (
    <main className="min-h-screen pb-32 px-4 pt-6 max-w-3xl mx-auto">
      <header className="flex items-center justify-between mb-6">
        <Link href="/" className="flex items-center gap-3" aria-label="Cobraya home">
          <BrandIcon />
          <span className="serif text-2xl">Cobraya</span>
        </Link>
        <span className="mono text-[10px] uppercase tracking-widest text-muted">
          Avalanche Fuji
        </span>
      </header>

      {soldHistory.length > 0 && (
        <div className="mb-4 border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs mono text-emerald-800">
          Has vendido {soldHistory.length}{" "}
          {soldHistory.length === 1 ? "factura" : "facturas"} hoy
        </div>
      )}

      {/* Phase 1 — scan factura (only when there's no active invoice). */}
      {!scanned && (
        <section>
          <h2 className="serif text-lg mb-3">Escaneá tu factura</h2>
          <InvoiceScanner
            onConfirm={handleScanConfirm}
            ctaLabel={
              soldHistory.length > 0
                ? "Escanear otra factura"
                : "Escanear factura"
            }
          />
        </section>
      )}

      {scanned && (
        <>
          <section className="mb-6">
            <div className="mono text-[11px] uppercase tracking-widest text-muted mb-2">
              01 · Factura escaneada
            </div>
            <InvoiceCard
              invoice={scanned}
              state={cardState}
              sold={
                cardState === "sold" && settleReceipt && requestId
                  ? {
                      lenderName: selectedMatch?.lenderName ?? "—",
                      netAmountUSDC:
                        settleReceipt.deliveredAmountUSDC ??
                        selectedMatch?.netAmountUSDC ??
                        0,
                      txHash: settleReceipt.txHash as `0x${string}`,
                      snowtraceUrl: settleReceipt.snowtraceUrl,
                      requestId,
                    }
                  : undefined
              }
              errorMessage={cardError ?? undefined}
              onScanAnother={
                cardState === "failed" ? resetForNextScan : undefined
              }
            />
          </section>

          {/* Phase 2 — pre-negotiation CTA (only while we have a scanned invoice
              and haven't started the pipeline yet). */}
          {cardState === "pending" && !isRunning && !validator && (
            <div className="mb-6">
              <button
                type="button"
                onClick={() => void runPipeline()}
                className="w-full bg-ink text-paper px-4 py-4 mono text-xs uppercase tracking-widest min-h-[48px]"
              >
                Negociar esta factura
              </button>
            </div>
          )}

          {(isRunning || validator) && (
            <PipelineProgress
              validator={validator}
              fraud={fraud}
              score={score}
              auction={auction}
              isRunning={isRunning}
            />
          )}

          {auction && (
            <section className="mt-6">
              <h2 className="serif text-lg mb-3">Subasta de lenders</h2>
              <LenderAuctionPanel
                auction={auction}
                onSelect={setSelectedMatch}
                selectedId={selectedMatch?.lenderId ?? null}
              />
            </section>
          )}

          {selectedMatch && !isSettled && (
            <Settlement
              match={selectedMatch}
              settlement={settlement}
              requestId={requestId}
              onSign={signAndSettle}
              isSigning={isSigning}
            />
          )}

          {isSettled && (
            <div className="mt-6">
              <button
                type="button"
                onClick={resetForNextScan}
                className="w-full bg-ink text-paper px-4 py-4 mono text-xs uppercase tracking-widest min-h-[48px]"
              >
                Escanear otra factura
              </button>
            </div>
          )}

          {error && (
            <div className="mt-6 border border-red-500 p-4 text-sm text-red-700 mono">
              {error}
            </div>
          )}
        </>
      )}

      <AuditPanel steps={auditSteps} requestId={requestId} />
      <TraceConsole traces={[]} />
    </main>
  );
}
