// src/components/InvoiceCard.tsx
// CFDI display card with 4-state badge: pending → negotiating → sold → failed.
// Mobile-first vertical stack. Used during Phase 1+ of the demo flow once an
// invoice has been scanned and the user is moving through the agentic pipeline.
"use client";

import type { ScannedInvoicePayload } from "@/app/api/scan-invoice/route";
import { CopyButton } from "@/components/CopyButton";

export type InvoiceCardState = "pending" | "negotiating" | "sold" | "failed";

interface SoldDetails {
  lenderName: string;
  netAmountUSDC: number;
  txHash: `0x${string}`;
  snowtraceUrl?: string;
  /** Pre-signed audit trail blob URL. Demo page owns the URL lifecycle. */
  auditDownloadHref?: string | null;
  auditDownloadFilename?: string;
}

interface Props {
  invoice: ScannedInvoicePayload;
  state: InvoiceCardState;
  /** Required when state === "sold". */
  sold?: SoldDetails;
  /** Required when state === "failed". */
  errorMessage?: string;
  /** Required when state === "failed" — handler to start a new scan. */
  onScanAnother?: () => void;
}

function maskRfc(rfc: string): string {
  return rfc.length >= 6 ? `${rfc.slice(0, 4)}***` : "***";
}

function StateBadge({ state }: { state: InvoiceCardState }) {
  const map: Record<InvoiceCardState, { label: string; cls: string }> = {
    pending: { label: "Pendiente", cls: "bg-luma-100/60 text-luma-700" },
    negotiating: {
      label: "Negociando",
      cls: "bg-amber-100 text-amber-700 animate-pulse",
    },
    sold: { label: "Vendida", cls: "bg-emerald-100 text-emerald-700" },
    failed: { label: "Falló", cls: "bg-red-100 text-red-700" },
  };
  const { label, cls } = map[state];
  return (
    <span
      className={`mono text-[10px] uppercase tracking-widest px-2 py-1 ${cls}`}
      data-state={state}
    >
      {label}
    </span>
  );
}

export function InvoiceCard({
  invoice,
  state,
  sold,
  errorMessage,
  onScanAnother,
}: Props) {
  const borderClass =
    state === "sold"
      ? "border-2 border-emerald-600"
      : state === "failed"
        ? "border-2 border-red-500"
        : "border border-luma-200";

  return (
    <article
      className={`${borderClass} p-4 bg-luma-50 rounded-2xl text-luma-700`}
      data-state={state}
      aria-label={`Factura ${state}`}
    >
      <header className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <div className="font-semibold truncate">{invoice.personaName}</div>
          <div className="text-xs text-luma-450 truncate">
            → {invoice.anchorBuyer}
          </div>
        </div>
        <StateBadge state={state} />
      </header>

      <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs mono mb-2">
        <div>
          <dt className="text-luma-450 text-[10px] uppercase tracking-widest">
            Monto
          </dt>
          <dd>${invoice.amountMXN.toLocaleString("es-MX")} MXN</dd>
        </div>
        <div>
          <dt className="text-luma-450 text-[10px] uppercase tracking-widest">
            Vence
          </dt>
          <dd>{invoice.paymentTermsDays} días</dd>
        </div>
        <div>
          <dt className="text-luma-450 text-[10px] uppercase tracking-widest">
            RFC
          </dt>
          <dd>{maskRfc(invoice.rfcEmisor)}</dd>
        </div>
        <div>
          <dt className="text-luma-450 text-[10px] uppercase tracking-widest">
            Sector
          </dt>
          <dd className="truncate">{invoice.sector}</dd>
        </div>
      </dl>

      {state === "negotiating" && (
        <div className="mt-3 flex items-center gap-2 text-xs text-amber-700 mono">
          <span
            className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse"
            aria-hidden="true"
          />
          <span>Pipeline en curso...</span>
        </div>
      )}

      {state === "sold" && sold && (
        <div className="mt-3 pt-3 border-t border-emerald-300/60">
          <div className="serif text-xl mb-2">
            ${sold.netAmountUSDC.toFixed(4)} USDC
          </div>
          <div className="space-y-1 text-xs mono">
            <div className="text-luma-450">
              comprador · <span className="text-luma-700">{sold.lenderName}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-luma-450">tx ·</span>
              <a
                href={
                  sold.snowtraceUrl ??
                  `https://testnet.snowtrace.io/tx/${sold.txHash}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="underline break-all flex-1"
              >
                {sold.txHash.slice(0, 10)}...{sold.txHash.slice(-8)}
              </a>
              <CopyButton text={sold.txHash} label="Copiar tx hash" />
            </div>
          </div>
          {sold.auditDownloadHref && (
            <a
              href={sold.auditDownloadHref}
              download={sold.auditDownloadFilename ?? "cobraya-audit.json"}
              className="mt-3 block text-center px-4 py-3 border border-luma-300 mono text-[11px] uppercase tracking-widest min-h-[44px] text-luma-700"
            >
              Descargar audit trail JSON
            </a>
          )}
        </div>
      )}

      {state === "failed" && (
        <div className="mt-3 pt-3 border-t border-red-300/60">
          <div className="text-xs text-red-700 mono mb-3">
            {errorMessage ?? "La negociación falló."}
          </div>
          {onScanAnother && (
            <button
              type="button"
              onClick={onScanAnother}
              className="w-full px-4 py-3 border border-luma-300 mono text-xs uppercase tracking-widest min-h-[44px] text-luma-700"
            >
              Escanear otra
            </button>
          )}
        </div>
      )}
    </article>
  );
}
