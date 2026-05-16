// src/app/demo/page.tsx — W6 REPLACE
// Mobile-first 4-phase orchestration.
//  1) cobraya-cfdi-validator (serial)
//  2) cobraya-fraud-detector + cobraya-credit-scorer (parallel — DT-J)
//  3) cobraya-lender-matcher (serial — needs score.band)
//  4) /api/settle on user pick.
// requestId is generated once per pipeline run and forwarded as
// x-cobraya-request-id so each agent step is attached to the same audit trail.
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type {
  Invoice,
  ScoreResult,
  AuctionResult,
  AuctionLender,
} from "@/types/invoice";
import { BrandIcon } from "@/components/BrandIcon";
import { InvoicePicker } from "@/components/InvoicePicker";
import { PipelineProgress } from "@/components/PipelineProgress";
import { LenderAuctionPanel } from "@/components/LenderAuctionPanel";
import { Settlement } from "@/components/Settlement";
import { AuditPanel, type AuditStepDisplay } from "@/components/AuditPanel";
import { TraceConsole } from "@/components/TraceConsole";

interface ValidatorResponse {
  isCompliant: boolean;
  anchorBuyerTier: 1 | "unknown";
  policyId: string;
  // BLQ-BAJO-2 rename: scope = process-local. Authoritative dup is fraud-detector onchain.
  duplicateCheckInstance: "clean" | "duplicate";
  rfcEmisorMasked: string;
}

interface FraudResponse {
  isUnique: boolean;
  commitmentHash: `0x${string}`;
  commitTxHash?: `0x${string}`;
}

export default function DemoPage() {
  const [requestId, setRequestId] = useState<string | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
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

  async function runPipeline(inv: Invoice) {
    if (isRunning) return; // CD anti double-trigger
    setInvoice(inv);
    setValidator(null);
    setFraud(null);
    setScore(null);
    setAuction(null);
    setSelectedMatch(null);
    setSettlement(null);
    setError(null);
    setLatencies({});
    setIsRunning(true);
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
      setError(err instanceof Error ? err.message : "Pipeline failed");
    } finally {
      setIsRunning(false);
    }
  }

  async function signAndSettle() {
    if (!selectedMatch || !requestId || isSigning) return;
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Settle failed");
    } finally {
      setIsSigning(false);
    }
  }

  // Derive AuditPanel rows from in-flight state (best-effort; canonical trail is
  // server-side in agent-signer.ts and the JSON download).
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

      {!invoice && (
        <section>
          <h2 className="serif text-lg mb-3">Elegí una factura</h2>
          <InvoicePicker selected={invoice} onSelect={(inv) => void runPipeline(inv)} />
        </section>
      )}

      {invoice && (
        <>
          <section className="mb-6">
            <div className="mono text-[11px] uppercase tracking-widest text-muted mb-2">
              01 · Factura seleccionada
            </div>
            <div className="border border-ink/30 p-4">
              <div className="font-semibold">{invoice.issuer.name}</div>
              <div className="text-xs text-muted">→ {invoice.anchorBuyer}</div>
              <div className="mono text-sm mt-2">
                ${invoice.amount.toLocaleString("es-MX")} MXN ·{" "}
                {invoice.paymentTermsDays}d
              </div>
            </div>
          </section>

          <PipelineProgress
            validator={validator}
            fraud={fraud}
            score={score}
            auction={auction}
            isRunning={isRunning}
          />

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

          {selectedMatch && (
            <Settlement
              match={selectedMatch}
              settlement={settlement}
              requestId={requestId}
              onSign={signAndSettle}
              isSigning={isSigning}
            />
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
