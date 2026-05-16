"use client";

import { useState } from "react";
import Link from "next/link";
import { UploadInvoice } from "@/components/UploadInvoice";
import { PipelineProgress } from "@/components/PipelineProgress";
import { Settlement } from "@/components/Settlement";
import type {
  Invoice,
  LenderMatch,
  ScoreResult,
  SettlementReceipt,
  ValidatorResult,
} from "@/types/invoice";

const SME_WALLET = "0xF432Baf1315ccDB23E683B95b03fD54Dd3e447Ba" as const;
const LENDER_WALLET = "0xA1234567890123456789012345678901234567Ab" as const;

export default function DemoPage() {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [validator, setValidator] = useState<ValidatorResult | null>(null);
  const [score, setScore] = useState<ScoreResult | null>(null);
  const [match, setMatch] = useState<LenderMatch | null>(null);
  const [receipt, setReceipt] = useState<SettlementReceipt | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSettling, setIsSettling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runPipeline(inv: Invoice) {
    setInvoice(inv);
    setValidator(null);
    setScore(null);
    setMatch(null);
    setReceipt(null);
    setError(null);
    setIsRunning(true);

    try {
      const validateRes = await fetch("/api/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoice: inv }),
      }).then((r) => r.json());
      setValidator(validateRes.result);
      await sleep(400);

      const scoreRes = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoice: inv }),
      }).then((r) => r.json());
      setScore(scoreRes.result);
      await sleep(400);

      const matchRes = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoice: inv, score: scoreRes.result }),
      }).then((r) => r.json());
      setMatch(matchRes.result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Pipeline failed");
    } finally {
      setIsRunning(false);
    }
  }

  async function handleSettle() {
    if (!match) return;
    setIsSettling(true);
    setError(null);
    try {
      const res = await fetch("/api/settle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          match,
          smeWallet: SME_WALLET,
          lenderWallet: LENDER_WALLET,
          signature: "0x" + "00".repeat(65),
          nonce: "0x" + "00".repeat(32),
          validAfter: 0,
          validBefore: Math.floor(Date.now() / 1000) + 3600,
        }),
      }).then((r) => r.json());
      setReceipt(res.receipt);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Settle failed");
    } finally {
      setIsSettling(false);
    }
  }

  return (
    <main className="min-h-screen px-6 py-12 md:px-16 md:py-16 max-w-4xl mx-auto">
      <Link href="/" className="text-xs mono uppercase tracking-widest text-muted hover:text-ink">
        ← Cobraya
      </Link>

      <h1 className="serif text-4xl md:text-5xl mt-8 mb-12 leading-tight">
        Selecciona una factura. Mira cómo trabajan los agentes.
      </h1>

      <div className="space-y-12">
        <UploadInvoice onSelect={runPipeline} disabled={isRunning || isSettling} />

        {invoice && (
          <PipelineProgress
            validator={validator}
            score={score}
            match={match}
            isRunning={isRunning}
          />
        )}

        {match && (
          <Settlement
            receipt={receipt}
            onSettle={handleSettle}
            canSettle={!!match}
            isSettling={isSettling}
          />
        )}

        {error && (
          <div className="border border-accent p-4 text-sm text-accent mono">
            Error: {error}
          </div>
        )}
      </div>
    </main>
  );
}

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}
