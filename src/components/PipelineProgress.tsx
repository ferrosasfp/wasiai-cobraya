"use client";

import type { LenderMatch, ScoreResult, ValidatorResult } from "@/types/invoice";

interface Props {
  validator: ValidatorResult | null;
  score: ScoreResult | null;
  match: LenderMatch | null;
  isRunning: boolean;
}

export function PipelineProgress({ validator, score, match, isRunning }: Props) {
  const steps = [
    {
      label: "invoice-validator",
      hint: "CFDI ↔ SAT match",
      done: !!validator,
      ok: validator?.isValid === true,
    },
    {
      label: "credit-scorer",
      hint: "Oracle GenAI",
      done: !!score,
      ok: !!score,
    },
    {
      label: "lender-matcher",
      hint: "Pool de inversores",
      done: !!match,
      ok: !!match,
    },
  ];

  return (
    <div>
      <div className="text-xs mono uppercase tracking-widest text-muted mb-4">02 · Pipeline agéntico</div>
      <div className="border border-line">
        {steps.map((s, i) => (
          <div
            key={s.label}
            className={`flex items-center justify-between p-5 ${
              i > 0 ? "border-t border-line" : ""
            } ${s.done ? "bg-paper" : "bg-white"}`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-3 h-3 rounded-full ${
                  s.done && s.ok
                    ? "bg-green-500"
                    : s.done && !s.ok
                      ? "bg-accent"
                      : isRunning
                        ? "bg-yellow-400 animate-pulse"
                        : "bg-line"
                }`}
              />
              <div>
                <div className="mono text-sm">{s.label}</div>
                <div className="text-xs text-muted">{s.hint}</div>
              </div>
            </div>
            <div className="text-xs mono text-muted">
              {s.done ? "DONE" : isRunning ? "RUNNING" : "PENDING"}
            </div>
          </div>
        ))}
      </div>

      {score && (
        <div className="mt-6 border border-line p-5 text-sm">
          <div className="text-xs mono uppercase tracking-widest text-muted mb-2">Score Oracle GenAI</div>
          <div className="flex items-baseline gap-4 mb-3">
            <div className="serif text-5xl">{score.score}</div>
            <div className="mono text-lg">Band {score.band}</div>
          </div>
          <div className="text-xs leading-relaxed text-muted">{score.rationale}</div>
        </div>
      )}

      {match && (
        <div className="mt-4 border border-line p-5 text-sm">
          <div className="text-xs mono uppercase tracking-widest text-muted mb-2">Lender match</div>
          <div className="font-medium mb-3">{match.lenderName}</div>
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div>
              <div className="text-muted mono mb-1">advance rate</div>
              <div className="serif text-xl">{(match.advanceRate * 100).toFixed(0)}%</div>
            </div>
            <div>
              <div className="text-muted mono mb-1">APR</div>
              <div className="serif text-xl">{match.rateAPR.toFixed(1)}%</div>
            </div>
            <div>
              <div className="text-muted mono mb-1">net USDC</div>
              <div className="serif text-xl">${match.estimatedSettlement.netUSDC.toFixed(2)}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
