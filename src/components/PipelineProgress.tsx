// src/components/PipelineProgress.tsx — W6 REPLACE
// Vertical stepper with 4 steps (no Oracle GenAI mentions).
// State per step: WAITING | RUNNING | DONE | REJECTED.
"use client";

import type { ScoreResult, AuctionResult } from "@/types/invoice";

type StepState = "WAITING" | "RUNNING" | "DONE" | "REJECTED";

interface Props {
  validator: unknown;
  fraud: unknown;
  score: ScoreResult | null;
  auction: AuctionResult | null;
  isRunning: boolean;
}

interface StepDef {
  label: string;
  agentSlug: string;
  hint: string;
  tag: string;
}

const STEPS: StepDef[] = [
  {
    label: "Verificamos tu factura",
    agentSlug: "cobraya-cfdi-validator",
    hint: "Confirmamos los datos con el SAT y tu comprador",
    tag: "$0.001 USDC",
  },
  {
    label: "Confirmamos que es única",
    agentSlug: "cobraya-fraud-detector",
    hint: "Registramos tu factura en blockchain para que nadie más pueda cobrarla",
    tag: "$0.005 USDC",
  },
  {
    label: "Evaluamos el riesgo",
    agentSlug: "cobraya-credit-scorer",
    hint: "Analizamos con inteligencia artificial qué precio podemos ofrecerte",
    tag: "$0.050 USDC",
  },
  {
    label: "Buscamos el mejor comprador",
    agentSlug: "cobraya-lender-matcher",
    hint: "4 compradores compitiendo por darte el mejor precio en USDC",
    tag: "$0.010 USDC",
  },
];

function deriveState(value: unknown, isRunning: boolean): StepState {
  if (value == null) return isRunning ? "RUNNING" : "WAITING";
  if (typeof value === "object" && value !== null) {
    const obj = value as Record<string, unknown>;
    // CFDI validator rejection: isCompliant === false.
    if ("isCompliant" in obj && obj.isCompliant === false) return "REJECTED";
    // Fraud detector rejection: isUnique === false.
    if ("isUnique" in obj && obj.isUnique === false) return "REJECTED";
    // Matcher: no qualifying lender means no recommendedLender.
    if ("recommendedLender" in obj && obj.recommendedLender === null) return "REJECTED";
  }
  return "DONE";
}

export function PipelineProgress({ validator, fraud, score, auction, isRunning }: Props) {
  const states: StepState[] = [
    deriveState(validator, isRunning && validator == null),
    deriveState(
      fraud,
      isRunning && validator != null && fraud == null,
    ),
    deriveState(score, isRunning && validator != null && score == null),
    deriveState(auction, isRunning && score != null && auction == null),
  ];

  return (
    <div>
      <div className="text-xs mono uppercase tracking-widest text-luma-450 mb-4">
        02 · Cobraya está trabajando
      </div>
      <ol className="space-y-3">
        {STEPS.map((s, i) => (
          <StepCard
            key={s.agentSlug}
            label={s.label}
            agentSlug={s.agentSlug}
            hint={s.hint}
            tag={s.tag}
            state={states[i]}
          />
        ))}
      </ol>

      {score && (
        <div className="mt-6 border border-luma-200 bg-luma-50 rounded-2xl p-4 text-sm">
          <div className="text-xs mono uppercase tracking-widest text-luma-450 mb-2">
            Análisis · {score.rationaleProvenance === 'anthropic-claude-haiku-4-5' ? 'IA' : 'Local'}
          </div>
          <div className="flex items-baseline gap-3 mb-3">
            <div className="serif text-4xl text-luma-700">{score.score}</div>
            <div className="mono text-base text-luma-450">Categoría {score.band}</div>
          </div>
          <div className="text-xs leading-relaxed text-luma-700">{score.rationale}</div>
        </div>
      )}
    </div>
  );
}

function StepCard({
  label,
  agentSlug,
  hint,
  tag,
  state,
}: {
  label: string;
  agentSlug: string;
  hint: string;
  tag: string;
  state: StepState;
}) {
  const dotClass =
    state === "DONE"
      ? "bg-emerald-500"
      : state === "RUNNING"
        ? "bg-amber-500 animate-pulse"
        : state === "REJECTED"
          ? "bg-red-500"
          : "bg-ink/20";

  const stateLabelClass =
    state === "DONE"
      ? "text-emerald-600 font-semibold"
      : state === "RUNNING"
        ? "text-amber-600 font-semibold animate-pulse"
        : state === "REJECTED"
          ? "text-red-600 font-semibold"
          : "text-muted";

  return (
    <li className="border border-ink/30 p-4">
      <div className="flex items-center gap-3">
        <span className={`w-3 h-3 rounded-full flex-shrink-0 ${dotClass}`} />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm">{label}</div>
          <div className="mono text-[11px] text-muted truncate">
            {agentSlug} · {tag}
          </div>
        </div>
        <span className={`mono text-xs ${stateLabelClass}`}>{state}</span>
      </div>
      <div className="text-xs text-muted mt-2 ml-6">{hint}</div>
    </li>
  );
}
