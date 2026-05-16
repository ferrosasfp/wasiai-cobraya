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
          className="cta-primary text-sm"
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
          className="cta-primary text-sm"
          data-stage="done-confirm"
        >
          Es correcta, continuar
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
      className={`absolute inset-0 pointer-events-none transition-[filter] duration-300 ${blurred ? "blur-sm" : "blur-[1.5px] opacity-85"}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 320 280"
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full"
      >
        {/* Paper bg — cream tone matches the rest of the app shell. */}
        <rect width="320" height="280" fill="#FFFAF5" />

        {/* Guinda header band — reads as "Mexican CFDI 4.0 invoice header" */}
        <rect x="0" y="0" width="320" height="44" fill="#4F0820" />
        <text x="16" y="22" fontFamily="Inter, sans-serif" fontSize="11" fontWeight="700" fill="#FFF7F2" letterSpacing="0.06em">
          FACTURA · CFDI 4.0
        </text>
        <text x="16" y="36" fontFamily="JetBrains Mono, monospace" fontSize="7" fill="#FFC1CA" letterSpacing="0.08em">
          Folio A-1234 · Serie A · 2026-05-16
        </text>
        {/* SAT-style accent badge (top-right of header) */}
        <rect x="240" y="10" width="64" height="24" rx="3" fill="#7A1232" />
        <text x="248" y="25" fontFamily="JetBrains Mono, monospace" fontSize="8" fontWeight="700" fill="#FFE5E8" letterSpacing="0.1em">
          SAT v4.0
        </text>

        {/* Emisor block — RFC + razón social */}
        <text x="16" y="62" fontFamily="JetBrains Mono, monospace" fontSize="7" fill="#9B1B47" letterSpacing="0.08em" fontWeight="700">
          EMISOR
        </text>
        <text x="16" y="76" fontFamily="Inter, sans-serif" fontSize="9" fontWeight="600" fill="#4F0820">
          Tortillería La Esperanza S.A. de C.V.
        </text>
        <text x="16" y="88" fontFamily="JetBrains Mono, monospace" fontSize="8" fill="#7A1232">
          RFC: TLE850120ABC · Régimen 601
        </text>

        {/* Divider */}
        <line x1="16" y1="98" x2="304" y2="98" stroke="#FFC1CA" strokeWidth="0.6" />

        {/* Receptor block */}
        <text x="16" y="112" fontFamily="JetBrains Mono, monospace" fontSize="7" fill="#9B1B47" letterSpacing="0.08em" fontWeight="700">
          RECEPTOR
        </text>
        <text x="16" y="126" fontFamily="Inter, sans-serif" fontSize="9" fontWeight="600" fill="#4F0820">
          Walmart de México S.A.B. de C.V.
        </text>
        <text x="16" y="138" fontFamily="JetBrains Mono, monospace" fontSize="8" fill="#7A1232">
          RFC: WAL9709244WS · Uso G03
        </text>

        {/* Conceptos table header */}
        <line x1="16" y1="148" x2="304" y2="148" stroke="#FFC1CA" strokeWidth="0.6" />
        <text x="16" y="160" fontFamily="JetBrains Mono, monospace" fontSize="7" fill="#9B1B47" letterSpacing="0.08em" fontWeight="700">
          CANT  CLAVE      DESCRIPCIÓN                          IMPORTE
        </text>
        <line x1="16" y1="164" x2="304" y2="164" stroke="#FFC1CA" strokeWidth="0.4" />

        {/* 3 concept rows */}
        <text x="16" y="176" fontFamily="JetBrains Mono, monospace" fontSize="8" fill="#4F0820">
          120   01010101   Tortillas maíz blanco 1 kg            $14,400.00
        </text>
        <text x="16" y="188" fontFamily="JetBrains Mono, monospace" fontSize="8" fill="#4F0820">
          80    01010101   Tortillas harina trigo 1 kg           $11,200.00
        </text>
        <text x="16" y="200" fontFamily="JetBrains Mono, monospace" fontSize="8" fill="#4F0820">
          200   90121502   Servicio reparto refrigerado          $16,200.00
        </text>

        {/* Totals — right aligned */}
        <line x1="180" y1="208" x2="304" y2="208" stroke="#FFC1CA" strokeWidth="0.6" />
        <text x="180" y="220" fontFamily="JetBrains Mono, monospace" fontSize="8" fill="#7A1232">
          Subtotal:                             $41,800.00
        </text>
        <text x="180" y="232" fontFamily="JetBrains Mono, monospace" fontSize="8" fill="#7A1232">
          IVA 16%:                               $6,688.00
        </text>
        <text x="180" y="246" fontFamily="JetBrains Mono, monospace" fontSize="10" fontWeight="700" fill="#4F0820">
          TOTAL MXN:                            $48,488.00
        </text>

        {/* QR code stylized (grid of squares — looks QR-ish when blurred) */}
        <rect x="16" y="212" width="56" height="56" fill="#FFF7F2" stroke="#7A1232" strokeWidth="1" rx="2" />
        {/* QR pixel pattern — finder squares + random data dots */}
        <g fill="#4F0820">
          {/* Finder squares (top-left, top-right, bottom-left) */}
          <rect x="20" y="216" width="12" height="12" />
          <rect x="22" y="218" width="8" height="8" fill="#FFF7F2" />
          <rect x="24" y="220" width="4" height="4" />
          <rect x="56" y="216" width="12" height="12" />
          <rect x="58" y="218" width="8" height="8" fill="#FFF7F2" />
          <rect x="60" y="220" width="4" height="4" />
          <rect x="20" y="252" width="12" height="12" />
          <rect x="22" y="254" width="8" height="8" fill="#FFF7F2" />
          <rect x="24" y="256" width="4" height="4" />
          {/* Pseudo-random data modules */}
          <rect x="36" y="218" width="2" height="2" />
          <rect x="40" y="218" width="2" height="2" />
          <rect x="44" y="218" width="2" height="2" />
          <rect x="36" y="222" width="2" height="2" />
          <rect x="44" y="222" width="2" height="2" />
          <rect x="38" y="226" width="2" height="2" />
          <rect x="42" y="226" width="2" height="2" />
          <rect x="48" y="226" width="2" height="2" />
          <rect x="36" y="230" width="2" height="2" />
          <rect x="40" y="230" width="2" height="2" />
          <rect x="46" y="230" width="2" height="2" />
          <rect x="50" y="230" width="2" height="2" />
          <rect x="36" y="234" width="2" height="2" />
          <rect x="42" y="234" width="2" height="2" />
          <rect x="48" y="234" width="2" height="2" />
          <rect x="38" y="238" width="2" height="2" />
          <rect x="46" y="238" width="2" height="2" />
          <rect x="36" y="242" width="2" height="2" />
          <rect x="40" y="242" width="2" height="2" />
          <rect x="44" y="242" width="2" height="2" />
          <rect x="48" y="242" width="2" height="2" />
          <rect x="36" y="246" width="2" height="2" />
          <rect x="42" y="246" width="2" height="2" />
          <rect x="38" y="252" width="2" height="2" />
          <rect x="44" y="252" width="2" height="2" />
          <rect x="50" y="252" width="2" height="2" />
          <rect x="36" y="256" width="2" height="2" />
          <rect x="40" y="256" width="2" height="2" />
          <rect x="46" y="256" width="2" height="2" />
          <rect x="38" y="260" width="2" height="2" />
          <rect x="44" y="260" width="2" height="2" />
          <rect x="48" y="260" width="2" height="2" />
        </g>

        {/* Folio fiscal UUID (next to QR) */}
        <text x="80" y="220" fontFamily="JetBrains Mono, monospace" fontSize="6" fill="#9B1B47" letterSpacing="0.05em" fontWeight="700">
          FOLIO FISCAL (UUID)
        </text>
        <text x="80" y="232" fontFamily="JetBrains Mono, monospace" fontSize="6" fill="#4F0820" letterSpacing="0.04em">
          0874853a-91bf-4643-a221
        </text>
        <text x="80" y="240" fontFamily="JetBrains Mono, monospace" fontSize="6" fill="#4F0820" letterSpacing="0.04em">
          -92c79933f987
        </text>
        <text x="80" y="254" fontFamily="JetBrains Mono, monospace" fontSize="6" fill="#9B1B47" letterSpacing="0.05em" fontWeight="700">
          SELLO DIGITAL DEL SAT
        </text>
        <text x="80" y="263" fontFamily="JetBrains Mono, monospace" fontSize="5" fill="#7A1232" letterSpacing="0.04em" opacity="0.7">
          MEUCIQDx7BqL5Y0d9j8xK1mP3w7n2xz...
        </text>
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
