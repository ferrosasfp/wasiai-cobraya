// src/app/(app)/negociar/page.tsx — Cobraya dynamic invoices flow (port of /demo).
// Lives inside the (app) route group so it inherits TopNav + BottomTabs from
// the (app)/layout. DD-I restyling only — no logic, engine wiring, or fetch
// changes vs the original demo page.
// Phase 0  marketplace /discover (mantenido a través de AuditPanel/TraceConsole
//          que muestran resultados de pipeline previo).
// Phase 1  InvoiceScanner — el usuario "escanea" la factura, se genera un CFDI
//          fresh con UUID v4 único, y aparece la InvoiceCard en state "pending".
// Phase 2  User taps "Negociar esta factura" → 4-step compose pipeline.
// Phase 3  Sign & Settle. On 200 we compose the audit trail entirely on the
//          client from each agent's EIP-712 receipt + the settle response's
//          signed authorization. The trail blob URL is what the audit-download
//          anchors point to.
// Phase 4  InvoiceCard morph a state "sold" + botón "Escanear otra factura"
//          reinicia el flow manteniendo histórico de sesión.
"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  Invoice,
  ScoreResult,
  AuctionResult,
  AuctionLender,
} from "@/types/invoice";
import type { ScannedInvoicePayload } from "@/app/api/scan-invoice/route";
import { InvoiceScanner } from "@/components/InvoiceScanner";
import { InvoiceCard, type InvoiceCardState } from "@/components/InvoiceCard";
import { PipelineProgress } from "@/components/PipelineProgress";
import { LenderAuctionPanel } from "@/components/LenderAuctionPanel";
import { Settlement } from "@/components/Settlement";
import { AuditPanel, type AuditStepDisplay } from "@/components/AuditPanel";
import { TraceConsole } from "@/components/TraceConsole";
import type {
  AuditReceipt,
  AuditSettlement,
  AuditTrail,
} from "@/types/audit-trail";
import { composeAuditTrail } from "@/lib/audit-trail-composer";
import { recordSettlement } from "@/actions/settlement";

interface ValidatorResponse {
  isCompliant: boolean;
  anchorBuyerTier: 1 | "unknown";
  policyId: string;
  duplicateCheckInstance: "clean" | "duplicate";
  rfcEmisorMasked: string;
  sector?: string;
  signedAt?: string;
  agentSigner?: `0x${string}` | null;
  receipt?: AuditReceipt | null;
}

interface FraudResponse {
  isUnique: boolean;
  commitmentHash: `0x${string}`;
  commitTxHash?: `0x${string}`;
  snowtraceUrl?: string;
  blockNumber?: number;
  timestamp?: number;
  metadataPointer?: `0x${string}`;
  rejectReason?: string;
  agentSigner?: `0x${string}` | null;
  receipt?: AuditReceipt | null;
}

interface ScoreResponse extends ScoreResult {
  agentSigner?: `0x${string}` | null;
  receipt?: AuditReceipt | null;
}

interface MatcherResponse extends AuctionResult {
  agentSigner?: `0x${string}` | null;
  receipt?: AuditReceipt | null;
}

interface SettleResponseShape {
  receipt?: {
    txHash?: `0x${string}`;
    snowtraceUrl?: string;
    deliveredAmountUSDC?: number;
    blockNumber?: number;
  };
  settlement?: AuditSettlement;
  error?: string;
  message?: string;
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

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as const;

export default function NegociarPage() {
  const [requestId, setRequestId] = useState<string | null>(null);
  const [scanned, setScanned] = useState<ScannedInvoicePayload | null>(null);
  const [cardState, setCardState] = useState<InvoiceCardState>("pending");
  const [cardError, setCardError] = useState<string | null>(null);

  const [validator, setValidator] = useState<ValidatorResponse | null>(null);
  const [fraud, setFraud] = useState<FraudResponse | null>(null);
  const [score, setScore] = useState<ScoreResponse | null>(null);
  const [auction, setAuction] = useState<MatcherResponse | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<AuctionLender | null>(null);
  const [settlement, setSettlement] = useState<SettleResponseShape | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latencies, setLatencies] = useState<Record<number, number>>({});
  const [pipelineStartedAt, setPipelineStartedAt] = useState<string | null>(null);

  // Composed audit trail + the blob URL we offer for download. Built ONLY after
  // a successful settle: every step receipt + the settlement authorization are
  // bundled, SHA256-rooted, and exposed as a blob: URL. We revoke the URL on
  // unmount and any time the trail is replaced to avoid leaking object URLs
  // across pipeline runs.
  const [trail, setTrail] = useState<AuditTrail | null>(null);
  const [trailBlobUrl, setTrailBlobUrl] = useState<string | null>(null);

  // Auto-select the recommended lender when the auction lands. The matcher
  // already picks the winner via `recommendedLender` — without this effect
  // the panel showed the "Recomendado" badge but `selectedMatch` stayed null,
  // so the Settlement CTA was hidden until the user clicked. Reverse-engineered
  // from user feedback: "el primer lender sale seleccionado por defecto" — that
  // was the visual illusion of selection; now it's a real selection.
  useEffect(() => {
    if (!auction || selectedMatch) return;
    const winner = auction.auction.find(
      (l) => l.lenderId === auction.recommendedLender && l.qualifies,
    );
    if (winner) setSelectedMatch(winner);
  }, [auction, selectedMatch]);

  useEffect(() => {
    if (trail === null) {
      setTrailBlobUrl(null);
      return;
    }
    const blob = new Blob([JSON.stringify(trail, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    setTrailBlobUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [trail]);

  const trailFilename = trail
    ? `cobraya-audit-${trail.requestId}.json`
    : "cobraya-audit.json";

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
    setPipelineStartedAt(null);
    setTrail(null);
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
    setTrail(null);
    setIsRunning(true);
    setCardState("negotiating");
    const id = crypto.randomUUID();
    setRequestId(id);
    setPipelineStartedAt(new Date().toISOString());

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

      // Sector — single source of truth post-validator. Background: the scan
      // generator picks `anchorBuyer` and `sector` independently at random, so
      // sometimes the combo is incoherent with the buyer's canonical sector in
      // BUYERS_TIER_1 (e.g., Bimbo arrives tagged as "food retail" by the scan
      // even though mock-data lists it as "apparel"). The validator does the
      // authoritative buyer-to-sector lookup; we use that downstream so the
      // scorer + matcher + audit-trail all agree.
      const authoritativeSector = vJson.sector ?? inv.sector;

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
            sector: authoritativeSector,
          }),
        }),
      ]);
      const fJson = (await fRes.json()) as FraudResponse;
      const sJson = (await sRes.json()) as ScoreResponse;
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
          sector: authoritativeSector,
        }),
      });
      const aJson = (await mRes.json()) as MatcherResponse;
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
    if (
      !selectedMatch ||
      !requestId ||
      isSigning ||
      !scanned ||
      !validator ||
      !fraud ||
      !score ||
      !auction ||
      !pipelineStartedAt
    )
      return;
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
      const json = (await res.json()) as SettleResponseShape;
      setSettlement(json);
      const receipt = parseSettleReceipt(json);
      if (receipt && receipt.txHash && json.settlement) {
        // Compose the trail entirely on the client. The agents' EIP-712 receipts
        // (already in their respective response bodies) are the cryptographic
        // root of trust; we just bundle them with the matching inputs/latencies
        // we observed at the edge and compute SHA256 over the canonical JSON.
        const inv = scannedToInvoice(scanned);
        const composed = await composeAuditTrail({
          requestId,
          startedAt: pipelineStartedAt,
          invoice: {
            uuid: scanned.uuidCfdi,
            rfcEmisorMasked: validator.rfcEmisorMasked,
            amountMXN: scanned.amountMXN,
            anchorBuyer: scanned.anchorBuyer,
            paymentTermsDays: scanned.paymentTermsDays,
            sector: validator.sector ?? scanned.sector,
          },
          validator: {
            raw: {
              uuidCfdi: inv.uuid,
              rfcEmisor: inv.issuer.rfc,
              amountMXN: inv.amount,
              anchorBuyer: inv.anchorBuyer,
            },
            output: {
              isCompliant: validator.isCompliant,
              anchorBuyerTier: validator.anchorBuyerTier,
              policyId: validator.policyId,
              duplicateCheckInstance: validator.duplicateCheckInstance,
              rfcEmisorMasked: validator.rfcEmisorMasked,
              signedAt: validator.signedAt ?? "",
            },
            receipt: validator.receipt ?? null,
            agentSigner: validator.agentSigner ?? ZERO_ADDRESS,
            latencyMs: latencies[0] ?? 0,
          },
          fraud: {
            raw: {
              uuidCfdi: inv.uuid,
              rfcEmisor: inv.issuer.rfc,
              amountMXN: inv.amount,
            },
            output: {
              isUnique: fraud.isUnique,
              commitmentHash: fraud.commitmentHash,
              commitTxHash: fraud.commitTxHash,
              snowtraceUrl: fraud.snowtraceUrl,
              blockNumber: fraud.blockNumber,
              timestamp: fraud.timestamp,
              metadataPointer: fraud.metadataPointer,
              rejectReason: fraud.rejectReason,
            },
            receipt: fraud.receipt ?? null,
            agentSigner: fraud.agentSigner ?? ZERO_ADDRESS,
            latencyMs: latencies[1] ?? 0,
          },
          scorer: {
            raw: {
              amountMXN: inv.amount,
              anchorBuyer: inv.anchorBuyer,
              paymentTermsDays: inv.paymentTermsDays,
              sector: validator.sector ?? inv.sector,
            },
            output: {
              score: score.score,
              band: score.band,
              advanceRatePct: score.advanceRatePct,
              aprPct: score.aprPct,
              rationale: score.rationale,
              rationaleProvenance: score.rationaleProvenance,
            },
            receipt: score.receipt ?? null,
            agentSigner: score.agentSigner ?? ZERO_ADDRESS,
            latencyMs: latencies[2] ?? 0,
          },
          matcher: {
            raw: {
              band: score.band,
              amountMXN: inv.amount,
              anchorBuyer: inv.anchorBuyer,
              sector: validator.sector ?? inv.sector,
            },
            output: {
              auction: auction.auction,
              recommendedLender: auction.recommendedLender,
              recommendationReason: auction.recommendationReason,
            },
            receipt: auction.receipt ?? null,
            agentSigner: auction.agentSigner ?? ZERO_ADDRESS,
            latencyMs: latencies[3] ?? 0,
          },
          settlement: json.settlement,
        });
        setTrail(composed);

        const sold: SoldInvoice = {
          scanned,
          lenderName: selectedMatch.lenderName,
          netAmountUSDC: receipt.deliveredAmountUSDC ?? selectedMatch.netAmountUSDC,
          txHash: receipt.txHash,
          snowtraceUrl: receipt.snowtraceUrl,
          requestId,
        };
        // W9: persist to cobraya_settled_invoices via Server Action. Best-effort:
        // the tx is already onchain, so a DB write failure must NOT block the UX.
        const persistResult = await recordSettlement({
          requestId,
          uuidCfdi: scanned.uuidCfdi,
          amountMxn: scanned.amountMXN,
          netAmountUsdc:
            receipt.deliveredAmountUSDC ?? selectedMatch.netAmountUSDC,
          lenderName: selectedMatch.lenderName,
          txHash: receipt.txHash,
          snowtraceUrl: receipt.snowtraceUrl,
        });
        if (!persistResult.ok) {
          // R-9: tx is onchain, history sync is best-effort.
          console.warn(
            "[cobraya-ui] recordSettlement failed; tx onchain OK",
            persistResult.error,
          );
        }
        setSoldHistory((prev) => [sold, ...prev]);
        setCardState("sold");
        // After a successful settle the success-state UI (InvoiceCard "sold"
        // + reset CTA) renders near the top of the page, but the user just
        // tapped the Settlement CTA fixed at the bottom of the viewport.
        // Without an explicit scroll the success looks like nothing happened.
        // Defer one frame so React commits the DOM changes first.
        requestAnimationFrame(() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        });
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
    <main className="min-h-screen pb-32 px-4 pt-6 mb-24 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm text-luma-450">Negocia tu factura</span>
        <span className="mono text-[10px] uppercase tracking-widest text-luma-450">
          Avalanche Fuji
        </span>
      </div>

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
                      auditDownloadHref: trailBlobUrl,
                      auditDownloadFilename: trailFilename,
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
                className="w-full bg-luma-700 text-luma-50 px-4 py-4 mono text-xs uppercase tracking-widest min-h-[48px]"
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
              auditDownloadHref={trailBlobUrl}
              auditDownloadFilename={trailFilename}
              onSign={signAndSettle}
              isSigning={isSigning}
            />
          )}

          {isSettled && (
            <div className="mt-6">
              <button
                type="button"
                onClick={resetForNextScan}
                className="w-full bg-luma-700 text-luma-50 px-4 py-4 mono text-xs uppercase tracking-widest min-h-[48px]"
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

      <AuditPanel
        steps={auditSteps}
        auditDownloadHref={trailBlobUrl}
        auditDownloadFilename={trailFilename}
      />
      <TraceConsole traces={[]} />
    </main>
  );
}
