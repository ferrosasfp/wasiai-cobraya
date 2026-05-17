"use client";

// src/app/(marketing)/pitch/PhoneCycle.tsx — Cobraya pitch v3 (2026-05-16)
//
// Client component. Renders the 320×640 phone mockup with 4 cycling screens
// (scan → agents → auction → done) on a 3.2s interval, mirroring the design
// source's setInterval loop.
//
// Behaviour:
// - Initial screen index = 0 (scan).
// - Every 3200ms, advance to (i + 1) % 4.
// - The phone-steps dots track the active screen.
// - Screens fade via the existing .screen.is-on rule in pitch.css.
//
// Reduced motion: when prefers-reduced-motion is set, we still cycle but the
// CSS transition above shortens to 0.01ms (see pitch.css media query).

import { useEffect, useState } from "react";

const SCREEN_COUNT = 4;
const INTERVAL_MS = 3200;

export function PhoneCycle() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((prev) => (prev + 1) % SCREEN_COUNT);
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="phone-wrap" data-rev data-d="2">
      <div className="phone">
        <div className="phone-screen">
          <div className="phone-notch" />
          <div className="phone-status">
            <span>9:41</span>
            <span>● ● ●</span>
          </div>

          {/* Screen 1 — scan */}
          <div
            className={`screen${active === 0 ? " is-on" : ""}`}
            data-screen="0"
          >
            <div className="screen-h">
              <span className="back">‹ Cobraya</span>
              <span className="step">Paso 1 de 4</span>
            </div>
            <div className="screen-t">Escanear factura</div>
            <div className="screen-sub">Subí tu factura CFDI</div>
            <div className="scan-card">
              <div className="check">✓</div>
              <div className="ok">CFDI detectado</div>
              <div className="amt">$48,500.00 MXN</div>
              <div className="meta">Factura · Walmart México · 60 días</div>
            </div>
            <div className="screen-btn">Continuar</div>
          </div>

          {/* Screen 2 — agents */}
          <div
            className={`screen${active === 1 ? " is-on" : ""}`}
            data-screen="1"
          >
            <div className="screen-h">
              <span className="back">‹ Cobraya</span>
              <span className="step">Paso 2 de 4</span>
            </div>
            <div className="screen-t">Validando</div>
            <div className="screen-sub">4 agentes procesan tu factura</div>
            <div className="agent-list">
              <div className="agent-row">
                <div className="ico">✓</div>
                <div className="nm">CFDI Validator</div>
                <div className="st">OK</div>
              </div>
              <div className="agent-row">
                <div className="ico">✓</div>
                <div className="nm">Fraud Detector</div>
                <div className="st">OK</div>
              </div>
              <div className="agent-row">
                <div className="ico">✓</div>
                <div className="nm">Credit Scorer</div>
                <div className="st">80 / A</div>
              </div>
              <div className="agent-row pending">
                <div className="ico" style={{ color: "var(--gold)" }}>
                  ●
                </div>
                <div className="nm">Lender Matcher</div>
                <div className="st" style={{ color: "var(--gold)" }}>
                  subastando…
                </div>
              </div>
            </div>
            <div className="agent-bar">
              <div className="fill" style={{ width: "78%" }} />
            </div>
            <div className="agent-foot">on-chain · 12s restantes</div>
          </div>

          {/* Screen 3 — auction */}
          <div
            className={`screen${active === 2 ? " is-on" : ""}`}
            data-screen="2"
          >
            <div className="screen-h">
              <span className="back">‹ Cobraya</span>
              <span className="step">Paso 3 de 4</span>
            </div>
            <div className="screen-t">Subasta</div>
            <div className="screen-sub">4 lenders compitiendo</div>
            <div className="bid-list">
              <div className="bid">
                <div className="lg">B</div>
                <div className="nm">
                  <div className="b">Bankaool</div>
                  <div className="sub">advance · 5–7d</div>
                </div>
                <div className="apr">
                  14.5%<span className="small">92%</span>
                </div>
              </div>
              <div className="bid win">
                <div className="lg">A</div>
                <div className="nm">
                  <div className="b">
                    Arkangeles <span className="star">⭐ MEJOR</span>
                  </div>
                  <div className="sub">advance · 24h</div>
                </div>
                <div className="apr">
                  12.0%<span className="small">95%</span>
                </div>
              </div>
              <div className="bid">
                <div className="lg">V</div>
                <div className="nm">
                  <div className="b">BBVA Pyme</div>
                  <div className="sub">advance · 3d</div>
                </div>
                <div className="apr">
                  13.2%<span className="small">93%</span>
                </div>
              </div>
              <div className="bid">
                <div className="lg">K</div>
                <div className="nm">
                  <div className="b">Konfío</div>
                  <div className="sub">advance · 48h</div>
                </div>
                <div className="apr">
                  13.5%<span className="small">93%</span>
                </div>
              </div>
            </div>
            <div
              className="screen-btn"
              style={{ background: "var(--gold)", color: "#1a0d10" }}
            >
              Aceptar Arkangeles
            </div>
          </div>

          {/* Screen 4 — done */}
          <div
            className={`screen${active === 3 ? " is-on" : ""}`}
            data-screen="3"
          >
            <div className="screen-h">
              <span className="back" style={{ color: "var(--green)" }}>
                ✓ Cobraya
              </span>
              <span className="step">¡Recibiste!</span>
            </div>
            <div className="done-amt">
              <div className="lab">USDC en wallet</div>
              <div className="v">
                $940.00<span className="u">USDC</span>
              </div>
              <div className="t">pagado en 28 segundos</div>
            </div>
            <div className="done-list">
              <div className="done-row">
                <span className="k">lender</span>
                <span className="v">Arkangeles</span>
              </div>
              <div className="done-row">
                <span className="k">red</span>
                <span className="v">Avalanche Fuji</span>
              </div>
              <div className="done-row">
                <span className="k">apr</span>
                <span className="v">12.0%</span>
              </div>
              <div className="done-row">
                <span className="k">tx</span>
                <span className="v tx">0xa3f…c1d ↗</span>
              </div>
            </div>
            <div className="done-foot">
              Audit trail firmado · descargar JSON
            </div>
          </div>
        </div>

        {/* step indicator */}
        <div className="phone-steps">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`ds${active === i ? " on" : ""}`}
              data-ds={String(i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
