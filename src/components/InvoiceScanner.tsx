// src/components/InvoiceScanner.tsx
// Cinematic invoice scanner with 4-stage state machine (idle → scanning →
// extracting → done). Pure CSS animations via inline <style jsx global> +
// Tailwind utilities — no Framer Motion.
//
// CD-18 mobile-first: full-width buttons, ≥48px touch targets, safe-area-inset
// honored by the parent layout.
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ScannedInvoicePayload } from "@/app/api/scan-invoice/route";

type Stage = "idle" | "scanning" | "extracting" | "done";

interface Props {
  onConfirm: (payload: ScannedInvoicePayload) => void;
  /** Optional label override (lets the parent change copy when scanning a 2nd factura). */
  ctaLabel?: string;
  /** When true, the component resets to idle on next render (parent triggers via key bump). */
}

const SCAN_DURATION_MS = 1500;
const FIELD_STAGGER_MS = 300;
const NUM_FIELDS = 5;

export function InvoiceScanner({ onConfirm, ctaLabel }: Props) {
  const [stage, setStage] = useState<Stage>("idle");
  const [payload, setPayload] = useState<ScannedInvoicePayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [revealCount, setRevealCount] = useState(0);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  // Cleanup any pending timers when the component unmounts mid-animation.
  useEffect(() => {
    const list = timers.current;
    return () => {
      list.forEach((t) => clearTimeout(t));
    };
  }, []);

  const startScan = useCallback(async () => {
    if (stage !== "idle" && stage !== "done") return;
    setError(null);
    setRevealCount(0);
    setPayload(null);
    setStage("scanning");

    // Kick off the network request in parallel with the scanning animation. By
    // the time the 1.5s scanning phase ends we typically already have the body.
    let scanned: ScannedInvoicePayload | null = null;
    let fetchError: string | null = null;
    const fetchPromise = (async () => {
      try {
        const res = await fetch("/api/scan-invoice", { method: "POST" });
        if (!res.ok) throw new Error(`scan-invoice HTTP ${res.status}`);
        scanned = (await res.json()) as ScannedInvoicePayload;
      } catch (e) {
        fetchError = e instanceof Error ? e.message : "scan failed";
      }
    })();

    timers.current.push(
      setTimeout(async () => {
        await fetchPromise;
        if (fetchError || !scanned) {
          setError(fetchError ?? "scan failed");
          setStage("idle");
          return;
        }
        setPayload(scanned);
        setStage("extracting");
        // Stagger reveal: one field every FIELD_STAGGER_MS.
        for (let i = 1; i <= NUM_FIELDS; i += 1) {
          timers.current.push(
            setTimeout(() => {
              setRevealCount(i);
              if (i === NUM_FIELDS) setStage("done");
            }, i * FIELD_STAGGER_MS),
          );
        }
      }, SCAN_DURATION_MS),
    );
  }, [stage]);

  function handleConfirm() {
    if (payload && stage === "done") onConfirm(payload);
  }

  return (
    <div className="flex flex-col gap-4">
      <style jsx global>{`
        @keyframes scanLineSweep {
          0% {
            transform: translateY(0%);
            opacity: 0.85;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(100%);
            opacity: 0.85;
          }
        }
        @keyframes fieldFadeIn {
          0% {
            opacity: 0;
            transform: translateY(4px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .scan-line-sweep {
          animation: scanLineSweep 1.5s ease-in-out infinite;
        }
        .field-fade-in {
          animation: fieldFadeIn 240ms ease-out both;
        }
      `}</style>

      {stage === "idle" && (
        <button
          type="button"
          onClick={() => void startScan()}
          className="w-full bg-ink text-paper px-4 py-5 mono text-sm uppercase tracking-widest min-h-[56px] flex items-center justify-center gap-3"
          aria-label="Escanear factura"
          data-stage="idle"
        >
          <CameraIcon className="w-5 h-5" />
          <span>{ctaLabel ?? "Escanear factura"}</span>
        </button>
      )}

      {(stage === "scanning" || stage === "extracting" || stage === "done") && (
        <div
          className="relative border-2 border-ink/30 bg-paper overflow-hidden"
          data-stage={stage}
          aria-live="polite"
        >
          {/* Background CFDI mockup */}
          <CfdiBackdrop blurred={stage === "scanning"} />

          {/* Corner brackets — viewfinder framing */}
          <Bracket position="tl" />
          <Bracket position="tr" />
          <Bracket position="bl" />
          <Bracket position="br" />

          {/* Scan line (only during scanning stage) */}
          {stage === "scanning" && (
            <div className="absolute inset-x-0 top-0 h-full pointer-events-none">
              <div
                className="scan-line-sweep absolute inset-x-0 h-1 bg-accent shadow-[0_0_12px_2px_rgba(232,65,66,0.6)]"
                aria-hidden="true"
              />
            </div>
          )}

          <div className="relative px-4 py-6 min-h-[280px] flex flex-col">
            {stage === "scanning" && (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="mono text-[11px] uppercase tracking-widest text-muted mb-2">
                  Escaneando
                </div>
                <div className="serif text-xl text-ink animate-pulse">
                  Buscando CFDI...
                </div>
              </div>
            )}

            {(stage === "extracting" || stage === "done") && payload && (
              <>
                <div className="mono text-[11px] uppercase tracking-widest text-emerald-700 mb-3 flex items-center gap-2">
                  <CheckIcon className="w-3 h-3" />
                  CFDI detectado
                </div>
                <ul className="space-y-2 text-sm">
                  {revealCount >= 1 && (
                    <FieldRow
                      label="UUID"
                      value={payload.uuidCfdi}
                      mono
                      truncate
                    />
                  )}
                  {revealCount >= 2 && (
                    <FieldRow
                      label="RFC Emisor"
                      value={maskRfc(payload.rfcEmisor)}
                      mono
                    />
                  )}
                  {revealCount >= 3 && (
                    <FieldRow label="Receptor" value={payload.anchorBuyer} />
                  )}
                  {revealCount >= 4 && (
                    <FieldRow
                      label="Monto"
                      value={`$${payload.amountMXN.toLocaleString("es-MX")} MXN`}
                      mono
                    />
                  )}
                  {revealCount >= 5 && (
                    <FieldRow
                      label="Vencimiento"
                      value={`${payload.paymentTermsDays} días`}
                      mono
                    />
                  )}
                </ul>
              </>
            )}
          </div>
        </div>
      )}

      {stage === "done" && payload && (
        <button
          type="button"
          onClick={handleConfirm}
          className="w-full bg-ink text-paper px-4 py-4 mono text-sm uppercase tracking-widest min-h-[48px]"
          data-stage="done-confirm"
        >
          Negociar esta factura
        </button>
      )}

      {error && (
        <div
          className="border border-red-500 px-4 py-3 text-sm text-red-700 mono"
          role="alert"
        >
          {error}
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Helpers / sub-components
// ──────────────────────────────────────────────────────────────────────────────

function maskRfc(rfc: string): string {
  return rfc.length >= 6 ? `${rfc.slice(0, 4)}***` : "***";
}

function FieldRow({
  label,
  value,
  mono,
  truncate,
}: {
  label: string;
  value: string;
  mono?: boolean;
  truncate?: boolean;
}) {
  return (
    <li className="field-fade-in flex items-start gap-3 border-b border-ink/10 pb-2">
      <div className="text-[10px] uppercase tracking-widest text-muted mono w-20 flex-shrink-0 pt-0.5">
        {label}
      </div>
      <div
        className={`flex-1 ${mono ? "mono text-xs" : "text-sm"} ${truncate ? "truncate" : ""}`}
      >
        {value}
      </div>
    </li>
  );
}

function Bracket({ position }: { position: "tl" | "tr" | "bl" | "br" }) {
  const base = "absolute w-6 h-6 border-ink";
  const map: Record<typeof position, string> = {
    tl: "top-2 left-2 border-t-2 border-l-2",
    tr: "top-2 right-2 border-t-2 border-r-2",
    bl: "bottom-2 left-2 border-b-2 border-l-2",
    br: "bottom-2 right-2 border-b-2 border-r-2",
  };
  return <span className={`${base} ${map[position]}`} aria-hidden="true" />;
}

function CfdiBackdrop({ blurred }: { blurred: boolean }) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none transition-[filter] duration-300 ${blurred ? "blur-sm" : "blur-[1px] opacity-70"}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 320 280"
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full"
      >
        <rect width="320" height="280" fill="#FAFAF8" />
        <rect x="16" y="20" width="180" height="10" fill="#0A0A0A" opacity="0.85" />
        <rect x="16" y="36" width="120" height="6" fill="#6B7280" opacity="0.5" />
        <rect x="220" y="20" width="84" height="32" fill="#E84142" opacity="0.55" />
        <rect x="16" y="62" width="288" height="1" fill="#0A0A0A" opacity="0.2" />
        <rect x="16" y="74" width="60" height="6" fill="#6B7280" opacity="0.6" />
        <rect x="16" y="86" width="200" height="6" fill="#0A0A0A" opacity="0.75" />
        <rect x="16" y="100" width="80" height="6" fill="#6B7280" opacity="0.5" />
        <rect x="16" y="112" width="180" height="6" fill="#0A0A0A" opacity="0.7" />
        <rect x="16" y="132" width="288" height="1" fill="#0A0A0A" opacity="0.2" />
        <rect x="16" y="146" width="40" height="6" fill="#6B7280" opacity="0.6" />
        <rect x="16" y="158" width="80" height="14" fill="#0A0A0A" opacity="0.85" />
        <rect x="200" y="146" width="40" height="6" fill="#6B7280" opacity="0.6" />
        <rect x="200" y="158" width="100" height="14" fill="#0A0A0A" opacity="0.85" />
        <rect x="16" y="184" width="288" height="1" fill="#0A0A0A" opacity="0.2" />
        <rect x="16" y="196" width="50" height="6" fill="#6B7280" opacity="0.5" />
        <rect x="16" y="208" width="160" height="6" fill="#0A0A0A" opacity="0.7" />
        <rect x="16" y="220" width="140" height="6" fill="#0A0A0A" opacity="0.7" />
        <rect x="16" y="232" width="100" height="6" fill="#6B7280" opacity="0.5" />
        <rect x="220" y="232" width="84" height="32" fill="#0A0A0A" opacity="0.85" />
      </svg>
    </div>
  );
}

function CameraIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 7h3l2-3h8l2 3h3v12H3z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
