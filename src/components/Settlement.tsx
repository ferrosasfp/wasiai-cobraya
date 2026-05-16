// src/components/Settlement.tsx — W6 REPLACE
// Mobile-first full-screen sheet. CTA primaria bottom-anchored con safe-area-inset-bottom.
// Audit JSON download como secondary CTA. CopyButton para tx hash.
"use client";

import type { AuctionLender } from "@/types/invoice";
import { CopyButton } from "@/components/CopyButton";

interface SettlementReceiptShape {
  txHash?: `0x${string}`;
  snowtraceUrl?: string;
  deliveredAmountUSDC?: number;
  blockNumber?: number;
}

interface Props {
  match: AuctionLender;
  settlement: unknown;
  auditDownloadHref?: string | null;
  auditDownloadFilename?: string;
  onSign: () => void;
  isSigning?: boolean;
}

function parseReceipt(s: unknown): SettlementReceiptShape | null {
  if (!s || typeof s !== "object") return null;
  const obj = s as Record<string, unknown>;
  // /settle returns { receipt: {...} } — unwrap.
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
    blockNumber:
      typeof candidate.blockNumber === "number" ? candidate.blockNumber : undefined,
  };
}

export function Settlement({
  match,
  settlement,
  auditDownloadHref,
  auditDownloadFilename,
  onSign,
  isSigning,
}: Props) {
  const receipt = parseReceipt(settlement);

  if (receipt && receipt.txHash) {
    const amount = receipt.deliveredAmountUSDC ?? match.netAmountUSDC;
    return (
      <section className="mt-6">
        <div className="text-xs mono uppercase tracking-widest text-luma-450 mb-3">
          04 · Settled onchain
        </div>
        <div className="border-2 border-emerald-600 p-4 bg-emerald-50 rounded-2xl">
          <div className="serif text-2xl mb-3 text-luma-700">
            ${amount.toFixed(4)} USDC entregados
          </div>
          <div className="space-y-2 text-xs mono">
            <div className="flex items-center gap-2">
              <span className="text-luma-450">tx · </span>
              <a
                href={receipt.snowtraceUrl ?? `https://testnet.snowtrace.io/tx/${receipt.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline break-all flex-1"
              >
                {receipt.txHash.slice(0, 10)}...{receipt.txHash.slice(-8)}
              </a>
              <CopyButton text={receipt.txHash} label="Copiar tx hash" />
            </div>
            <div>
              <span className="text-luma-450">chain · </span>
              Avalanche Fuji testnet
            </div>
            {receipt.blockNumber !== undefined && (
              <div>
                <span className="text-luma-450">block · </span>
                {receipt.blockNumber.toLocaleString()}
              </div>
            )}
          </div>
          {auditDownloadHref && (
            <a
              href={auditDownloadHref}
              download={auditDownloadFilename ?? "cobraya-audit.json"}
              className="mt-4 block text-center px-4 py-3 border border-luma-300 mono text-xs uppercase tracking-widest min-h-[44px] text-luma-700"
            >
              Descargar audit trail JSON
            </a>
          )}
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="mt-6 mb-32">
        <div className="text-xs mono uppercase tracking-widest text-luma-450 mb-3">
          03 · Settlement
        </div>
        <div className="border border-luma-200 p-4 rounded-2xl bg-luma-50 text-luma-700">
          <div className="font-semibold mb-2">{match.lenderName}</div>
          <div className="mono text-sm mb-3">
            USDC {match.netAmountUSDC.toFixed(4)} · ~{match.estimatedSettleMinutes}min
          </div>
          <p className="text-xs leading-relaxed text-luma-450">
            El facilitator firma una autorización EIP-3009 gasless y settle en USDC
            sobre Avalanche Fuji. Sin que vos necesités wallet con AVAX.
          </p>
        </div>
      </section>

      {/* Bottom-anchored primary CTA with safe-area-inset-bottom (CD-18 mobile-first).
          z-40 must sit ABOVE the AuditPanel — otherwise the audit summary covers
          the settle button on mobile. */}
      <div
        className="fixed left-0 right-0 bottom-16 px-4 pt-3 bg-luma-50 border-t border-luma-200 z-40"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <button
          type="button"
          onClick={onSign}
          disabled={isSigning}
          className="w-full bg-luma-700 text-luma-50 mono text-xs uppercase tracking-widest min-h-[48px] disabled:opacity-40"
        >
          {isSigning ? "Firmando..." : "Firmar y cobrar"}
        </button>
      </div>
    </>
  );
}
