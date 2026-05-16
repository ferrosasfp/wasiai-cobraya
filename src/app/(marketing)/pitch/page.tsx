// src/app/(marketing)/pitch/page.tsx — Hackathon pitch landing v2 (2026-05-16)
//
// 8-section landing for the 3-min video pitch. Server component, mobile-first,
// pure-CSS animations (no framer-motion — not in deps).
//
// Design notes:
// - Palette: luma-* tokens only (paper/ink/muted/line for neutrals).
// - Snowtrace contract addr read from env at request time, fallback to known
//   Fuji deployment so the badge always renders a live link.
// - Audit example: dynamic in prod (per requestId) — anchor placeholder until
//   a stable signed sample is exposed at /public/audit-example.json.
// - PhoneMockup: 4-screen carousel, 6s loop, slide-in-from-right via CSS
//   keyframes defined in globals.css (pitch-screen-1..4 + pitch-screen-dot-1..4).

import Link from "next/link";
import { BrandIcon } from "@/components/BrandIcon";

// Fuji testnet deployment of CobrayaInvoiceCommitments (public on-chain data).
// Mirrors src/infra/env.ts → COBRAYA_COMMITMENTS_ADDRESS.
const FUJI_COMMITMENTS_FALLBACK = "0x5F8F8a31e51d8B2FEe0E0C2f1AffC3B4c6B12506";

function getCommitmentsUrl(): string {
  const addr =
    process.env.COBRAYA_COMMITMENTS_ADDRESS || FUJI_COMMITMENTS_FALLBACK;
  return `https://testnet.snowtrace.io/address/${addr}`;
}

function getCommitmentsAddress(): string {
  return process.env.COBRAYA_COMMITMENTS_ADDRESS || FUJI_COMMITMENTS_FALLBACK;
}

const GITHUB_URL = "https://github.com/ferrosasfp/wasiai-cobraya";
const A2A_GITHUB_URL = "https://github.com/ferrosasfp/wasiai-a2a";
// TODO(audit): wire to /public/audit-example.json once we ship a signed sample.
const AUDIT_EXAMPLE_URL = "#audit-example";

export default function PitchPage() {
  const snowtraceUrl = getCommitmentsUrl();
  const commitmentsAddr = getCommitmentsAddress();
  const addrShort = `${commitmentsAddr.slice(0, 6)}...${commitmentsAddr.slice(-4)}`;

  return (
    <main className="min-h-screen bg-paper text-ink">
      {/* ═════════════════════════════════════════════════════════════════════
        * SECTION 1 — HERO
        * ═════════════════════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden py-16 sm:py-20 lg:py-28"
        style={{
          backgroundImage:
            "radial-gradient(120% 80% at 50% 0%, rgba(122,18,50,0.10) 0%, rgba(122,18,50,0) 60%), linear-gradient(180deg, #FAFAF8 0%, #FFF7F2 100%)",
        }}
      >
        {/* Subtle grain overlay */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, #4F0820 1px, transparent 1px), radial-gradient(circle at 70% 60%, #4F0820 1px, transparent 1px)",
            backgroundSize: "32px 32px, 24px 24px",
          }}
        />

        <div className="max-w-6xl mx-auto px-6 relative">
          <header className="flex items-center gap-3 mb-12 fade-up-on-load">
            <BrandIcon className="w-8 h-8" />
            <span className="mono text-[11px] uppercase tracking-widest text-luma-450">
              Cobraya · Pitch
            </span>
          </header>

          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-16 items-center">
            <div>
              <div
                className="mono text-[11px] uppercase tracking-[0.18em] text-luma-450 mb-5 fade-up-on-load"
                style={{ animationDelay: "60ms" }}
              >
                Avalanche LATAM Fintech Build · 2026
              </div>

              <h1
                className="serif text-5xl sm:text-6xl lg:text-7xl leading-[1.04] tracking-tight text-luma-700 fade-up-on-load"
                style={{ animationDelay: "120ms" }}
              >
                Tu factura, líquida en 30 segundos.
              </h1>

              <p
                className="text-lg text-luma-500 mt-6 leading-relaxed max-w-xl fade-up-on-load"
                style={{ animationDelay: "200ms" }}
              >
                Factoraje agéntico para PyMEs mexicanas. 4 agentes de IA +
                smart contract en Avalanche. Sin papeleo. Sin comités.
                Sin esperar 60 días.
              </p>

              <ul
                className="mt-7 flex flex-wrap gap-2 fade-up-on-load"
                style={{ animationDelay: "280ms" }}
              >
                <HeroChip>$24B TAM MX</HeroChip>
                <HeroChip>Avalanche Fuji ✓</HeroChip>
                <HeroChip>CNBV Circular 4/2024 ready</HeroChip>
                <HeroChip>1660+ tests</HeroChip>
              </ul>

              <div
                className="mt-10 flex flex-col sm:flex-row gap-3 fade-up-on-load"
                style={{ animationDelay: "360ms" }}
              >
                <Link
                  href="/demo"
                  className="pill-btn-primary inline-flex items-center justify-center px-7 min-h-[52px]"
                >
                  Ver demo en vivo
                </Link>
                <a
                  href={snowtraceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pill-btn inline-flex items-center justify-center gap-2 px-7 min-h-[52px] !bg-transparent !text-luma-700 border border-luma-200"
                >
                  Snowtrace contract <span aria-hidden="true">↗</span>
                </a>
              </div>
            </div>

            <div
              className="flex justify-center lg:justify-end fade-up-on-load"
              style={{ animationDelay: "240ms" }}
            >
              <PhoneMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════════
        * SECTION 2 — PROBLEMA + TIMELINE VISUAL
        * ═════════════════════════════════════════════════════════════════════ */}
      <section className="bg-paper border-t border-luma-200/40 py-20 lg:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-3xl">
            <div className="mono text-[11px] uppercase tracking-widest text-luma-450 mb-4">
              El problema
            </div>
            <h2 className="serif text-4xl sm:text-5xl leading-[1.08] tracking-tight text-luma-700">
              Lupita vende. Walmart paga... en 60 días.
            </h2>
            <p className="mt-5 text-lg text-luma-500 leading-relaxed">
              La PyME mexicana factura, entrega, y se queda sin liquidez
              esperando que un comité humano firme un papel.
            </p>
          </div>

          <TimelineComparison />

          <div className="mt-16 grid sm:grid-cols-3 gap-4">
            <StatCard
              icon={<InvoiceIcon />}
              big="$48,500 MXN"
              label="factura típica PyME"
            />
            <StatCard
              icon={<ClockIcon />}
              big="60 días → 30 seg"
              label="reducción de tiempo"
            />
            <StatCard
              icon={<TrendingDownIcon />}
              big="78% de PyMEs MX"
              label="cierran por flujo de caja"
            />
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════════
        * SECTION 3 — CÓMO FUNCIONA
        * ═════════════════════════════════════════════════════════════════════ */}
      <section className="bg-luma-50 border-t border-luma-200/40 py-20 lg:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-3xl">
            <div className="mono text-[11px] uppercase tracking-widest text-luma-450 mb-4">
              Cómo funciona
            </div>
            <h2 className="serif text-4xl sm:text-5xl leading-[1.08] tracking-tight text-luma-700">
              Cómo funciona, en 4 pasos.
            </h2>
            <p className="mt-5 text-lg text-luma-450 leading-relaxed">
              Lupita lo hace desde el celular. Los agentes lo hacen on-chain.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StepCard
              number="01"
              icon={<CameraIcon />}
              title="Subí tu factura CFDI"
              desc="Foto del XML del SAT desde el celular. Sin uploads pesados."
              time="~3 segundos"
            />
            <StepCard
              number="02"
              icon={<CpuIcon />}
              title="4 agentes de IA la procesan"
              desc="Validan SAT, detectan doble-cesión, calculan score, lanzan subasta."
              time="~15 segundos"
            />
            <StepCard
              number="03"
              icon={<HandshakeIcon />}
              title="Bankaool, Arkangeles, BBVA, Konfío compiten"
              desc="Subasta transparente. Gana la mejor oferta para vos."
              time="~7 segundos"
            />
            <StepCard
              number="04"
              icon={<WalletIcon />}
              title="Recibís USDC en Avalanche"
              desc="Settlement EIP-3009 directo a tu wallet. Audit trail firmado."
              time="~5 segundos"
            />
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════════
        * SECTION 4 — 4 AGENTES
        * ═════════════════════════════════════════════════════════════════════ */}
      <section className="bg-paper border-t border-luma-200/40 py-20 lg:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-3xl">
            <div className="mono text-[11px] uppercase tracking-widest text-luma-450 mb-4">
              Los agentes
            </div>
            <h2 className="serif text-4xl sm:text-5xl leading-[1.08] tracking-tight text-luma-700">
              4 agentes. 4 precios en USDC. 4 evidencias on-chain.
            </h2>
            <p className="mt-5 text-lg text-luma-450 leading-relaxed">
              Cada uno cuesta lo que vale. Cada uno deja huella verificable.
            </p>
          </div>

          <ul className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <AgentCard
              icon={<DocIcon />}
              name="CFDI Validator"
              cost="$0.001 USDC"
              desc="Parsea el XML del CFDI 4.0, verifica firma del SAT, valida emisor y receptor contra el RFC."
              verifies="Hash del CFDI commiteado on-chain antes del settlement"
              json={`{
  "uuid": "9F8E...A21",
  "total": 48500,
  "verified": true
}`}
            />
            <AgentCard
              icon={<ShieldIcon />}
              name="Fraud Detector"
              cost="$0.005 USDC"
              desc="Detecta doble-cesión consultando el commitment contract en Avalanche Fuji. Anti-fraude regulatorio MX."
              verifies="Lookup en CobrayaInvoiceCommitments.sol — gas <80K"
              json={`{
  "hash": "0x7d3...",
  "previouslyCommitted": false
}`}
            />
            <AgentCard
              icon={<ChartIcon />}
              name="Credit Scorer"
              cost="$0.05 USDC"
              desc="Calcula score 300-850 con multi-factor (RFC, sector, historial, buyer). Rationale generado por Claude Haiku."
              verifies="Receipt EIP-712 firmado, rationale provenance trackeado"
              json={`{
  "score": 742,
  "band": "A",
  "rationale": "..."
}`}
            />
            <AgentCard
              icon={<HandshakeIcon />}
              name="Lender Matcher"
              cost="$0.01 USDC"
              desc="Lanza subasta entre 4 lenders, evalúa APR + advance rate + speed. Gana la mejor oferta para el SME."
              verifies="Auction transparente, 4 ofertas firmadas EIP-712"
              json={`{
  "winner": "arkangeles",
  "apr": 19.8,
  "net": 952
}`}
            />
          </ul>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════════
        * SECTION 5 — COBRAYA VS TRADICIONAL
        * ═════════════════════════════════════════════════════════════════════ */}
      <section className="bg-luma-50 border-t border-luma-200/40 py-20 lg:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-3xl mb-12">
            <div className="mono text-[11px] uppercase tracking-widest text-luma-450 mb-4">
              Lo viejo vs lo nuevo
            </div>
            <h2 className="serif text-4xl sm:text-5xl leading-[1.08] tracking-tight text-luma-700">
              Lo viejo, ya cumplió.
            </h2>
          </div>

          <ComparisonTable />
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════════
        * SECTION 6 — BUILT ON AVALANCHE (STACK)
        * ═════════════════════════════════════════════════════════════════════ */}
      <section className="bg-paper border-t border-luma-200/40 py-20 lg:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-3xl">
            <div className="mono text-[11px] uppercase tracking-widest text-luma-450 mb-4">
              El stack
            </div>
            <h2 className="serif text-4xl sm:text-5xl leading-[1.08] tracking-tight text-luma-700">
              Stack de producción, no de hackathon.
            </h2>
            <p className="mt-5 text-lg text-luma-450 leading-relaxed">
              Cobraya corre sobre infraestructura agéntica probada. No
              reinventamos: integramos.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StackCard
              icon={<AvalancheIcon />}
              name="Avalanche"
              sub="Smart contract en Fuji testnet"
              tone="alt"
            />
            <StackCard
              icon={<UsdcIcon />}
              name="USDC"
              sub="Settlement EIP-3009"
            />
            <StackCard
              icon={<ForgeIcon />}
              name="Foundry + OpenZeppelin"
              sub="Ownable2Step, gas optimized"
              tone="alt"
            />
            <StackCard
              icon={<ClaudeIcon />}
              name="Anthropic Claude"
              sub="Rationale IA firmado"
            />
            <StackCard
              icon={<A2AIcon />}
              name="wasiai-a2a"
              sub="Marketplace de agentes (Railway prod)"
            />
            <StackCard
              icon={<A2AIcon />}
              name="wasiai-facilitator"
              sub="Settlement service (Railway prod)"
              tone="alt"
            />
            <StackCard
              icon={<NextJsIcon />}
              name="Next.js 14 + PWA"
              sub="Mobile-first, installable"
              tone="alt"
            />
            <StackCard
              icon={<SupabaseIcon />}
              name="Supabase"
              sub="Postgres + RLS app-layer"
            />
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════════
        * SECTION 7 — ESTO NO ES MOCKUP
        * ═════════════════════════════════════════════════════════════════════ */}
      <section className="bg-luma-50 border-t border-luma-200/40 py-20 lg:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-3xl">
            <div className="mono text-[11px] uppercase tracking-widest text-luma-450 mb-4">
              La prueba
            </div>
            <h2 className="serif text-4xl sm:text-5xl leading-[1.08] tracking-tight text-luma-700">
              Verificalo vos mismo.
            </h2>
            <p className="mt-5 text-lg text-luma-450 leading-relaxed">
              4 evidencias, 4 links, 0 promesas.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ProofBadge
              title="Smart contract verificado"
              subtitle="CobrayaInvoiceCommitments.sol"
              href={snowtraceUrl}
              external
              cta="Ver en Snowtrace"
            >
              <div className="mono text-[11px] text-luma-450 truncate">
                {addrShort}
              </div>
              <div className="mono text-[11px] text-luma-450 mt-1">
                Avalanche Fuji · ChainID 43113
              </div>
              <div className="mt-3 inline-flex items-center gap-2 mono text-[11px] px-2.5 py-1 rounded-full bg-luma-100 text-luma-700">
                Gas usado: &lt;80K
              </div>
            </ProofBadge>

            <ProofBadge
              title="Audit trail firmado EIP-712"
              subtitle="Compliance Circular 4/2024 CNBV"
              href={AUDIT_EXAMPLE_URL}
              arrow="↓"
              cta="Ver ejemplo JSON"
            >
              <pre className="mono text-[10px] leading-snug bg-paper border border-luma-200/60 rounded-lg p-3 mt-1 text-luma-700 overflow-hidden">
{`{
  "agent": "credit-scorer",
  "signer": "0x1d02...21cF",
  "signature": "0xa3f..."
}`}
              </pre>
            </ProofBadge>

            <ProofBadge
              title="4 lenders compitiendo en vivo"
              subtitle="Bankaool · Arkangeles · BBVA · Konfío"
              href="/demo"
              cta="Ver subasta"
            >
              <div className="flex flex-wrap gap-1.5 mt-1">
                <Pill>21.5%</Pill>
                <Pill highlight>19.8% ⭐</Pill>
                <Pill>23.2%</Pill>
                <Pill>20.4%</Pill>
              </div>
            </ProofBadge>

            <ProofBadge
              title="1660+ tests en producción"
              subtitle="wasiai-a2a + wasiai-facilitator"
              href={A2A_GITHUB_URL}
              external
              cta="Ver código"
            >
              <div className="mono text-[11px] text-luma-450 leading-relaxed">
                181 tests Cobraya
                <br />
                1660+ tests A2A
                <br />
                Railway prod
              </div>
            </ProofBadge>
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════════
        * SECTION 8 — MANIFIESTO + CTA + FOOTER
        * ═════════════════════════════════════════════════════════════════════ */}
      <section
        className="relative text-luma-50 py-24"
        style={{
          background:
            "linear-gradient(135deg, #4F0820 0%, #7A1232 60%, #9B1B47 100%)",
        }}
      >
        <div className="max-w-5xl mx-auto px-6 text-center relative">
          <blockquote className="serif italic text-3xl sm:text-5xl lg:text-6xl leading-[1.1] max-w-3xl mx-auto text-luma-50">
            “El factoring tradicional sirvió. 50 años. Ya cumplió.
            <br />
            Es turno de los agentes.”
          </blockquote>

          <div className="my-14 mx-auto w-24 h-px bg-luma-200/30" aria-hidden="true" />

          <div className="flex flex-col items-center">
            <div className="mono text-[11px] uppercase tracking-widest text-luma-200/80 mb-3">
              ¿Ya cobraste?
            </div>
            <div
              className="serif text-6xl sm:text-7xl lg:text-8xl leading-none"
              style={{
                backgroundImage:
                  "linear-gradient(180deg, #FFE5E8 0%, #FFF7F2 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              Cobraya.
            </div>

            <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center w-full sm:w-auto">
              <Link
                href="/"
                className="pill-btn-primary inline-flex items-center justify-center px-8 min-h-[52px]"
              >
                Probá Cobraya
              </Link>
              <a
                href="#video"
                className="pill-btn inline-flex items-center justify-center px-8 min-h-[52px] !bg-transparent !text-luma-50 border border-luma-200/50 hover:bg-luma-200/10"
              >
                Ver video (3 min)
              </a>
            </div>
          </div>

          <Footer3Col snowtraceUrl={snowtraceUrl} />
        </div>
      </section>
    </main>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Sub-components — local, only consumer is this page.
 * ──────────────────────────────────────────────────────────────────────────── */

function HeroChip({ children }: { children: React.ReactNode }) {
  return (
    <li className="mono text-xs px-3 py-1.5 rounded-full bg-luma-100/80 border border-luma-200 text-luma-700">
      {children}
    </li>
  );
}

/* ─── Phone mockup (4-screen carousel) ────────────────────────────────────── */

function PhoneMockup() {
  return (
    <div className="relative">
      {/* Side buttons */}
      <span
        aria-hidden="true"
        className="hidden sm:block absolute top-24 -left-[3px] w-[3px] h-7 bg-luma-700 rounded-l-sm"
      />
      <span
        aria-hidden="true"
        className="hidden sm:block absolute top-36 -left-[3px] w-[3px] h-12 bg-luma-700 rounded-l-sm"
      />
      <span
        aria-hidden="true"
        className="hidden sm:block absolute top-52 -left-[3px] w-[3px] h-12 bg-luma-700 rounded-l-sm"
      />
      <span
        aria-hidden="true"
        className="hidden sm:block absolute top-32 -right-[3px] w-[3px] h-16 bg-luma-700 rounded-r-sm"
      />

      {/* Phone frame */}
      <div
        role="img"
        aria-label="Cobraya app demo: escanear factura, agentes procesando, subasta de lenders, USDC recibido"
        className="relative w-[280px] sm:w-[320px] lg:w-[340px] aspect-[9/19.5] rounded-[48px] border-2 border-luma-700 bg-luma-700 p-2 shadow-[0_30px_90px_-20px_rgba(122,18,50,0.45)]"
      >
        {/* Inner screen */}
        <div className="relative w-full h-full rounded-[40px] bg-paper overflow-hidden">
          {/* Status bar */}
          <div className="absolute top-0 left-0 right-0 h-10 flex items-center justify-between px-7 pt-2.5 z-20 pointer-events-none">
            <span className="mono text-[11px] text-luma-700 font-semibold">
              9:41
            </span>
            <div className="flex items-center gap-1.5">
              <StatusSignal />
              <StatusWifi />
              <StatusBattery />
            </div>
          </div>

          {/* Dynamic Island */}
          <div
            aria-hidden="true"
            className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-6 rounded-full bg-ink z-30"
          />

          {/* Screens carousel — all absolute, slide via keyframes */}
          <div className="absolute inset-0 pt-12 pb-3 px-4 overflow-hidden">
            <div className="pitch-screen-1 absolute inset-0 pt-12 pb-3 px-4">
              <ScreenScan />
            </div>
            <div className="pitch-screen-2 absolute inset-0 pt-12 pb-3 px-4">
              <ScreenAgents />
            </div>
            <div className="pitch-screen-3 absolute inset-0 pt-12 pb-3 px-4">
              <ScreenAuction />
            </div>
            <div className="pitch-screen-4 absolute inset-0 pt-12 pb-3 px-4">
              <ScreenWallet />
            </div>
          </div>
        </div>
      </div>

      {/* Dots indicator below phone */}
      <div className="mt-6 flex justify-center items-center gap-2">
        <span
          aria-hidden="true"
          className="pitch-screen-dot-1 block w-2 h-2 rounded-full"
        />
        <span
          aria-hidden="true"
          className="pitch-screen-dot-2 block w-2 h-2 rounded-full"
        />
        <span
          aria-hidden="true"
          className="pitch-screen-dot-3 block w-2 h-2 rounded-full"
        />
        <span
          aria-hidden="true"
          className="pitch-screen-dot-4 block w-2 h-2 rounded-full"
        />
      </div>
    </div>
  );
}

/* ─── Phone screens ───────────────────────────────────────────────────────── */

function ScreenHeader({
  step,
  back = true,
  centered = false,
}: {
  step?: string;
  back?: boolean;
  centered?: boolean;
}) {
  return (
    <div
      className={`flex items-center ${centered ? "justify-center" : "justify-between"} mb-3`}
    >
      <div className="flex items-center gap-1.5">
        {back && (
          <span className="text-luma-700 text-base leading-none">‹</span>
        )}
        <span className="serif text-sm text-luma-700">Cobraya</span>
      </div>
      {step && !centered && (
        <span className="mono text-[9px] uppercase tracking-widest text-luma-450">
          {step}
        </span>
      )}
    </div>
  );
}

function ScreenScan() {
  return (
    <div className="h-full flex flex-col">
      <ScreenHeader step="Paso 1 de 4" />
      <div className="mono text-[10px] uppercase tracking-widest text-luma-450">
        Escanear factura
      </div>
      <div className="serif text-lg text-luma-700 leading-tight mt-0.5">
        Subí tu factura CFDI
      </div>

      {/* Viewfinder */}
      <div className="mt-3 relative flex-1 min-h-0 rounded-2xl bg-gradient-to-br from-luma-100 to-luma-200/60 border border-luma-200 overflow-hidden">
        {/* Corner brackets */}
        <CornerBracket position="tl" />
        <CornerBracket position="tr" />
        <CornerBracket position="bl" />
        <CornerBracket position="br" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-2">
          <div className="w-9 h-9 rounded-full bg-paper/90 flex items-center justify-center mb-2">
            <CheckIcon />
          </div>
          <div className="mono text-[10px] uppercase tracking-widest text-luma-700">
            CFDI detectado
          </div>
        </div>
      </div>

      {/* Detected card */}
      <div className="mt-2 rounded-xl border border-luma-200/70 bg-paper p-2.5">
        <div className="mono text-[9px] uppercase tracking-widest text-luma-450">
          Factura CFDI · Walmart México
        </div>
        <div className="serif text-base text-luma-700 mt-0.5">
          $48,500.00 MXN
        </div>
        <div className="mono text-[9px] text-luma-450 mt-0.5">
          Plazo: 60 días
        </div>
      </div>

      <button
        type="button"
        disabled
        className="mt-2 w-full min-h-[34px] rounded-full text-paper text-[11px] mono uppercase tracking-wider"
        style={{
          background:
            "linear-gradient(135deg, #4F0820 0%, #7A1232 100%)",
        }}
      >
        Continuar
      </button>
    </div>
  );
}

function ScreenAgents() {
  return (
    <div className="h-full flex flex-col">
      <ScreenHeader step="Paso 2 de 4" />
      <div className="mono text-[10px] uppercase tracking-widest text-luma-450">
        Validando
      </div>
      <div className="serif text-lg text-luma-700 leading-tight mt-0.5">
        4 agentes procesan tu factura
      </div>

      <ul className="mt-3 flex flex-col gap-1.5 flex-1 min-h-0">
        <AgentRow icon={<DocIcon size={12} />} label="CFDI Validator" pct={100} status="ok" />
        <AgentRow icon={<ShieldIcon size={12} />} label="Fraud Detector" pct={80} status="loading" />
        <AgentRow icon={<ChartIcon size={12} />} label="Credit Scorer" pct={35} status="loading" />
        <AgentRow icon={<HandshakeIcon size={12} />} label="Lender Matcher" pct={0} status="idle" />
      </ul>

      <div className="mt-2 mono text-[9px] text-luma-450 text-center">
        Procesando on-chain · 12s restantes
      </div>
    </div>
  );
}

function AgentRow({
  icon,
  label,
  pct,
  status,
}: {
  icon: React.ReactNode;
  label: string;
  pct: number;
  status: "ok" | "loading" | "idle";
}) {
  return (
    <li className="flex items-center gap-2 rounded-lg border border-luma-200/60 bg-paper p-1.5">
      <div className="w-6 h-6 rounded-md bg-luma-100 flex items-center justify-center text-luma-700">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="mono text-[10px] text-luma-700 truncate">{label}</div>
        <div className="mt-1 h-1 rounded-full bg-luma-100 overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${pct}%`,
              background: pct === 100 ? "#0F8B4A" : "#7A1232",
            }}
          />
        </div>
      </div>
      <span className="w-4 h-4 flex items-center justify-center shrink-0">
        {status === "ok" && <CheckIcon small />}
        {status === "loading" && <Spinner />}
        {status === "idle" && (
          <span className="block w-2 h-2 rounded-full bg-luma-200" />
        )}
      </span>
    </li>
  );
}

function ScreenAuction() {
  return (
    <div className="h-full flex flex-col">
      <ScreenHeader step="Paso 3 de 4" />
      <div className="mono text-[10px] uppercase tracking-widest text-luma-450">
        Subasta
      </div>
      <div className="serif text-lg text-luma-700 leading-tight mt-0.5">
        4 lenders compitiendo
      </div>

      <ul className="mt-3 flex flex-col gap-1.5 flex-1 min-h-0">
        <LenderRow letter="B" name="Bankaool" apr="21.5%" amount="$940" color="#5B7CFA" />
        <LenderRow letter="A" name="Arkangeles" apr="19.8%" amount="$952" color="#7A1232" best />
        <LenderRow letter="V" name="BBVA Pyme" apr="23.2%" amount="$931" color="#1B3970" />
        <LenderRow letter="K" name="Konfío" apr="20.4%" amount="$946" color="#0F8B4A" />
      </ul>

      <button
        type="button"
        disabled
        className="mt-2 w-full min-h-[34px] rounded-full text-paper text-[11px] mono uppercase tracking-wider"
        style={{
          background:
            "linear-gradient(135deg, #4F0820 0%, #7A1232 100%)",
        }}
      >
        Seleccionar Arkangeles
      </button>
    </div>
  );
}

function LenderRow({
  letter,
  name,
  apr,
  amount,
  color,
  best = false,
}: {
  letter: string;
  name: string;
  apr: string;
  amount: string;
  color: string;
  best?: boolean;
}) {
  return (
    <li
      className={`flex items-center gap-2 rounded-lg p-1.5 ${
        best
          ? "border-2 border-luma-600 bg-luma-100/60"
          : "border border-luma-200/60 bg-paper"
      }`}
    >
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-paper mono text-[11px] font-bold"
        style={{ background: color }}
        aria-hidden="true"
      >
        {letter}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className="mono text-[10px] text-luma-700 truncate">
            {name}
          </span>
          {best && (
            <span className="mono text-[8px] uppercase tracking-widest text-luma-600 shrink-0">
              ⭐ Mejor
            </span>
          )}
        </div>
        <div className="mono text-[9px] text-luma-450">{apr} APR</div>
      </div>
      <div className="mono text-[10px] text-luma-700 font-semibold shrink-0">
        {amount}
      </div>
    </li>
  );
}

function ScreenWallet() {
  return (
    <div className="h-full flex flex-col">
      <ScreenHeader centered back={false} />
      <div className="mono text-[10px] uppercase tracking-widest text-luma-450 text-center">
        ¡Recibiste!
      </div>

      <div
        className="mt-3 rounded-2xl p-4 text-luma-50"
        style={{
          background:
            "linear-gradient(135deg, #4F0820 0%, #7A1232 100%)",
        }}
      >
        <div className="mono text-[9px] uppercase tracking-widest text-luma-200/80">
          USDC en wallet
        </div>
        <div className="flex items-baseline gap-1 mt-0.5">
          <span className="serif text-3xl text-luma-50 leading-none">
            $940.00
          </span>
          <span className="mono text-[10px] text-luma-200/80">USDC</span>
        </div>
        <div className="mono text-[9px] text-luma-200/80 mt-1.5">
          Pagado en 28 segundos
        </div>
      </div>

      <ul className="mt-2 grid grid-cols-3 gap-1.5">
        <MiniCard label="Lender" value="Arkangeles" />
        <MiniCard label="Red" value="Fuji" />
        <MiniCard label="TX" value="0xa3f...c1d" external />
      </ul>

      <div className="mt-2 flex items-center gap-2 rounded-xl border border-luma-200/60 bg-paper p-2">
        <div className="w-7 h-7 rounded-md bg-luma-100 flex items-center justify-center text-luma-700">
          <DownloadIcon />
        </div>
        <div className="flex-1 min-w-0">
          <div className="mono text-[9px] uppercase tracking-widest text-luma-450">
            Audit trail
          </div>
          <div className="mono text-[10px] text-luma-700 truncate">
            Descargar JSON firmado
          </div>
        </div>
      </div>

      <button
        type="button"
        disabled
        className="mt-auto w-full min-h-[34px] rounded-full text-luma-700 text-[11px] mono uppercase tracking-wider border border-luma-300 bg-paper"
      >
        Ver historial
      </button>
    </div>
  );
}

function MiniCard({
  label,
  value,
  external = false,
}: {
  label: string;
  value: string;
  external?: boolean;
}) {
  return (
    <li className="rounded-lg border border-luma-200/60 bg-paper p-1.5 text-center">
      <div className="mono text-[8px] uppercase tracking-widest text-luma-450">
        {label}
      </div>
      <div className="mono text-[9px] text-luma-700 truncate mt-0.5">
        {value}
        {external && " ↗"}
      </div>
    </li>
  );
}

function CornerBracket({ position }: { position: "tl" | "tr" | "bl" | "br" }) {
  const base = "absolute w-5 h-5 border-luma-600";
  const variant =
    position === "tl"
      ? "top-2 left-2 border-t-2 border-l-2 rounded-tl-md"
      : position === "tr"
        ? "top-2 right-2 border-t-2 border-r-2 rounded-tr-md"
        : position === "bl"
          ? "bottom-2 left-2 border-b-2 border-l-2 rounded-bl-md"
          : "bottom-2 right-2 border-b-2 border-r-2 rounded-br-md";
  return <span aria-hidden="true" className={`${base} ${variant}`} />;
}

function CheckIcon({ small = false }: { small?: boolean }) {
  const size = small ? 10 : 16;
  return (
    <svg
      viewBox="0 0 20 20"
      width={size}
      height={size}
      aria-hidden="true"
      fill="none"
    >
      <circle cx="10" cy="10" r="9" fill="#0F8B4A" />
      <path
        d="M5.5 10.5l3 3 6-6.5"
        stroke="#FCF7F3"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Spinner() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="pitch-spinner w-3 h-3"
      aria-hidden="true"
      fill="none"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="#FFC1CA"
        strokeWidth="3"
        opacity="0.4"
      />
      <path
        d="M12 3a9 9 0 0 1 9 9"
        stroke="#7A1232"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function StatusSignal() {
  return (
    <svg viewBox="0 0 18 12" width="14" height="9" aria-hidden="true">
      <rect x="0" y="8" width="3" height="4" fill="#4F0820" rx="0.5" />
      <rect x="5" y="5" width="3" height="7" fill="#4F0820" rx="0.5" />
      <rect x="10" y="2" width="3" height="10" fill="#4F0820" rx="0.5" />
      <rect x="15" y="0" width="3" height="12" fill="#4F0820" rx="0.5" />
    </svg>
  );
}

function StatusWifi() {
  return (
    <svg viewBox="0 0 16 12" width="13" height="10" aria-hidden="true" fill="none">
      <path
        d="M2 5 Q8 0 14 5"
        stroke="#4F0820"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M4.5 7.5 Q8 4.5 11.5 7.5"
        stroke="#4F0820"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="8" cy="10" r="1" fill="#4F0820" />
    </svg>
  );
}

function StatusBattery() {
  return (
    <svg viewBox="0 0 26 12" width="22" height="10" aria-hidden="true">
      <rect
        x="0.5"
        y="0.5"
        width="22"
        height="11"
        rx="2.5"
        stroke="#4F0820"
        fill="none"
      />
      <rect x="24" y="3.5" width="1.5" height="5" rx="0.5" fill="#4F0820" />
      <rect x="2" y="2" width="19" height="8" rx="1.5" fill="#4F0820" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" fill="none">
      <path
        d="M8 2v8m0 0l-3-3m3 3l3-3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 13h10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ─── Section 2 — Timeline + Stat cards ───────────────────────────────────── */

function TimelineComparison() {
  return (
    <div className="mt-12 grid lg:grid-cols-2 gap-6">
      {/* Traditional */}
      <div className="rounded-3xl bg-luma-50 border border-luma-200/60 p-6 sm:p-8">
        <div className="flex items-baseline justify-between mb-4 gap-2 flex-wrap">
          <div className="mono text-[11px] uppercase tracking-widest text-luma-450">
            Factoraje tradicional
          </div>
          <div className="mono text-xs text-luma-700">60 DÍAS</div>
        </div>
        <div className="relative h-12 rounded-full bg-luma-200/70 overflow-hidden">
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, #7A1232 0 8px, transparent 8px 16px)",
            }}
          />
          <div className="absolute inset-0 flex items-center justify-between px-4">
            <span className="mono text-[10px] uppercase tracking-widest text-luma-700">
              Día 1
            </span>
            <span className="mono text-[10px] uppercase tracking-widest text-luma-700/60">
              Día 30
            </span>
            <span className="mono text-[10px] uppercase tracking-widest text-luma-700">
              Día 60
            </span>
          </div>
        </div>
        <p className="mt-4 text-sm text-luma-450 leading-relaxed">
          Papeleo, comités humanos, 4-8% mensual. La PyME espera, el comprador
          paga cuando quiere, el flujo de caja se rompe.
        </p>
      </div>

      {/* Cobraya */}
      <div
        className="rounded-3xl border border-luma-600 p-6 sm:p-8 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #FFE5E8 0%, #FFF7F2 50%, #FFE5E8 100%)",
        }}
      >
        <div className="flex items-baseline justify-between mb-4 gap-2 flex-wrap">
          <div className="mono text-[11px] uppercase tracking-widest text-luma-600">
            Cobraya
          </div>
          <div className="mono text-xs text-luma-700 font-semibold">
            30 SEGUNDOS
          </div>
        </div>
        <div className="relative h-12 rounded-full bg-paper border border-luma-200/60 overflow-hidden">
          <div
            className="absolute top-1/2 left-2 -translate-y-1/2 w-3 h-3 rounded-full"
            style={{
              background: "#7A1232",
              boxShadow: "0 0 0 4px rgba(122,18,50,0.18)",
            }}
            aria-hidden="true"
          />
          <div className="absolute inset-0 flex items-center px-6">
            <span className="mono text-[10px] uppercase tracking-widest text-luma-700">
              0s
            </span>
            <span className="mono text-[10px] uppercase tracking-widest text-luma-700 ml-auto">
              30s · USDC ✓
            </span>
          </div>
        </div>
        <p className="mt-4 text-sm text-luma-500 leading-relaxed">
          Sin papeleo, agentes IA, 2-3% APR. La PyME cobra. El smart contract
          libera USDC. La auditoría queda firmada.
        </p>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  big,
  label,
}: {
  icon: React.ReactNode;
  big: string;
  label: string;
}) {
  return (
    <div className="rounded-3xl border border-luma-200/60 bg-paper p-6 transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="w-10 h-10 rounded-xl bg-luma-100 flex items-center justify-center text-luma-700 mb-3">
        {icon}
      </div>
      <div className="serif text-3xl sm:text-4xl text-luma-700 leading-tight">
        {big}
      </div>
      <div className="text-sm text-luma-450 mt-2 leading-snug">{label}</div>
    </div>
  );
}

/* ─── Section 3 — Step card ───────────────────────────────────────────────── */

function StepCard({
  number,
  icon,
  title,
  desc,
  time,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  time: string;
}) {
  return (
    <div className="relative rounded-3xl border border-luma-200/60 bg-paper p-7 transition-all hover:scale-[1.01] hover:shadow-md min-h-[260px] flex flex-col">
      <span
        aria-hidden="true"
        className="mono text-5xl absolute top-4 right-5 text-luma-200/90 select-none"
      >
        {number}
      </span>
      <div className="w-12 h-12 rounded-2xl bg-luma-100 flex items-center justify-center text-luma-600 mb-4">
        {icon}
      </div>
      <h3 className="serif text-xl text-luma-700 leading-tight">{title}</h3>
      <p className="text-sm text-luma-450 mt-2 leading-relaxed flex-1">
        {desc}
      </p>
      <div className="mono text-[11px] uppercase tracking-widest text-luma-600 mt-4">
        {time}
      </div>
    </div>
  );
}

/* ─── Section 4 — Agent card ──────────────────────────────────────────────── */

function AgentCard({
  icon,
  name,
  cost,
  desc,
  verifies,
  json,
}: {
  icon: React.ReactNode;
  name: string;
  cost: string;
  desc: string;
  verifies: string;
  json: string;
}) {
  return (
    <li className="rounded-3xl border border-luma-200/60 bg-paper p-6 flex flex-col gap-4 transition-all hover:-translate-y-0.5 hover:shadow-md min-h-[460px]">
      <div className="flex items-start justify-between gap-3">
        <div className="w-14 h-14 rounded-2xl bg-luma-100 flex items-center justify-center text-luma-600">
          {icon}
        </div>
        <span className="mono text-[10px] px-2.5 py-1 rounded-full bg-luma-50 border border-luma-200 text-luma-700 shrink-0">
          {cost}
        </span>
      </div>
      <div>
        <div className="font-semibold text-luma-700 text-lg leading-tight">
          {name}
        </div>
        <p className="text-sm text-luma-450 mt-2 leading-relaxed">{desc}</p>
      </div>
      <div>
        <div className="mono text-[10px] uppercase tracking-widest text-luma-600 mb-1">
          Verifica
        </div>
        <p className="text-xs text-luma-500 leading-snug">{verifies}</p>
      </div>
      <pre className="mono text-[10px] leading-snug bg-luma-50 rounded-lg p-3 text-luma-700 overflow-hidden border border-luma-200/40">
        {json}
      </pre>
      <a
        href="#"
        className="mono text-[11px] text-luma-600 mt-auto hover:text-luma-700"
      >
        Ver agente ↗
      </a>
    </li>
  );
}

/* ─── Section 5 — Comparison table ────────────────────────────────────────── */

function ComparisonTable() {
  const rows: Array<[string, string, string]> = [
    ["Tiempo", "7-30 días", "30 segundos"],
    ["Papeleo", "Físico + KYC", "Cero"],
    ["Quién decide", "Comité humano", "4 agentes IA + smart contract"],
    ["Costo total", "4-8% mensual", "2-3% APR"],
    ["Transparencia", "Opaca", "On-chain Avalanche"],
    ["Disponibilidad", "Lun-Vie 9-17h", "24/7/365"],
  ];

  return (
    <div className="rounded-3xl bg-paper border border-luma-200/60 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-3 bg-luma-100 mono text-[10px] sm:text-xs uppercase tracking-widest text-luma-700 font-semibold">
        <div className="px-4 sm:px-6 py-4 border-r border-luma-200/60"></div>
        <div className="px-4 sm:px-6 py-4 border-r border-luma-200/60">
          Factoring tradicional
        </div>
        <div className="px-4 sm:px-6 py-4">Cobraya</div>
      </div>
      {/* Rows */}
      {rows.map(([label, trad, cobraya], i) => (
        <div
          key={label}
          className={`grid grid-cols-3 text-sm ${i % 2 === 0 ? "bg-paper" : "bg-luma-50/40"}`}
        >
          <div className="px-4 sm:px-6 py-4 sm:py-5 border-r border-luma-200/40 mono text-[11px] uppercase tracking-widest text-luma-450 flex items-center">
            {label}
          </div>
          <div className="px-4 sm:px-6 py-4 sm:py-5 border-r border-luma-200/40 flex items-center gap-2 text-luma-450">
            <CrossIcon /> <span>{trad}</span>
          </div>
          <div className="px-4 sm:px-6 py-4 sm:py-5 flex items-center gap-2 text-luma-700 font-semibold">
            <CheckSmall /> <span>{cobraya}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function CheckSmall() {
  return (
    <svg
      viewBox="0 0 20 20"
      width="16"
      height="16"
      aria-hidden="true"
      fill="none"
      className="shrink-0"
    >
      <circle cx="10" cy="10" r="9" fill="#0F8B4A" />
      <path
        d="M5.5 10.5l3 3 6-6.5"
        stroke="#FCF7F3"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      width="14"
      height="14"
      aria-hidden="true"
      fill="none"
      className="shrink-0"
    >
      <circle cx="10" cy="10" r="9" stroke="#E89AAA" strokeWidth="1.5" />
      <path
        d="M7 7l6 6M13 7l-6 6"
        stroke="#E89AAA"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ─── Section 6 — Stack card ──────────────────────────────────────────────── */

function StackCard({
  icon,
  name,
  sub,
  tone = "primary",
}: {
  icon: React.ReactNode;
  name: string;
  sub: string;
  tone?: "primary" | "alt";
}) {
  return (
    <div
      className={`rounded-2xl border border-luma-200/60 p-6 transition-all hover:-translate-y-0.5 hover:shadow-md ${
        tone === "alt" ? "bg-luma-50" : "bg-paper"
      }`}
    >
      <div className="w-10 h-10 rounded-xl bg-luma-100 flex items-center justify-center text-luma-700 mb-3">
        {icon}
      </div>
      <div className="font-semibold text-luma-700">{name}</div>
      <div className="mono text-[11px] text-luma-450 mt-1 leading-snug">
        {sub}
      </div>
    </div>
  );
}

/* ─── Section 7 — Proof badge + pill ──────────────────────────────────────── */

function ProofBadge({
  title,
  subtitle,
  href,
  external = false,
  arrow = "↗",
  cta,
  children,
}: {
  title: string;
  subtitle: string;
  href: string;
  external?: boolean;
  arrow?: string;
  cta: string;
  children?: React.ReactNode;
}) {
  const isExternal = external || /^https?:\/\//.test(href);
  const linkProps = isExternal
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};
  return (
    <a
      href={href}
      {...linkProps}
      className="group flex flex-col gap-3 rounded-3xl border border-luma-200/80 bg-paper p-7 transition-all hover:border-luma-600 hover:shadow-lg"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold text-luma-700 text-lg leading-tight">
            {title}
          </div>
          <div className="mono text-[11px] text-luma-450 mt-1">{subtitle}</div>
        </div>
        <span
          aria-hidden="true"
          className="serif text-2xl text-luma-450 group-hover:text-luma-600 transition-colors shrink-0"
        >
          {arrow}
        </span>
      </div>
      {children && <div className="flex-1">{children}</div>}
      <div className="mono text-[11px] text-luma-600 group-hover:text-luma-700 transition-colors mt-auto">
        {cta} {arrow}
      </div>
    </a>
  );
}

function Pill({
  children,
  highlight = false,
}: {
  children: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <span
      className={`mono text-[10px] px-2 py-1 rounded-full ${
        highlight
          ? "bg-luma-600 text-paper border border-luma-600"
          : "bg-luma-50 text-luma-700 border border-luma-200/60"
      }`}
    >
      {children}
    </span>
  );
}

/* ─── Section 8 — Footer 3 cols ───────────────────────────────────────────── */

function Footer3Col({ snowtraceUrl }: { snowtraceUrl: string }) {
  return (
    <div className="mt-20 pt-12 border-t border-luma-200/20 grid grid-cols-1 sm:grid-cols-3 gap-10 text-left">
      <div>
        <div className="mono text-[11px] uppercase tracking-widest text-luma-200/70 mb-4">
          Producto
        </div>
        <ul className="space-y-2 text-sm text-luma-50/90">
          <li>
            <Link href="/demo" className="hover:text-luma-50">
              Demo en vivo
            </Link>
          </li>
          <li>
            <Link href="/pitch" className="hover:text-luma-50">
              Pitch
            </Link>
          </li>
          <li>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-luma-50"
            >
              GitHub ↗
            </a>
          </li>
          <li>
            <a
              href={A2A_GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-luma-50"
            >
              A2A marketplace ↗
            </a>
          </li>
        </ul>
      </div>

      <div>
        <div className="mono text-[11px] uppercase tracking-widest text-luma-200/70 mb-4">
          Stack
        </div>
        <ul className="space-y-2 text-sm text-luma-50/90">
          <li>Avalanche Fuji</li>
          <li>USDC</li>
          <li>Anthropic Claude</li>
          <li>Foundry + OpenZeppelin</li>
        </ul>
      </div>

      <div>
        <div className="mono text-[11px] uppercase tracking-widest text-luma-200/70 mb-4">
          Hackathon
        </div>
        <ul className="space-y-2 text-sm text-luma-50/90">
          <li>Avalanche LATAM Fintech Build 2026</li>
          <li>
            <a
              href={snowtraceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-luma-50"
            >
              Snowtrace contract ↗
            </a>
          </li>
          <li>
            <a href={AUDIT_EXAMPLE_URL} className="hover:text-luma-50">
              Audit trail example
            </a>
          </li>
          <li>
            <a href="#video" className="hover:text-luma-50">
              Video pitch
            </a>
          </li>
        </ul>
      </div>

      <div className="sm:col-span-3 pt-10 mt-2 border-t border-luma-200/15 flex flex-col sm:flex-row items-center sm:justify-between gap-4 text-center">
        <div className="flex items-center gap-3 text-luma-50">
          <BrandIcon className="w-8 h-8" />
          <span className="serif text-2xl">Cobraya</span>
        </div>
        <div className="mono text-[10px] uppercase tracking-widest text-luma-200/70">
          Tu factura, líquida en 30 segundos.
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Inline icons — currentColor, geometric, no emoji.
 * Most accept an optional `size` prop for phone-screen variants.
 * ──────────────────────────────────────────────────────────────────────────── */

type IconProps = { size?: number };

function DocIcon({ size = 24 }: IconProps = {}) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" aria-hidden="true">
      <path
        d="M6 3h8l4 4v14H6z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M14 3v4h4" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M9 13h6M9 17h6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ShieldIcon({ size = 24 }: IconProps = {}) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" aria-hidden="true">
      <path
        d="M12 3l8 3v6c0 4.5-3.2 8.3-8 9-4.8-.7-8-4.5-8-9V6l8-3z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M9 12l2 2 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChartIcon({ size = 24 }: IconProps = {}) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" aria-hidden="true">
      <path d="M4 20h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="6" y="11" width="3" height="7" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11" y="7" width="3" height="11" stroke="currentColor" strokeWidth="1.5" />
      <rect x="16" y="4" width="3" height="14" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function HandshakeIcon({ size = 24 }: IconProps = {}) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" aria-hidden="true">
      <path
        d="M3 13l4-4 3 2 4-4 7 6-3 3-4-3-3 3-3-2-2 2z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" aria-hidden="true">
      <rect x="3" y="7" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 7l1.5-3h3L15 7" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="12" cy="13.5" r="3.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function CpuIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" aria-hidden="true">
      <rect x="6" y="6" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="9.5" y="9.5" width="5" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M9 3v3M12 3v3M15 3v3M9 18v3M12 18v3M15 18v3M3 9h3M3 12h3M3 15h3M18 9h3M18 12h3M18 15h3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" aria-hidden="true">
      <rect x="3" y="6" width="18" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 10h18" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="17" cy="14.5" r="1.25" fill="currentColor" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 7v5l3 2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrendingDownIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" aria-hidden="true">
      <path
        d="M4 8l5 5 4-4 7 7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M20 16v4h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function InvoiceIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" aria-hidden="true">
      <path
        d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M9 8h6M9 12h6M9 16h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/* ─── Tech / Stack icons (simple, geometric) ──────────────────────────────── */

function AvalancheIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="#E84142" />
      <path d="M12 6l3 5h-2l-1 2-3-5h2z" fill="#fff" />
      <path d="M9 14h4l-2 3z" fill="#fff" />
    </svg>
  );
}

function UsdcIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="#2775CA" />
      <text
        x="50%"
        y="55%"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="'Inter', sans-serif"
        fontSize="9"
        fontWeight="700"
        fill="#fff"
      >
        $
      </text>
    </svg>
  );
}

function ForgeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" aria-hidden="true">
      <path
        d="M4 16l8-12 8 12-8 4z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M12 4v16" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function ClaudeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="#CC9B7A" />
      <path
        d="M8 16l2-8h1.5l2 8H12l-.4-1.8h-1.7L9.5 16H8zm2.2-3h1.1L11 9.6z"
        fill="#fff"
      />
    </svg>
  );
}

function NextJsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="#0A0A0A" />
      <path
        d="M8.5 7v10M15.5 17V7l-7 10"
        stroke="#fff"
        strokeWidth="1.4"
        fill="none"
      />
    </svg>
  );
}

function SupabaseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" aria-hidden="true" fill="none">
      <path d="M13 3v9h6l-9 9V12H4l9-9z" fill="#3ECF8E" />
    </svg>
  );
}

function A2AIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" aria-hidden="true">
      <circle cx="7" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="17" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M10.5 12h3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
