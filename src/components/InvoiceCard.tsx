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

      {/* Primary metric — monto sale grande y serif. Reads as "this is the
          number that matters" (the factoring amount). */}
      <div className="mb-3">
        <div className="text-luma-450 text-[10px] uppercase tracking-widest mb-1">
          Monto facturado
        </div>
        <div className="serif text-3xl text-luma-700 leading-none">
          ${invoice.amountMXN.toLocaleString("es-MX")}
          <span className="text-sm text-luma-450 ml-2 align-middle">MXN</span>
        </div>
      </div>

      <dl className="grid grid-cols-3 gap-x-3 gap-y-3 text-xs mono mb-3 pt-3 border-t border-luma-200">
        <div>
          <dt className="text-luma-450 text-[10px] uppercase tracking-widest mb-0.5">
            Vence
          </dt>
          <dd className="text-luma-700">{invoice.paymentTermsDays} días</dd>
        </div>
        <div>
          <dt className="text-luma-450 text-[10px] uppercase tracking-widest mb-0.5">
            RFC
          </dt>
          <dd className="text-luma-700">{maskRfc(invoice.rfcEmisor)}</dd>
        </div>
        <div>
          <dt className="text-luma-450 text-[10px] uppercase tracking-widest mb-0.5">
            Sector
          </dt>
          <dd className="text-luma-700 truncate">{invoice.sector}</dd>
        </div>
      </dl>

      {/* Mini fiscal footer — communicates "this is a real CFDI 4.0" via
          UUID prefix + SAT validation indicator. Same pattern that the
          CfdiBackdrop uses at scan time, carried into the card to keep the
          documentary feel coherent across the flow. */}
      <div className="flex items-center justify-between gap-2 pt-3 border-t border-luma-200 text-[10px] mono text-luma-450">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="uppercase tracking-widest text-luma-450">UUID·</span>
          <span className="text-luma-700 truncate">
            {invoice.uuidCfdi.slice(0, 8)}…{invoice.uuidCfdi.slice(-4)}
          </span>
        </div>
        <span className="inline-flex items-center gap-1 flex-shrink-0 text-emerald-700">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden />
          CFDI 4.0
        </span>
      </div>

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
