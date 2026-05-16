// src/app/demo/page.tsx — PUBLIC live agentic demo (no auth required).
//
// Replaces the previous /demo redirect stub. Lives OUTSIDE the (app) route
// group so it does NOT inherit the authed TopNav/BottomTabs shell — judges
// hitting /demo from a cold session should land on the live pipeline, not on
// /login.
//
// Middleware (src/middleware.ts AUTH_EXEMPT_PREFIXES) already lists "/demo",
// so anonymous visitors are explicitly allowed. The downstream /api/agents/*
// + /api/settle + /api/demo/run routes are exempt from the middleware matcher
// via the `api` exclusion in config.matcher (see src/middleware.ts L91).
//
// Server component: emits SEO/OG meta + the page chrome (banner, back-to-pitch
// link). The interactive pipeline runs in the DemoFlow client component.
import type { Metadata } from "next";
import Link from "next/link";
import { DemoFlow } from "@/components/demo/DemoFlow";

export const metadata: Metadata = {
  title: "Demo en vivo · Cobraya",
  description:
    "Mirá el flujo agéntico de Cobraya end-to-end: 4 agentes autónomos validan tu factura y la convierten en USDC reales en Avalanche Fuji en ~30 segundos.",
  openGraph: {
    title: "Cobraya · Demo agéntico en vivo",
    description:
      "Factoraje agéntico para PyMEs mexicanas. Tu factura, líquida en 30 segundos. Demo público con tx real on-chain.",
    type: "website",
    locale: "es_MX",
  },
  twitter: {
    card: "summary",
    title: "Cobraya · Demo agéntico en vivo",
    description:
      "4 agentes autónomos negocian tu factura en 30 segundos. USDC real en Avalanche Fuji.",
  },
  robots: { index: true, follow: true },
};

export default function DemoPage() {
  return (
    <main className="min-h-screen pb-32 px-4 pt-4 max-w-3xl mx-auto bg-paper">
      {/* Public-demo context banner — communicates to the judge/visitor that
          they are looking at synthetic data BUT the settlement tx itself is
          real on-chain (capped at $0.05 USDC per CD-5). */}
      <div
        className="border border-luma-300 bg-luma-50 text-luma-700 mono text-[10px] uppercase tracking-widest px-3 py-2 rounded flex items-center justify-between gap-2 mb-3"
        role="note"
        aria-label="Contexto del demo público"
      >
        <span>Demo público · Datos sintéticos · TX real en Avalanche Fuji</span>
        <Link
          href="/pitch"
          className="underline text-luma-450 hover:text-luma-700 normal-case tracking-normal"
        >
          ← Volver al pitch
        </Link>
      </div>

      <header className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-luma-450">Demo en vivo</span>
          <span className="mono text-[10px] uppercase tracking-widest text-luma-450">
            Avalanche Fuji
          </span>
        </div>
        <h1 className="serif text-3xl text-luma-700 leading-tight">
          Tu factura, líquida en 30 segundos.
        </h1>
        <p className="text-sm text-luma-450 mt-2">
          Cuatro agentes autónomos verifican, registran en blockchain, evalúan
          riesgo y subastan tu factura entre 4 compradores. Al firmar, recibís
          USDC reales en Avalanche.
        </p>
      </header>

      <DemoFlow />
    </main>
  );
}
