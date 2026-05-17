// src/app/(marketing)/pitch/page.tsx — Cobraya pitch landing v3 (2026-05-16)
//
// Server component. Renders the full pitch landing matching the standalone
// HTML design at /doc/_design-source-cobraya-pitch.html. Only interactive
// pieces (theme toggle, phone-screen cycle, scroll reveals) are extracted
// into client components in this directory.
//
// Theme scoping: the wine+gold palette lives inside .pitch-root via
// pitch.css. ThemeToggle flips [data-pitch-theme] on that wrapper so the
// rest of the app (luma palette) is unaffected.
//
// Snowtrace addr is read from env (COBRAYA_COMMITMENTS_ADDRESS), with the
// public Fuji fallback so the badges always render a live link.
//
// Copy + class names + attribute order intentionally mirror the design
// source 1:1 — the literal HTML is the contract.

import "./pitch.css";
import { PhoneCycle } from "./PhoneCycle";
import { ThemeToggle } from "./ThemeToggle";
import { ScrollReveal } from "./ScrollReveal";
import {
  LogoCobraya,
  LogoAvalanche,
  LogoUSDC,
  LogoFoundry,
  LogoAnthropic,
  LogoA2A,
  LogoFacilitator,
  LogoNextjs,
  LogoSupabase,
  LogoCNBV,
} from "./logos";

const FUJI_COMMITMENTS_FALLBACK = "0x5F8F8a31e51d8B2FEe0E0C2f1AffC3B4c6B12506";

function getCommitmentsAddress(): string {
  return process.env.COBRAYA_COMMITMENTS_ADDRESS || FUJI_COMMITMENTS_FALLBACK;
}

function getCommitmentsUrl(): string {
  return `https://testnet.snowtrace.io/address/${getCommitmentsAddress()}`;
}

// External targets from the design source.
const DEMO_URL = "/demo";
const COBRAYA_REPO = "https://github.com/ferrosasfp/wasiai-cobraya";
const A2A_REPO = "https://github.com/ferrosasfp/wasiai-a2a";
// TODO(audit): wire to /public/audit-example.json once a stable signed sample
// is exposed. The design source uses this anchor as a placeholder too.
const AUDIT_EXAMPLE_URL = "/audit-example.json";
const VIDEO_URL = "https://www.youtube.com/watch?v=UcliO0pN-qs";

export default function PitchPage() {
  const snowtraceUrl = getCommitmentsUrl();

  return (
    <div className="pitch-root" data-pitch-theme="dark">
      {/* ─────────── NAV ─────────── */}
      <header className="nav">
        <div className="wrap nav-row">
          <a href="#" className="brand">
            <span className="brand-mark" aria-hidden="true">
              <LogoCobraya size={18} />
            </span>
            <span>Cobraya</span>
            <span className="sep">·</span>
            <span className="sub">Hackathon: LatAm Institucional</span>
          </a>
          <nav className="nav-links">
            <a href="#problema">Problema</a>
            <a href="#flujo">Flujo</a>
            <a href="#agentes">Agentes</a>
            <a href="#comparativa">vs. tradicional</a>
            <a href="#prueba">Prueba</a>
          </nav>
          <div className="nav-cta">
            <span className="live-pill">Live · Fuji</span>
            <ThemeToggle />
            <a
              className="btn btn-wine"
              href={DEMO_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Ver demo →
            </a>
          </div>
        </div>
      </header>

      {/* ─────────── HERO ─────────── */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="wrap hero-grid">
          <div>
            <div className="hero-meta" data-rev>
              <span className="dot" />
              Hackathon: LatAm Institucional
              <span className="x">·</span>
              <span style={{ color: "var(--fg-2)" }}>
                Factoraje agéntico · MX
              </span>
            </div>
            <h1 className="h1" data-rev data-d="1">
              Tu factura,
              <br />
              <span className="it">líquida en</span>
              <br />
              <span className="nb">30 segundos.</span>
            </h1>
            <p
              className="lede"
              data-rev
              data-d="2"
              style={{ marginTop: 32 }}
            >
              Factoraje agéntico para PyMEs mexicanas.{" "}
              <strong style={{ color: "var(--fg)", fontWeight: 500 }}>
                4 agentes de IA
              </strong>{" "}
              + smart contract en Avalanche. Sin papeleo. Sin comités. Sin
              esperar 60 días.
            </p>
            <div className="ctas" data-rev data-d="3">
              <a
                className="btn btn-wine btn-lg"
                href={DEMO_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                ▶ Ver demo en vivo
              </a>
              <a
                className="btn btn-ghost btn-lg"
                href={snowtraceUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Contrato en Snowtrace ↗
              </a>
            </div>
            <div className="hero-quick" data-rev data-d="4">
              <div className="qi gold">
                <span className="v">$24B</span>
                <span className="l">TAM MX</span>
              </div>
              <div className="qi green">
                <span className="v">Fuji ✓</span>
                <span className="l">deployed</span>
              </div>
              <div className="qi">
                <span className="v">CNBV</span>
                <span className="l">Sandbox CNBV</span>
              </div>
              <div className="qi">
                <span className="v">940+</span>
                <span className="l">tests</span>
              </div>
            </div>
          </div>

          {/* PHONE MOCKUP — client component cycles through 4 screens every 3.2s */}
          <PhoneCycle />
        </div>
      </section>

      {/* ─────────── PROBLEM (Lupita) ─────────── */}
      <section className="sec" id="problema">
        <div className="wrap">
          <div className="sec-head">
            <div className="kicker" data-rev>
              El problema
            </div>
            <h2 className="h2" data-rev data-d="1">
              Lupita vende.
              <br />
              Walmart paga… <span className="it">en 60 días.</span>
            </h2>
            <p className="lede" data-rev data-d="2">
              La PyME mexicana factura, entrega, y se queda sin liquidez
              esperando que un comité humano firme un papel.{" "}
              <strong style={{ color: "var(--fg)", fontWeight: 500 }}>
                la mayoría de las PyMEs que cierran lo hace por problemas
                de liquidez
              </strong>
              .
            </p>
          </div>

          <div className="problem-grid">
            <div className="pcard old" data-rev>
              <div className="label">Factoraje tradicional</div>
              <h3>60 días</h3>
              <div className="strip">
                <span>Día 1</span>
                <span>Día 30</span>
                <span>Día 60</span>
              </div>
              <p>
                Papeleo, comités humanos, 4–8% mensual. La PyME espera, el
                comprador paga cuando quiere, el flujo de caja se rompe.
              </p>
            </div>
            <div className="pcard new" data-rev data-d="1">
              <div className="label">Cobraya</div>
              <h3>30 segundos</h3>
              <div className="strip">
                <span>0s</span>
                <span>10s</span>
                <span>30s · USDC ✓</span>
              </div>
              <p>
                Sin papeleo, agentes IA, 2–3% APR. La PyME cobra. El smart
                contract libera USDC. La auditoría queda firmada.
              </p>
            </div>
          </div>

          <div className="problem-stats" data-rev data-d="2">
            <div className="ps-cell">
              <div className="v">
                $48,500 <span className="it">MXN</span>
              </div>
              <div className="l">factura típica PyME</div>
            </div>
            <div className="ps-cell">
              <div className="v">
                60d <span className="it">→ 30s</span>
              </div>
              <div className="l">reducción de tiempo</div>
            </div>
            <div className="ps-cell">
              <div className="v">Mayoría</div>
              <div className="l">PyMEs cierran por falta de liquidez</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────── HOW IT WORKS — pipeline ─────────── */}
      <section className="sec" id="flujo">
        <div className="wrap">
          <div className="sec-head">
            <div className="kicker" data-rev>
              Cómo funciona
            </div>
            <h2 className="h2" data-rev data-d="1">
              En <span className="it">4 pasos.</span>
              <br />
              Lupita los hace desde el celular.
            </h2>
            <p className="lede" data-rev data-d="2">
              Los agentes lo hacen on-chain. Cada paso queda firmado con
              EIP-712 y verificable en Snowtrace.
            </p>
          </div>

          <div className="pipe" data-rev data-d="3">
            <div className="pipe-head">
              <div className="pipe-title">
                <span className="dot" />
                Cobraya Pipeline · LatAm Institucional
              </div>
              <div className="pipe-chips">
                <span className="hot">CFDI 4.0</span>
                <span>USDC</span>
                <span>Avalanche Fuji</span>
                <span>EIP-3009</span>
              </div>
            </div>
            <div className="pipe-body">
              <div className="phase">
                <div className="ph-num">01 · Subir</div>
                <div className="ph-time">~3 s</div>
                <div className="ph-name">Subí tu factura CFDI</div>
                <div className="ph-desc">
                  Foto del XML del SAT desde el celular. Sin uploads pesados.
                  PWA installable, mobile-first.
                </div>
              </div>
              <div className="phase">
                <div className="ph-num">02 · Procesar</div>
                <div className="ph-time">~15 s</div>
                <div className="ph-name">4 agentes la procesan</div>
                <div className="ph-desc">
                  Validan SAT, detectan doble-cesión, calculan score, lanzan
                  subasta. Cada uno paga con USDC vía x402.
                </div>
              </div>
              <div className="phase">
                <div className="ph-num">03 · Subastar</div>
                <div className="ph-time">~7 s</div>
                <div className="ph-name">4 lenders compiten</div>
                <div className="ph-desc">
                  Bankaool · Arkangeles · BBVA · Konfío. Subasta transparente,
                  firmas EIP-712. Gana la mejor oferta.
                </div>
              </div>
              <div className="phase">
                <div className="ph-num">04 · Recibir</div>
                <div className="ph-time">~5 s</div>
                <div className="ph-name">USDC en wallet</div>
                <div className="ph-desc">
                  Settlement EIP-3009 directo a la wallet del SME. Audit
                  trail firmado. Sin gas, sin fricción.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────── AGENTS ─────────── */}
      <section className="sec" id="agentes">
        <div className="wrap">
          <div className="sec-head">
            <div className="kicker" data-rev>
              Los 4 agentes
            </div>
            <h2 className="h2" data-rev data-d="1">
              4 agentes. 4 precios en USDC.
              <br />
              <span className="it">4 evidencias on-chain.</span>
            </h2>
            <p className="lede" data-rev data-d="2">
              Cada uno cuesta lo que vale. Cada uno deja huella verificable
              en Avalanche Fuji.
            </p>
          </div>

          <div className="agents-grid">
            <article className="acard" data-rev>
              <div className="acard-top">
                <span className="price">$0.001 USDC · por llamada</span>
                <span className="idx">01</span>
              </div>
              <h3>Valida la factura</h3>
              <div className="slug mono">agentshop-cfdi-validator</div>
              <p>
                Confirma que la factura existe en el SAT y que los datos son
                auténticos. Sin este chequeo, cualquiera podría factorar una
                factura falsa o ya cancelada.
              </p>
              <div className="verif">
                <b>Te garantiza:</b> que el SAT validó la factura — emisor,
                receptor, monto y plazo son reales y vigentes.
              </div>
              <pre>
                {"✓ Firma del SAT verificada\n"}
                {"✓ Emisor y receptor confirmados (RFC)\n"}
                {"✓ Monto $48,500 MXN registrado"}
              </pre>
            </article>

            <article className="acard" data-rev data-d="1">
              <div className="acard-top">
                <span className="price">$0.005 USDC · por llamada</span>
                <span className="idx">02</span>
              </div>
              <h3>Previene el fraude</h3>
              <div className="slug mono">agentshop-fraud-detector</div>
              <p>
                Verifica en Avalanche que esta factura no haya sido vendida
                antes a otro lender. Resuelve el problema #1 del factoring
                mexicano: la doble cesión.
              </p>
              <div className="verif">
                <b>Te garantiza:</b> que es imposible que la misma factura se
                cobre dos veces — el smart contract lo previene por arquitectura.
              </div>
              <pre>
                {"✓ Hash de la factura buscado on-chain\n"}
                {"✓ Confirmado: nunca vendida antes\n"}
                {"✓ Registrada para futuras verificaciones"}
              </pre>
            </article>

            <article className="acard" data-rev data-d="2">
              <div className="acard-top">
                <span className="price">$0.05 USDC · por llamada</span>
                <span className="idx">03</span>
              </div>
              <h3>Calcula tu calificación crediticia</h3>
              <div className="slug mono">agentshop-credit-scorer</div>
              <p>
                Asigna una calificación de 0 a 100 (con 4 bandas: A, B, C, D)
                según comprador, monto, plazo y sector. La explicación la
                genera IA y la decisión queda registrada en el comprobante.
              </p>
              <div className="verif">
                <b>Te garantiza:</b> que el score es reproducible y la
                explicación queda guardada — descargable como JSON firmado
                EIP-712 al final del flujo.
              </div>
              <pre>
                {"✓ Score 80 / Banda A\n"}
                {"✓ Explicación generada por IA\n"}
                {"✓ Incluido en el comprobante descargable"}
              </pre>
            </article>

            <article className="acard" data-rev data-d="3">
              <div className="acard-top">
                <span className="price">$0.01 USDC · por llamada</span>
                <span className="idx">04</span>
              </div>
              <h3>Encuentra el mejor lender</h3>
              <div className="slug mono">agentshop-lender-matcher</div>
              <p>
                Lanza una subasta entre 4 lenders. Cada uno responde con su
                mejor oferta en tiempo real. Gana la que más USDC le deja a
                la PyME — no la que más comisión le da a Cobraya.
              </p>
              <div className="verif">
                <b>Te garantiza:</b> transparencia total — la PyME ve las
                4 ofertas firmadas y elige la mejor.
              </div>
              <pre>
                {"✓ 4 ofertas firmadas recibidas\n"}
                {"✓ Ganador: Arkangeles · 12% APR · 95% adelanto\n"}
                {"✓ USDC neto liquidado a la PyME"}
              </pre>
            </article>
          </div>
        </div>
      </section>

      {/* ─────────── COMPARISON ─────────── */}
      <section className="sec" id="comparativa">
        <div className="wrap">
          <div className="sec-head">
            <div className="kicker" data-rev>
              Lo viejo vs lo nuevo
            </div>
            <h2 className="h2" data-rev data-d="1">
              Lo viejo, <span className="it">ya cumplió.</span>
            </h2>
          </div>

          <div className="vs" data-rev data-d="2">
            <div className="vs-row head">
              <div className="label">Atributo</div>
              <div className="col-o">Factoraje tradicional</div>
              <div className="col-w">Cobraya</div>
            </div>
            <div className="vs-row">
              <div className="label">Tiempo</div>
              <div className="col-o v bad">7–30 días</div>
              <div className="col-w v good">30 segundos</div>
            </div>
            <div className="vs-row">
              <div className="label">Papeleo</div>
              <div className="col-o v bad">Físico + KYC</div>
              <div className="col-w v good">Cero</div>
            </div>
            <div className="vs-row">
              <div className="label">Quién decide</div>
              <div className="col-o v bad">Comité humano</div>
              <div className="col-w v good">4 agentes IA + smart contract</div>
            </div>
            <div className="vs-row">
              <div className="label">Costo total</div>
              <div className="col-o v bad">4–8% mensual</div>
              <div className="col-w v good">2–3% APR</div>
            </div>
            <div className="vs-row">
              <div className="label">Transparencia</div>
              <div className="col-o v bad">Opaca</div>
              <div className="col-w v good">On-chain Avalanche</div>
            </div>
            <div className="vs-row">
              <div className="label">Disponibilidad</div>
              <div className="col-o v bad">Lun–Vie 9–17h</div>
              <div className="col-w v good">24 / 7 / 365</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────── STACK ─────────── */}
      <section className="sec">
        <div className="wrap">
          <div className="sec-head">
            <div className="kicker" data-rev>
              El stack
            </div>
            <h2 className="h2" data-rev data-d="1">
              Producción, <span className="it">no hackathon.</span>
            </h2>
            <p className="lede" data-rev data-d="2">
              Cobraya corre sobre infraestructura agéntica probada. No
              reinventamos: integramos.
            </p>
          </div>

          <div className="stack-grid">
            <div className="scard" data-rev>
              <div className="ico">
                <LogoAvalanche size={22} />
              </div>
              <div className="nm">Avalanche Fuji</div>
              <div className="desc">
                Smart contract verificado · ChainID 43113 · gas &lt; 80K
              </div>
            </div>
            <div className="scard" data-rev data-d="1">
              <div className="ico">
                <LogoUSDC size={22} />
              </div>
              <div className="nm">USDC + EIP-3009</div>
              <div className="desc">
                Settlement gasless. La PyME no necesita nativos.
              </div>
            </div>
            <div className="scard" data-rev data-d="2">
              <div className="ico">
                <LogoFoundry size={22} />
              </div>
              <div className="nm">Foundry + OpenZeppelin</div>
              <div className="desc">
                Ownable2Step, gas optimized, 100% coverage.
              </div>
            </div>
            <div className="scard" data-rev data-d="1">
              <div className="ico">
                <LogoAnthropic size={22} />
              </div>
              <div className="nm">Anthropic Claude</div>
              <div className="desc">
                Rationale IA firmado, provenance trackeado.
              </div>
            </div>
            <div className="scard" data-rev data-d="2">
              <div className="ico">
                <LogoA2A size={22} />
              </div>
              <div className="nm">wasiai-a2a</div>
              <div className="desc">
                Gateway agéntico · descubre, compone, ejecuta pipeline y paga
                a los agentes · 940+ tests · Railway prod.
              </div>
            </div>
            <div className="scard" data-rev data-d="3">
              <div className="ico">
                <LogoFacilitator size={22} />
              </div>
              <div className="nm">wasiai-facilitator</div>
              <div className="desc">
                Settlement service multi-chain · Railway prod.
              </div>
            </div>
            <div className="scard" data-rev data-d="2">
              <div className="ico">
                <LogoNextjs size={22} />
              </div>
              <div className="nm">Next.js 14 PWA</div>
              <div className="desc">
                Mobile-first, installable, offline-ready.
              </div>
            </div>
            <div className="scard" data-rev data-d="3">
              <div className="ico">
                <LogoSupabase size={22} />
              </div>
              <div className="nm">Supabase</div>
              <div className="desc">
                Postgres con RLS app-layer, snapshots firmados.
              </div>
            </div>
            <div className="scard" data-rev data-d="4">
              <div className="ico">
                <LogoCNBV size={22} />
              </div>
              <div className="nm">CNBV ready</div>
              <div className="desc">
                sandbox CNBV (Ley Fintech 2018, Art. 80) · audit trail listo para regulador.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────── PROOF ─────────── */}
      <section className="sec" id="prueba">
        <div className="wrap">
          <div className="sec-head">
            <div className="kicker" data-rev>
              La prueba
            </div>
            <h2 className="h2" data-rev data-d="1">
              Verificalo <span className="it">vos mismo.</span>
            </h2>
            <p className="lede" data-rev data-d="2">
              4 evidencias. 4 links. 0 promesas.
            </p>
          </div>

          <div className="proof-grid">
            <a
              className="proof-card"
              href={snowtraceUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-rev
            >
              <div className="label">Smart contract verificado</div>
              <h3>CobrayaInvoiceCommitments.sol</h3>
              <div className="meta">
                0x5F8F…2506 · Avalanche Fuji · ChainID 43113
              </div>
              <div className="body">
                Foundry + OpenZeppelin. Gas usado &lt; 80K por commit.
                Ownable2Step, fully audited.
              </div>
              <div className="strip">
                <span>Ownable2Step</span>
                <span>OpenZeppelin</span>
                <span className="star">gas &lt; 80K</span>
              </div>
              <div className="arr">Ver en Snowtrace ↗</div>
            </a>
            <a
              className="proof-card"
              href={AUDIT_EXAMPLE_URL}
              data-rev
              data-d="1"
            >
              <div className="label">Audit trail firmado EIP-712</div>
              <h3>Sandbox CNBV · Ley Fintech 2018</h3>
              <div className="meta">JSON canónico · ed25519 + EIP-712</div>
              <div className="body">
                Cada agente firma su receipt. La PyME descarga el JSON. El
                regulador puede replicar la verificación off-chain.
              </div>
              <div className="strip">
                <span>EIP-712</span>
                <span>provenance</span>
                <span className="star">CNBV ready</span>
              </div>
              <div className="arr">Ver ejemplo JSON ↓</div>
            </a>
            <a
              className="proof-card"
              href={DEMO_URL}
              target="_blank"
              rel="noopener noreferrer"
              data-rev
              data-d="2"
            >
              <div className="label">4 lenders compitiendo en vivo</div>
              <h3>Subasta transparente</h3>
              <div className="meta">
                Bankaool · Arkangeles · BBVA · Konfío
              </div>
              <div className="body">
                Cuatro ofertas firmadas, comparables en pantalla. Gana la
                mejor para el SME, no para Cobraya.
              </div>
              <div className="strip">
                <span>14.5%</span>
                <span className="star">12.0% ⭐</span>
                <span>13.2%</span>
                <span>13.5%</span>
              </div>
              <div className="arr">Ver subasta ↗</div>
            </a>
            <a
              className="proof-card"
              href={A2A_REPO}
              target="_blank"
              rel="noopener noreferrer"
              data-rev
              data-d="3"
            >
              <div className="label">940+ tests en producción</div>
              <h3>wasiai-a2a + wasiai-facilitator</h3>
              <div className="meta">github.com/ferrosasfp/wasiai-a2a</div>
              <div className="body">
                No es código de hackathon. Es la misma infra agéntica que
                corre WasiAI A2A en Railway prod desde 2026.
              </div>
              <div className="strip">
                <span>181 Cobraya</span>
                <span>940+ A2A</span>
                <span className="star">Railway prod</span>
              </div>
              <div className="arr">Ver código ↗</div>
            </a>
          </div>
        </div>
      </section>

      {/* ─────────── ROADMAP ─────────── */}
      <section className="sec" id="roadmap">
        <div className="wrap">
          <div className="sec-head">
            <div className="kicker" data-rev>
              Lo que viene
            </div>
            <h2 className="h2" data-rev data-d="1">
              De factoring agéntico a infraestructura financiera.
            </h2>
            <p className="lede" data-rev data-d="2">
              Cobraya hoy es MVP en testnet. La V1 productiva apunta a algo
              más grande: ser el rail de tokenización de cuentas por cobrar
              en Latinoamérica.
            </p>
          </div>

          <div className="agents-grid">
            <article className="acard" data-rev>
              <div className="acard-top">
                <span
                  className="idx"
                  aria-hidden="true"
                  style={{ color: "var(--gold)", fontSize: 18, letterSpacing: 0 }}
                >
                  ◆
                </span>
              </div>
              <h3>CFDI tokenizado</h3>
              <div className="slug mono">ERC-721 en Avalanche</div>
              <p>
                Cada factura es un NFT con lifecycle on-chain — emitida,
                cedida, cobrada, settled. Reemplaza el registro centralizado
                de cesiones que hoy es lento, opaco y propenso a fraude.
              </p>
            </article>

            <article className="acard" data-rev data-d="1">
              <div className="acard-top">
                <span
                  className="idx"
                  aria-hidden="true"
                  style={{ color: "var(--gold)", fontSize: 18, letterSpacing: 0 }}
                >
                  ◆
                </span>
              </div>
              <h3>Off-ramp MXN</h3>
              <div className="slug mono">Integración Bitso · Volabit · SPEI</div>
              <p>
                La PyME recibe pesos mexicanos en su cuenta bancaria. La capa
                USDC + Avalanche queda invisible. UX 100% bancaria, audit
                trail 100% on-chain.
              </p>
            </article>

            <article className="acard" data-rev data-d="2">
              <div className="acard-top">
                <span
                  className="idx"
                  aria-hidden="true"
                  style={{ color: "var(--gold)", fontSize: 18, letterSpacing: 0 }}
                >
                  ◆
                </span>
              </div>
              <h3>Mercado secundario</h3>
              <div className="slug mono">Liquidez para lenders</div>
              <p>
                Bankaool compra la factura, pero podría venderla a otro
                lender antes del vencimiento. Portafolio activo, liquidez
                extra, secondary market sobre invoice-NFTs.
              </p>
            </article>

            <article className="acard" data-rev data-d="3">
              <div className="acard-top">
                <span
                  className="idx"
                  aria-hidden="true"
                  style={{ color: "var(--gold)", fontSize: 18, letterSpacing: 0 }}
                >
                  ◆
                </span>
              </div>
              <h3>Sandbox CNBV</h3>
              <div className="slug mono">sandbox CNBV (Ley Fintech 2018)</div>
              <p>
                Trazabilidad agéntica + tokenización ya están en el discurso
                del regulador. Cobraya es candidato natural a piloto CNBV
                junto a Bitso, BBVA, Konfío.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* ─────────── QUOTE ─────────── */}
      <section className="quote-sec">
        <div className="wrap">
          <blockquote data-rev>
            &quot;El factoring tradicional sirvió. 50 años.{" "}
            <span>Ya cumplió.</span>
            <br />
            Es turno de los{" "}
            <span style={{ fontStyle: "italic" }}>agentes.</span>&quot;
          </blockquote>
          <div className="by" data-rev data-d="1">
            — Cobraya · Hackathon: LatAm Institucional
          </div>
        </div>
      </section>

      {/* ─────────── FINAL CTA ─────────── */}
      <section className="final">
        <div className="wrap">
          <h2 data-rev>
            ¿Ya cobraste? <span className="it">Cobraya.</span>
          </h2>
          <p data-rev data-d="1">
            Probá Cobraya con tu propia factura. Sin signup. Sin wallet
            connect. Sin fricción. Tx hash al final.
          </p>
          <div className="ctas" data-rev data-d="2">
            <a
              className="btn btn-wine btn-lg"
              href="/"
              target="_blank"
              rel="noopener noreferrer"
            >
              ▶ Probar Cobraya
            </a>
            <a
              className="btn btn-ghost btn-lg"
              href={VIDEO_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              ▶ Ver video (3 min)
            </a>
          </div>
        </div>
      </section>

      {/* ─────────── FOUNDER ─────────── */}
      <section className="sec" id="founder">
        <div className="wrap">
          <div className="sec-head">
            <div className="kicker" data-rev>
              Quién está detrás
            </div>
          </div>
          <div className="founder-grid" data-rev data-d="1">
            <div className="founder-photo-wrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/team-fernando.jpg"
                alt="Fernando Rosas"
                className="founder-photo"
                width={160}
                height={160}
              />
            </div>
            <div className="founder-body">
              <h3 className="founder-name">Fernando Rosas</h3>
              <div className="founder-title">
                Co-founder &amp; CEO ·{" "}
                <span style={{ color: "var(--wine-soft)" }}>
                  Blockchain / DeFi
                </span>
              </div>
              <p className="founder-bio">
                25+ years building technology from enterprise systems to
                decentralized protocols. Solidity smart contracts, distributed
                architecture, and AI products shipped to production on
                Avalanche.
              </p>
              <a
                className="founder-link"
                href="https://www.linkedin.com/in/fernando-rosas/"
                target="_blank"
                rel="noopener noreferrer"
              >
                ↗ LinkedIn
              </a>
              <details className="founder-details">
                <summary>Full background</summary>
                <p>
                  Serial builder with 25+ years shipping technology across
                  enterprise systems, decentralized protocols, and AI products.
                  Deep expertise in Solidity smart contracts, distributed
                  systems architecture, data science, and product strategy.
                  Focused on building real products that work in production.
                </p>
                <p>
                  Co-founder of Troker, a digital barter platform exploring
                  new models of collaborative economy. Community builder in
                  LATAM: organized &quot;La Mañanera&quot;, a Web3 education
                  initiative for the Spanish-speaking blockchain community.
                  Driving AI and Web3 infrastructure for builders and startups
                  across the region.
                </p>
              </details>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────── FOOTER ─────────── */}
      <footer className="footer">
        <div className="wrap">
          <div className="foot-grid">
            <div>
              <div className="brand" style={{ marginBottom: 14 }}>
                <span className="brand-mark" aria-hidden="true">
                  <LogoCobraya size={18} />
                </span>
                <span>Cobraya</span>
              </div>
              <p>
                Factoraje agéntico para PyMEs mexicanas. 4 agentes de IA +
                smart contract en Avalanche. Tu factura, líquida en 30
                segundos.
              </p>
              <div
                className="mono"
                style={{
                  fontSize: 11,
                  color: "var(--fg-3)",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                }}
              >
                <span style={{ color: "var(--wine-soft)" }}>◆</span>{" "}
                Hackathon: LatAm Institucional
              </div>
              <div
                className="mono"
                style={{
                  fontSize: 10.5,
                  color: "var(--fg-3)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginTop: 6,
                }}
              >
                <span style={{ color: "var(--gold)" }}>★</span> Tracks: RWA IFC
                · Inclusión Financiera Digital
              </div>
            </div>
            <div>
              <h5>Producto</h5>
              <ul>
                <li>
                  <a
                    href={DEMO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Demo en vivo
                  </a>
                </li>
                <li>
                  <a href="/pitch">Pitch</a>
                </li>
                <li>
                  <a
                    href={COBRAYA_REPO}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GitHub ↗
                  </a>
                </li>
                <li>
                  <a
                    href={A2A_REPO}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    A2A marketplace ↗
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5>Stack</h5>
              <ul>
                <li>
                  <a>Avalanche Fuji</a>
                </li>
                <li>
                  <a>USDC · EIP-3009</a>
                </li>
                <li>
                  <a>Anthropic Claude</a>
                </li>
                <li>
                  <a>Foundry + OpenZeppelin</a>
                </li>
              </ul>
            </div>
            <div>
              <h5>Hackathon</h5>
              <ul>
                <li>
                  <a>LatAm Institucional 2026</a>
                </li>
                <li>
                  <a
                    href={snowtraceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Contrato ↗
                  </a>
                </li>
                <li>
                  <a href={AUDIT_EXAMPLE_URL}>Audit trail</a>
                </li>
                <li>
                  <a
                    href={VIDEO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Video pitch ↗
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="foot-bottom">
            <span>© 2026 Cobraya · MIT licensed</span>
            <span>v1 · &quot;tu factura, líquida en 30 segundos&quot;</span>
          </div>
        </div>
      </footer>

      {/* Scroll-reveal observer: lightweight client mount, no DOM */}
      <ScrollReveal />
    </div>
  );
}
