// src/components/LenderAuctionPanel.tsx
// Mobile-first vertical auction panel — 4 lenders ranked by combined APR+advance+speed.
// AC-15 (auction visual) + CD-18 (touch targets ≥48px) + anti-double-trigger via disabled.
//
// Visual contract: "selection" and "recommendation" are NEVER expressed with
// the same affordance. Earlier this file used `border-2 border-luma-700` for
// the winner AND `border-luma-700 bg-luma-100/40` for the selected one — when
// the user picked a non-winner, the winner's thick border made it look like
// the selection had been retained on both cards at once. Now the winner gets
// an inline "Recomendado" pill (text-only, no border weight change) so
// selection is the ONLY border-state in play.
"use client";

import type { AuctionResult, AuctionLender } from "@/types/invoice";

interface Props {
  auction: AuctionResult;
  onSelect: (lender: AuctionLender) => void;
  selectedId: string | null;
}

export function LenderAuctionPanel({ auction, onSelect, selectedId }: Props) {
  return (
    <div className="grid grid-cols-1 gap-3">
      {auction.auction.map((l) => {
        const isSelected = selectedId === l.lenderId;
        const isWinner = l.rank === 1 && l.qualifies;
        const disabled = !l.qualifies;
        const borderClass = isSelected
          ? "border-2 border-luma-700 bg-luma-100/40"
          : "border border-luma-200";
        return (
          <button
            key={l.lenderId}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(l)}
            className={`text-left p-4 min-h-[48px] rounded-2xl bg-luma-50 text-luma-700 transition-colors ${
              disabled ? "opacity-40" : ""
            } ${borderClass}`}
            aria-pressed={isSelected}
            title={l.rejectionReason}
          >
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-semibold flex items-center gap-2 flex-wrap">
                <span>{l.lenderName}</span>
                {isWinner && (
                  <span
                    className="mono text-[10px] uppercase tracking-widest bg-luma-700 text-luma-50 px-2 py-0.5 rounded-full"
                    aria-label="Recomendado por el agente"
                  >
                    ★ Recomendado
                  </span>
                )}
              </span>
              <span className="mono text-xs flex-shrink-0">#{l.rank}</span>
            </div>
            <div className="mt-1 mono text-sm">
              {l.aprPct}% APR · {l.advanceRatePct}% · ~{l.estimatedSettleMinutes}min
            </div>
            <div className="mt-1 text-sm">USDC {l.netAmountUSDC.toFixed(4)}</div>
            {disabled && l.rejectionReason && (
              <div className="text-xs text-luma-450 mt-1">{l.rejectionReason}</div>
            )}
          </button>
        );
      })}
    </div>
  );
}
