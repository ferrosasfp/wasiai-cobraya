# Translation matrix — wasiai-agentshop → wasiai-lendable

> Mapeo 1:1 de los módulos de `wasiai-agentshop` (Kite Hackathon submission, ya en prod) que se traducen a `wasiai-lendable` durante el hack-day (viernes 15 mayo 18:00).
>
> **Status**: planning doc — el código se escribe durante el hack. Este documento define el qué; no contiene implementación.
>
> **Source repo**: https://github.com/ferrosasfp/wasiai-agentshop · branch `main`
> **Target repo**: https://github.com/ferrosasfp/wasiai-cobraya · branch `feat/wkh-cobraya-agents`

---

## High-level mapping

| WasiAgentShop (Kite) | Cobraya (Avalanche) |
|---|---|
| Use case: cross-border remittances LATAM | Use case: factoraje agéntico PyMEs MX |
| Persona protagonista: Luis Quispe → Rosa (mama, Peru) | Persona protagonista: Tortillería La Esperanza → Walmart MX |
| Chain settlement | Kite Ozone testnet (chainId 2368) → **Avalanche Fuji (chainId 43113)** |
| Asset | PYUSD (18 dec) → **USDC** (6 dec) |
| Sender wallet | OPERATOR firma EIP-3009 → **TREASURY** (lender) firma EIP-3009 |
| Receiver wallet | hardcoded testnet → **OWNER** (SME) |
| Header chain | `x-payment-chain: kite-ozone-testnet` → `x-payment-chain: avalanche-fuji` |
| Cap safety env | `ONCHAIN_AMOUNT_CAP_PYUSD=0.05` → `ONCHAIN_AMOUNT_CAP_USDC=0.05` |
| FX integration | open.er-api.com (USD→MXN/COP/PEN/ARS) → **no FX needed** (MXN→USDC vía spot rate fijo del demo, o solo USDC) |
| Branded agents (3) | `agentshop-kyc-validator` $0.001 / `agentshop-corridor-discoverer` $0.05 / `agentshop-cashout-matcher` $0.01 | `cobraya-cfdi-validator` $0.001 / `cobraya-credit-scorer` $0.05 / `cobraya-lender-matcher` $0.01 |
| Total fees per demo | $0.061 → **$0.061** (mismos precios) |
| AI in scorer | N/A (corridor-discoverer es deterministic) → **Hybrid: heurística + Claude API opcional para rationale** |
| Demo phases | 4 phases visible (00 marketplace, 01 picker, 02 compose×3, 03 settle) → **Mismas 4 phases** |
| UI components | TraceConsole + PipelineProgress + Settlement + RemittancePicker + BrandIcon | TraceConsole + PipelineProgress + Settlement + **InvoicePicker** + BrandIcon |

---

## File-by-file translation map

### Translate (copy + customize)

| agentshop file | cobraya target | Tipo de cambio | Notas |
|---|---|---|---|
| `src/components/TraceConsole.tsx` | `src/components/TraceConsole.tsx` | **COPY exacto** | Componente puro, sin business logic. Sirve idéntico. |
| `src/components/PipelineProgress.tsx` | `src/components/PipelineProgress.tsx` (ya existe scaffold) | Rename agent labels | Cambiar nombres de "Section 02 step N" → mismo pattern con agents cobraya-* |
| `src/components/Settlement.tsx` | `src/components/Settlement.tsx` (ya existe scaffold) | Rename labels MXN/USDC | Mostrar amount delivered en USDC + tx hash + Snowtrace link |
| `src/components/CopyButton.tsx` | `src/components/CopyButton.tsx` | **COPY exacto** | UI helper, no business logic |
| `src/components/InfoTooltip.tsx` | `src/components/InfoTooltip.tsx` | **COPY exacto** | UI helper |
| `src/components/MarketplacePanel.tsx` | `src/components/MarketplacePanel.tsx` | Rename: 3 cobraya-* agents en lugar de agentshop-* | Lee de `/api/marketplace` → muestra cards |
| `src/components/BrandIcon.tsx` | `src/components/BrandIcon.tsx` | **Nuevo SVG** (logo Cobraya) | El componente es trivial; solo cambia el contenido SVG |
| `src/components/RemittancePicker.tsx` | `src/components/InvoicePicker.tsx` (rename) | Adapt fields: 3 invoices en lugar de 3 remesas | Mismo card pattern: 3 tarjetas pre-loadeadas, click selecciona |
| `src/infra/eip3009-signer.ts` | `src/infra/eip3009-signer.ts` | Swap chain/asset constants | EIP-712 domain: chainId 43113, USDC contract address Fuji |
| `src/infra/a2a-client.ts` | `src/infra/a2a-client.ts` (ya existe) | Swap chain header constant | `x-payment-chain: avalanche-fuji` |
| `src/infra/facilitator-client.ts` | `src/infra/facilitator-client.ts` (ya existe) | **COPY exacto** | Same facilitator, same /verify and /settle endpoints |
| `src/infra/env.ts` | `src/infra/env.ts` (ya existe) | Add `ANTHROPIC_API_KEY?`, `AVALANCHE_CHAIN_ID`, `USDC_ADDRESS_FUJI`, `TREASURY_PRIVATE_KEY`, `OWNER_ADDRESS` | Env schema con Zod |
| `src/app/api/marketplace/route.ts` | `src/app/api/marketplace/route.ts` | Adapt: filter agents `cobraya-*` slug | Call wasiai-a2a `/discover` con Cobraya A2A_KEY |
| `src/app/api/settle/route.ts` | `src/app/api/settle/route.ts` | Swap chain/asset, cap env var name | Server-side EIP-3009 sign + facilitator /settle call |
| `src/app/api/kyc/route.ts` | `src/app/api/validate/route.ts` (rename) | Adapt to call `cobraya-cfdi-validator` via /compose | El nombre route ≠ agent slug, route es el wrapper Cobraya |
| `src/app/api/discover/route.ts` | `src/app/api/score/route.ts` (rename) | Adapt to call `cobraya-credit-scorer` via /compose | Wrapper |
| `src/app/api/match/route.ts` | `src/app/api/match/route.ts` | Adapt to call `cobraya-lender-matcher` via /compose | Wrapper |
| `src/app/page.tsx` | `src/app/page.tsx` (ya existe) | Rewrite narrative: PyME → Walmart | Landing dark theme, story stage, animated hero |
| `src/app/demo/page.tsx` | `src/app/demo/page.tsx` (ya existe) | Wire al nuevo flow + UI components | 4 phases, mismo pattern |
| `src/app/globals.css` | `src/app/globals.css` | **COPY exacto** | Same Tailwind + Claude Design vars |
| `src/types/remittance.ts` | `src/types/invoice.ts` (ya existe) | Adapt domain types | Invoice, Buyer, Lender, ScoreResult, MatchResult |
| `src/types/trace.ts` | `src/types/trace.ts` | **COPY exacto** | TraceEvent type |
| `src/core/corridor.ts` | `src/core/scoring.ts` (ya existe) + `src/core/matching.ts` (ya existe) | Replace remittance logic with scoring + matching | Scoring bands, matching algo |
| `src/core/compliance.ts` | (inline en validator route) | Cobraya validator es simpler: solo CFDI shape check | No necesita módulo separado |
| `src/core/payout.ts` | (inline en matcher route) | Cobraya matcher es simpler: lender catalog + filter | No necesita módulo separado |
| `src/core/settlement.ts` | `src/core/settlement.ts` (ya existe) | Swap PYUSD → USDC math | 18 dec → 6 dec calculation difference |
| `src/lib/mock-data.ts` | `src/lib/mock-data.ts` (ya existe) | **Replace contents**: 3 CFDIs + 4 buyers + 4 lenders | Ver BACKLOG.md §6 |

### Translate (refactor existing scaffold)

| Cobraya scaffold ya existe | Acción durante hack |
|---|---|
| `src/application/validate-invoice.ts` | Wire al nuevo agent endpoint + dispatch isDemoMode() |
| `src/application/score-invoice.ts` | Wire + dispatch isDemoMode() |
| `src/application/match-lender.ts` | Wire + dispatch isDemoMode() |
| `src/application/settle-factoring.ts` | Wire al EIP-3009 signer + facilitator |
| `src/components/UploadInvoice.tsx` | **DELETE** (no se usa, scaffold antiguo) o renombrar a InvoicePicker |
| `src/infra/oracle-client.ts` | **DELETE** o renombrar a `llm-client.ts` con Claude integration |
| `src/infra/mock-adapter.ts` | Mantener — mock implementations para isDemoMode() path |

### New files (no equivalent en agentshop, Cobraya-specific)

| New file | Propósito |
|---|---|
| `src/infra/llm-client.ts` | Wrapper Claude API con fallback. Genera rationale para credit-scorer. |
| `src/app/api/agents/cobraya-cfdi-validator/invoke/route.ts` | Agent endpoint #1 (Cobraya lo expone, wasiai-a2a `/discover` lo lista) |
| `src/app/api/agents/cobraya-credit-scorer/invoke/route.ts` | Agent endpoint #2 |
| `src/app/api/agents/cobraya-lender-matcher/invoke/route.ts` | Agent endpoint #3 |
| `doc/EVIDENCE.md` | Captura tx hashes reales + screenshots + links Snowtrace (post-hack) |

### Files to DELETE en Cobraya scaffold

| Path | Razón |
|---|---|
| `src/infra/oracle-client.ts` | Dropeamos Oracle GenAI; reemplazado por llm-client.ts |
| `src/components/UploadInvoice.tsx` | No se usa en flow demo (CFDIs son pre-loadeadas) |

---

## Pattern adaptations específicas

### 1. Server-side EIP-3009 signing

WasiAgentShop establece el patrón:
- `src/infra/eip3009-signer.ts` exporta `signEIP3009(params)` → typed data + signature
- `src/app/api/settle/route.ts` lee `SENDER_PRIVATE_KEY` server-side, llama signer, POST al facilitator
- El private key **NUNCA** llega al browser. UI solo ve el tx hash.

Cobraya adopta el mismo pattern:
- `src/infra/eip3009-signer.ts` con USDC Fuji contract + chainId 43113
- `src/app/api/settle/route.ts` lee `TREASURY_PRIVATE_KEY` server-side
- Sender = TREASURY (lender), receiver = OWNER (SME)

### 2. Hybrid Claude API (Cobraya-specific)

WasiAgentShop NO usa LLMs (corridor-discoverer es deterministic con FX rates).

Cobraya agrega esta pieza nueva:
- `src/infra/llm-client.ts` con función `async generateRationale(scoreContext): Promise<string>`
- Si `ANTHROPIC_API_KEY` está seteada → fetch a `https://api.anthropic.com/v1/messages` con model `claude-haiku-4-5-20251001` (rápido + barato), timeout 5s
- Si no o falla → fallback determinista con templates:
  ```typescript
  const FALLBACK_TEMPLATES: Record<Band, string> = {
    A: 'Factura emitida a anchor buyer tier-1 con plazo corto y sector de bajo riesgo. Banda A indica perfil crediticio sólido y riesgo de default mínimo.',
    B: 'Anchor buyer tier-1 con plazo medio y sector estable. Banda B refleja buen perfil con consideraciones de plazo de pago.',
    C: 'Anchor buyer aceptable pero con plazos largos o sector de mayor riesgo. Banda C amerita spread adicional.',
    D: 'Perfil con varios factores de riesgo (anchor buyer no tier-1, plazos largos, sector volátil). Banda D requiere análisis caso por caso.',
  };
  ```

### 3. Determinismo del demo

WasiAgentShop tiene FX rates "live" pero con 5-min cache para que el demo no se contradiga entre invocaciones.

Cobraya es más estricto:
- Scoring 100% determinista (mismo input → mismo score+band siempre)
- Matching 100% determinista (mismo score+band+amount → mismo lender)
- Solo el `rationale` text varía si Claude API está activa (pero el `band` no cambia)

Esto se enforza en tests: T-COMPOSE-DETERMINISM-1 (2 invocations consecutivas con misma input retornan mismo score).

---

## Effort estimate breakdown

| Wave | Effort | Cumulative |
|---|---|---|
| W0 Bootstrap | 15min | 0:15 |
| W1 Mock data + types | 30min | 0:45 |
| W2 cfdi-validator agent | 45min | 1:30 |
| W3 credit-scorer agent (incl. Claude) | 90min | 3:00 |
| W4 lender-matcher agent | 45min | 3:45 |
| W5 EIP-3009 + settle | 60min | 4:45 |
| W6 UI translation | 60min | 5:45 |
| W7 Register agents + smoke real tx | 45min | 6:30 |
| Buffer (debugging, integration issues) | 60min | 7:30 |
| W8 Pitch + video (sábado) | 240min | 11:30 |
| **TOTAL** | **~12h** | distribuidas viernes noche + sábado |

Comparado con build-from-scratch (estimación pre-translation matrix: 20-25h), esto **ahorra ~50% del tiempo de hack** por reuso del pattern.

---

## PWA pattern — adaptado de `luma-ai`

> Nuevo en v2 + PWA: Cobraya es **mobile-first PWA installable**.
> Pattern reusado de `luma-ai` (otro proyecto open source del mismo equipo).

### Stack PWA (idéntico a luma-ai)

| Tool/Lib | Versión | Uso |
|---|---|---|
| `@ducanh2912/next-pwa` | `^10.2.9` | Plugin Next.js PWA: service worker generation + manifest support |
| `workbox-*` (transitivo) | latest | Service worker runtime + caching strategies |
| `next.config.mjs withPWA()` | wrap config | Configura plugin con `cacheOnFrontEndNav`, `aggressiveFrontEndNavCaching`, `reloadOnOnline` |
| `disable: NODE_ENV === 'development'` | flag | Sin SW en dev (evita cache stale en development) |

### File mapping `luma-ai` → `wasiai-lendable`

| luma-ai file | wasiai-lendable target | Tipo de cambio |
|---|---|---|
| `next.config.mjs withPWA wrapper` | `next.config.js withPWA wrapper` | Copy estructura + adapt runtimeCaching rules a `/api/*` Cobraya + wasiai-a2a |
| `public/manifest.json` | `public/manifest.json` | Customize: name "Cobraya", theme_color verde, lang "es", categories ["finance", "productivity"] |
| `public/icons/icon-192.png` | `public/icons/icon-192.png` | Generate from Cobraya logo PNG source |
| `public/icons/icon-512.png` | `public/icons/icon-512.png` | Same generate |
| `public/icons/icon-maskable-512.png` | `public/icons/icon-maskable-512.png` | Same generate, padding 10% para safe zone Android |
| `public/icons/apple-touch-icon-{120,152,180}.png` | `public/icons/apple-touch-icon-{120,152,180}.png` | iOS home screen icons |
| `public/splashes/splash-iphone-*.png` | `public/splashes/splash-iphone-*.png` | iOS startup splash screens (3 variants per device) |
| `scripts/generate-pwa-assets.mjs` | `scripts/generate-pwa-assets.mjs` | Generator script — takes logo PNG source, outputs all icon/splash variants |
| `src/app/~offline/page.tsx` | `src/app/~offline/page.tsx` | Offline fallback page — adapt copy: "Sin conexión. Demo determinístico sigue funcionando." + reload button |
| `src/components/pwa/register-sw.tsx` | `src/components/pwa/register-sw.tsx` | Client component que registra service worker on mount |
| `src/components/pwa/install-prompt.tsx` | `src/components/pwa/install-prompt.tsx` | Handles `beforeinstallprompt` event, muestra "Instalar Cobraya" UI dismissible |
| `src/app/layout.tsx metadata` | `src/app/layout.tsx metadata` | Add `manifest: '/manifest.json'` + `icons` + `appleWebApp: { capable: true, title: 'Cobraya', statusBarStyle: 'default' }` |
| `src/app/layout.tsx viewport` | `src/app/layout.tsx viewport` | Add `themeColor: '#0F8B4A'` (verde Cobraya) |

### Runtime caching strategy (copy de luma-ai)

```js
// next.config.js withPWA runtimeCaching
{
  // CRITICAL: Cobraya agents debit USDC budget on every call.
  // Caching == financial fraud. NetworkOnly enforced.
  urlPattern: /^https:\/\/wasiai-a2a-production\.up\.railway\.app\//,
  handler: 'NetworkOnly',
  options: { cacheName: 'wasiai-a2a-networkonly' }
},
{
  urlPattern: /^https:\/\/wasiai-facilitator-production\.up\.railway\.app\//,
  handler: 'NetworkOnly',
  options: { cacheName: 'wasiai-facilitator-networkonly' }
},
{
  // Same-origin /api/* (proxies a wasiai-a2a) — never cache
  urlPattern: /\/(api)\//,
  handler: 'NetworkOnly',
  options: { cacheName: 'cobraya-api-networkonly' }
},
// UI shell + static assets — cache with stale-while-revalidate (default plugin behavior)
```

### Mobile UX rules (Material 3 + Apple HIG)

| Rule | Spec | Why |
|---|---|---|
| Touch targets | ≥44px (Apple) / ≥48px (Material) | Fitts' law — finger usability |
| Vertical scroll only | No horizontal panels | Phone ergonomics |
| Bottom-sheet patterns | `vaul` o custom component | Native phone UX expectation |
| Safe area | `padding-bottom: env(safe-area-inset-bottom)` | iPhone notch / Android nav bar |
| Animations | <200ms duration | Material guidelines, perceived speed |
| Viewport meta | `width=device-width, initial-scale=1, viewport-fit=cover` | Full-bleed iOS |
| Theme color | `theme_color` in manifest + `<meta name="theme-color">` | Android status bar tint, iOS Safari address bar |

### Video recording strategy

**Primary**: Chrome DevTools mobile emulation (iPhone 14 Pro 393x852 viewport, 3x DPR). Reasons:
- Predictable rendering (no real-device quirks)
- Easy screen recording at desktop quality
- Cursor → tap simulation con click events visible
- Multiple takes sin charger / battery worries

**Secondary (B-roll, Scene 1)**: phone real con Lupita's hand sacando del mandil. 3-5 segundos para autenticidad. iPhone + Android side-by-side opcional.

### What we do NOT add (scope guard)

| Feature | Status | Razón |
|---|---|---|
| Camera capture (subir CFDI con foto) | ❌ NO | Pre-loaded CFDIs son suficientes. Camera permission flow agrega complejidad. |
| Push notifications | ❌ NO | Backend infra adicional. No agrega al video. |
| Web Share API | ❌ NO | Out of scope. |
| Background sync | ❌ NO | No tenemos work offline real. |
| Geolocation | ❌ NO | Irrelevante para factoring. |

---

## Honestidad: declaración pública pre-hack

Antes de las 18:00, push a `wasiai-lendable/README.md` declarando explícitamente:

> "Cobraya will be implemented during the Hackathon: LatAm Institucional hackathon (May 15-17, 2026) following the architecture pattern already proven in [wasiai-agentshop](https://github.com/ferrosasfp/wasiai-agentshop) (a previous open-source project by the same team, submitted to Kite Hackathon). The pattern includes 3-agent pipeline, EIP-3009 settlement, hexagonal-light architecture. Implementation of Cobraya-specific business logic (CFDI validation, credit scoring, lender matching) begins May 15, 18:00 hora MX. Pre-hack state is limited to scaffold + planning docs (this BACKLOG, TRANSLATION-MATRIX, README, PITCH, DEMO-FLOW, HACK-PLAN)."

Esto es proof-of-honesty verificable contra git history.
