// src/components/demo/DemoFlow.tsx — public /demo agentic pipeline.
//
// Mirrors the /negociar pipeline (src/app/(app)/negociar/page.tsx) but adapted
// to anonymous public visitors:
//
//   - No Supabase Server Action call (no recordSettlement → no row written to
//     cobraya_settled_invoices). The /demo run is ephemeral.
//   - Pre-seeded invoice (Lupita · Tortillería La Esperanza · Walmart $48,500 ·
//     60 días) instead of the InvoiceScanner UI; the judge taps ONE button.
//   - Pre-flight POST to /api/demo/run for rate limiting (60s cooldown,
//     5 runs/hour per fingerprint). Cap honoured server-side; client just
//     surfaces the wait copy.
//   - Per-agent retry button so a single transient HTTP failure (e.g. agent
//     cold start) doesn't force the whole pipeline restart.
//   - All other downstream calls (4 agent invokes + /api/settle) are the same
//     production endpoints /negociar uses. The settlement IS real on-chain on
//     Avalanche Fuji, capped at ONCHAIN_AMOUNT_CAP_USDC per CD-5.
"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  Invoice,
  ScoreResult,
  AuctionResult,
  AuctionLender,
} from "@/types/invoice";
import type { ScannedInvoicePayload } from "@/app/api/scan-invoice/route";
import { InvoiceCard, type InvoiceCardState } from "@/components/InvoiceCard";
import { PipelineProgress } from "@/components/PipelineProgress";
import { LenderAuctionPanel } from "@/components/LenderAuctionPanel";
import { Settlement } from "@/components/Settlement";
import { AuditPanel, type AuditStepDisplay } from "@/components/AuditPanel";
import type {
  AuditReceipt,
  AuditSettlement,
  AuditTrail,
} from "@/types/audit-trail";
import { composeAuditTrail } from "@/lib/audit-trail-composer";
import { buildDemoInvoice } from "@/lib/demo/seed-invoice";

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

interface RateLimitInfo {
  reason: "cooldown" | "quota";
  retryAfterSec: number;
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

type DemoPhase = "idle" | "running" | "auction" | "settled";

export function DemoFlow() {
  // The invoice is built lazily — first render shows the "Iniciar demo" CTA
  // with NO scanned invoice; clicking the CTA seeds a fresh one with a unique
  // UUID v4 (fraud-detector needs a unique commitment hash per run).
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

  const [phase, setPhase] = useState<DemoPhase>("idle");
  const [isStarting, setIsStarting] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimit, setRateLimit] = useState<RateLimitInfo | null>(null);
  const [latencies, setLatencies] = useState<Record<number, number>>({});
  const [pipelineStartedAt, setPipelineStartedAt] = useState<string | null>(null);

  const [trail, setTrail] = useState<AuditTrail | null>(null);
  const [trailBlobUrl, setTrailBlobUrl] = useState<string | null>(null);

  // Track which step failed so the retry CTA targets only that one.
  type RetryStep = "validator" | "fraud-score" | "matcher" | null;
  const [retryStep, setRetryStep] = useState<RetryStep>(null);

  // Auto-select the recommended lender once the auction lands. Mirrors the
  // negociar page behaviour so the judge doesn't have to tap a card.
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
    ? `cobraya-demo-audit-${trail.requestId}.json`
    : "cobraya-demo-audit.json";

  function resetDemo(): void {
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
    setRateLimit(null);
    setLatencies({});
    setPipelineStartedAt(null);
    setTrail(null);
    setRetryStep(null);
    setPhase("idle");
  }

  // Step runners — each one owns its slice of state so per-step retry is
  // possible without restarting the whole pipeline.
  async function runValidator(
    inv: Invoice,
    headers: HeadersInit,
  ): Promise<ValidatorResponse | null> {
    const t0 = Date.now();
    try {
      const res = await fetch("/api/agents/cobraya-cfdi-validator/invoke", {
        method: "POST",
        headers,
        body: JSON.stringify({
          uuidCfdi: inv.uuid,
          rfcEmisor: inv.issuer.rfc,
          amountMXN: inv.amount,
          anchorBuyer: inv.anchorBuyer,
        }),
      });
      if (!res.ok) throw new Error(`validator HTTP ${res.status}`);
      const json = (await res.json()) as ValidatorResponse;
      setValidator(json);
      setLatencies((m) => ({ ...m, 0: Date.now() - t0 }));
      if (!json.isCompliant) {
        setError(
          "La factura no pasó la verificación inicial. Reiniciá el demo para intentar con otra.",
        );
        setCardState("failed");
        setCardError("Datos incompletos");
        return null;
      }
      return json;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "validator failed";
      setError(msg);
      setRetryStep("validator");
      return null;
    }
  }

  async function runFraudAndScore(
    inv: Invoice,
    headers: HeadersInit,
    authoritativeSector: string,
  ): Promise<{ fraud: FraudResponse; score: ScoreResponse } | null> {
    const t1 = Date.now();
    try {
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
      if (!fRes.ok) throw new Error(`fraud HTTP ${fRes.status}`);
      if (!sRes.ok) throw new Error(`scorer HTTP ${sRes.status}`);
      const fJson = (await fRes.json()) as FraudResponse;
      const sJson = (await sRes.json()) as ScoreResponse;
      setFraud(fJson);
      setScore(sJson);
      const parallelLatency = Date.now() - t1;
      setLatencies((m) => ({ ...m, 1: parallelLatency, 2: parallelLatency }));
      if (!fJson.isUnique) {
        setError(
          "Esta factura ya fue cedida antes. Reiniciá el demo para generar otra.",
        );
        setCardState("failed");
        setCardError("Ya fue vendida");
        return null;
      }
      return { fraud: fJson, score: sJson };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "fraud/scorer failed";
      setError(msg);
      setRetryStep("fraud-score");
      return null;
    }
  }

  async function runMatcher(
    inv: Invoice,
    headers: HeadersInit,
    band: ScoreResult["band"],
    authoritativeSector: string,
  ): Promise<MatcherResponse | null> {
    const t3 = Date.now();
    try {
      const res = await fetch("/api/agents/cobraya-lender-matcher/invoke", {
        method: "POST",
        headers,
        body: JSON.stringify({
          band,
          amountMXN: inv.amount,
          anchorBuyer: inv.anchorBuyer,
          sector: authoritativeSector,
        }),
      });
      if (!res.ok) throw new Error(`matcher HTTP ${res.status}`);
      const json = (await res.json()) as MatcherResponse;
      setAuction(json);
      setLatencies((m) => ({ ...m, 3: Date.now() - t3 }));
      return json;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "matcher failed";
      setError(msg);
      setRetryStep("matcher");
      return null;
    }
  }

  async function runPipelineFrom(
    step: "all" | "validator" | "fraud-score" | "matcher",
  ): Promise<void> {
    if (!requestId || !scanned) return;
    setError(null);
    setRetryStep(null);
    setCardError(null);
    setCardState("negotiating");
    setPhase("running");
    const inv = scannedToInvoice(scanned);
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "x-cobraya-request-id": requestId,
    };

    // 1. Validator (also derives sector for downstream).
    let vJson: ValidatorResponse | null = validator;
    if (step === "all" || step === "validator") {
      vJson = await runValidator(inv, headers);
      if (!vJson) return;
    }
    if (!vJson) return; // safety — TS narrowing.
    const authoritativeSector = vJson.sector ?? inv.sector;

    // 2 + 3. Fraud + Scorer in parallel.
    let fsResult: { fraud: FraudResponse; score: ScoreResponse } | null = null;
    if (
      step === "all" ||
      step === "validator" ||
      step === "fraud-score"
    ) {
      fsResult = await runFraudAndScore(inv, headers, authoritativeSector);
      if (!fsResult) return;
    } else if (fraud && score) {
      fsResult = { fraud, score };
    }
    if (!fsResult) return;

    // 4. Matcher.
    const mJson = await runMatcher(
      inv,
      headers,
      fsResult.score.band,
      authoritativeSector,
    );
    if (!mJson) return;
    setPhase("auction");
  }

  async function startDemo(): Promise<void> {
    if (isStarting || phase === "running") return;
    setIsStarting(true);
    setError(null);
    setRateLimit(null);
    try {
      // Pre-flight rate-limit. /api/demo/run returns 429 + retryAfterSec when
      // the cooldown or hourly quota is hit; the body shape matches RateLimitInfo.
      const preflight = await fetch("/api/demo/run", { method: "POST" });
      if (preflight.status === 429) {
        const body = (await preflight.json().catch(() => null)) as Partial<{
          reason: "cooldown" | "quota";
          retryAfterSec: number;
        }> | null;
        setRateLimit({
          reason: body?.reason === "quota" ? "quota" : "cooldown",
          retryAfterSec:
            typeof body?.retryAfterSec === "number" ? body.retryAfterSec : 60,
        });
        return;
      }
      if (!preflight.ok) {
        throw new Error(`preflight HTTP ${preflight.status}`);
      }
      const preflightBody = (await preflight.json()) as { runId?: string };
      const runId = preflightBody.runId ?? crypto.randomUUID();

      // Reset all per-run state, then seed a fresh invoice.
      const seeded = buildDemoInvoice();
      setScanned(seeded);
      setRequestId(runId);
      setValidator(null);
      setFraud(null);
      setScore(null);
      setAuction(null);
      setSelectedMatch(null);
      setSettlement(null);
      setLatencies({});
      setTrail(null);
      setRetryStep(null);
      setPipelineStartedAt(new Date().toISOString());

      // Allow React to commit the state above so requestId is fresh when the
      // pipeline runners read it (they read from state via closures created
      // inside runPipelineFrom — we pass via a manual call instead).
      const inv = scannedToInvoice(seeded);
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        "x-cobraya-request-id": runId,
      };
      setCardState("negotiating");
      setPhase("running");

      const vJson = await runValidator(inv, headers);
      if (!vJson) return;
      const authoritativeSector = vJson.sector ?? inv.sector;
      const fsResult = await runFraudAndScore(inv, headers, authoritativeSector);
      if (!fsResult) return;
      const mJson = await runMatcher(
        inv,
        headers,
        fsResult.score.band,
        authoritativeSector,
      );
      if (!mJson) return;
      setPhase("auction");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "demo start failed";
      setError(msg);
      setCardState("failed");
      setCardError(msg);
    } finally {
      setIsStarting(false);
    }
  }

  async function signAndSettle(): Promise<void> {
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
        // CRITICAL: the public /demo path MUST NOT call recordSettlement —
        // that Server Action writes to cobraya_settled_invoices and requires
        // an authenticated supabase session. AC-DEMO-7: no DB writes.
        setCardState("sold");
        setPhase("settled");
        requestAnimationFrame(() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        });
      } else {
        setCardState("failed");
        setCardError(json.message ?? "Settlement sin tx hash");
        setError(json.message ?? "Settlement falló");
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

  // Idle state — pre-seeded invoice preview + start CTA.
  if (phase === "idle" && !scanned) {
    return (
      <section className="mt-4">
        <div className="border border-luma-200 bg-luma-50 rounded-2xl p-5 text-luma-700">
          <div className="mono text-[10px] uppercase tracking-widest text-luma-450 mb-2">
            00 · Factura de muestra
          </div>
          <h2 className="serif text-2xl mb-1">
            Lupita · Tortillería La Esperanza
          </h2>
          <p className="text-sm text-luma-450 mb-3">
            → Walmart México · 60 días · sector food retail
          </p>
          <div className="serif text-4xl text-luma-700 mb-4">
            $48,500
            <span className="text-sm text-luma-450 ml-2 align-middle">MXN</span>
          </div>
          <p className="text-xs leading-relaxed text-luma-450 mb-5">
            Al iniciar, cuatro agentes autónomos validan, registran en
            blockchain, evalúan crédito y subastan tu factura con 4
            compradores. Al final firmás el cobro y recibís USDC reales en
            Avalanche Fuji.
          </p>
          <button
            type="button"
            onClick={() => void startDemo()}
            disabled={isStarting}
            className="cta-primary"
            data-testid="demo-start-cta"
          >
            {isStarting ? "Iniciando..." : "Iniciar demo en vivo"}
          </button>
          {rateLimit && (
            <div
              role="alert"
              className="mt-4 border border-amber-400 bg-amber-50 text-amber-800 mono text-xs p-3 rounded"
              data-testid="demo-rate-limit"
            >
              {rateLimit.reason === "cooldown"
                ? `Para evitar abusos, esperá ${rateLimit.retryAfterSec}s antes de volver a iniciar el demo.`
                : `Llegaste al máximo de 5 corridas por hora. Probá de nuevo en ${rateLimit.retryAfterSec}s.`}
            </div>
          )}
          {error && (
            <div className="mt-4 border border-red-500 p-3 text-sm text-red-700 mono rounded">
              {error}
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <>
      {scanned && (
        <>
          <section className="mb-6">
            <div className="mono text-[11px] uppercase tracking-widest text-luma-450 mb-2">
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
                cardState === "failed" ? resetDemo : undefined
              }
            />
          </section>

          {(phase === "running" || validator) && (
            <PipelineProgress
              validator={validator}
              fraud={fraud}
              score={score}
              auction={auction}
              isRunning={phase === "running"}
            />
          )}

          {/* Per-step retry CTA when a transient HTTP failure happened.
              AC-DEMO-6: don't reset the whole flow on a single agent's hiccup. */}
          {retryStep && (
            <div
              role="alert"
              className="mt-6 border border-amber-400 bg-amber-50 p-3 rounded"
              data-testid="demo-retry"
            >
              <div className="text-xs mono text-amber-800 mb-2">
                Un agente falló:{" "}
                {retryStep === "validator"
                  ? "verificación CFDI"
                  : retryStep === "fraud-score"
                    ? "fraude / scoring"
                    : "matcher"}
                . Podés reintentar ese paso sin perder el progreso.
              </div>
              <button
                type="button"
                onClick={() => void runPipelineFrom(retryStep)}
                className="pill-btn-primary"
              >
                Reintentar paso
              </button>
            </div>
          )}

          {auction && (
            <section className="mt-6">
              <h2 className="h2-serif mb-3">Subasta de lenders</h2>
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
              onSign={() => void signAndSettle()}
              isSigning={isSigning}
            />
          )}

          {isSettled && (
            <div className="mt-6">
              <button
                type="button"
                onClick={resetDemo}
                className="cta-primary"
                data-testid="demo-reset"
              >
                Reiniciar demo
              </button>
            </div>
          )}

          {error && !retryStep && (
            <div className="mt-6 border border-red-500 p-4 text-sm text-red-700 mono rounded">
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
    </>
  );
}
