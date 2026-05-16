# Cobraya — Tu factura, líquida en 30 segundos

> **¿Ya cobraste? Cobraya.** Marketplace agéntico para que PyMEs mexicanas conviertan sus facturas en USDC en menos de un minuto. Validación, anti-fraude on-chain, scoring crediticio, y subasta entre 4 inversores — todo en 3 taps desde el celular. Settlement en USDC sobre Avalanche.

**Hackathon Build LATAM Fintech** · Avalanche · Mayo 15-17 2026 · Solo · Sponsors: Avalanche / Bankaool / Arkangeles

---

## El problema

PyMEs mexicanas con facturas a 30/60/90 días no tienen capital de trabajo. Factoraje tradicional toma 3-7 días, requiere papeleo presencial, y el spread se queda casi entero con la financiera porque hay 4 capas humanas entre la PyME y el inversor que firma el cheque.

## La solución

Una factura entra. Tres agentes la procesan en paralelo y entregan veredicto en <60s:

1. **cobraya-cfdi-validator** — verifica shape del CFDI, anchor buyer en registry tier-1, detecta duplicados.
2. **cobraya-credit-scorer** — score determinístico en base a anchor buyer tier + monto + plazo + sector. Rationale narrativa generado por LLM (Claude Haiku) con fallback local determinista — score auditable, narrativa opcional.
3. **cobraya-lender-matcher** — busca el inversor con mejor tasa para ese perfil de riesgo en el pool de lenders activos.

Si hay match, el inversor firma una autorización gasless (EIP-3009) y nuestro facilitator settlement en USDC sobre Avalanche mainnet. La PyME recibe el cash en su wallet en segundos.

## Por qué Avalanche

- USDC nativo + finalidad sub-segundo → settlement real-time
- Sub-segundo finality permite UX de "click → cash"
- Fee predecible → la PyME ve el net amount antes de firmar
- Subnet-ready si una contraparte (banco) necesita su propio rail

## Por qué los sponsors caen aquí

| Sponsor | Encaje |
|---------|--------|
| **Avalanche** | Chain primaria de settlement. USDC nativo + sub-segundo finality + subnet-ready para banca corporativa. Cobraya es agentic fintech building on Avalanche infra. |
| **Bankaool** | PyMEs son su core de clientes. Cobraya les abre canal agéntico nuevo sin mover su core bancario. El banco puede listar su pool de capital aquí y los agentes hacen el matching. |
| **Arkangeles** | Plataforma de matching para PyMEs con inversores. Cobraya es la capa de settlement onchain que les faltaba. El matching humano se vuelve agéntico, settlement en segundos vs días. |

> **Note sobre AI providers**: el credit-scorer usa una arquitectura de "deterministic scoring + LLM narrative" — el score se computa con reglas auditables (importante para fintech regulada), y la explicación textual se genera con LLM. La implementación actual usa Anthropic Claude vía API; es drop-in compatible con Oracle GenAI, OpenAI, o cualquier provider para deploy enterprise.

## Arquitectura

```
[ PyME sube CFDI ] ─→ [ Cobraya UI ]
                          │
                          ▼
                  [ WasiAI A2A: /compose ]
                          │
              ┌───────────┼───────────┐
              ▼           ▼           ▼
        [validator]  [scorer]    [matcher]
         (CFDI)    (rules+LLM)  (lenders)
              │           │           │
              └───────────┼───────────┘
                          ▼
                 [ veredicto + lender ]
                          │
            inversor firma EIP-3009 ─┐
                                     ▼
                       [ wasiai-facilitator ]
                                     │
                                     ▼
                       [ Avalanche · USDC settle ]
                                     │
                                     ▼
                       [ PyME wallet · cash ]
```

## Stack

- **Frontend**: Next.js 14 App Router · TypeScript strict · Tailwind · **PWA mobile-first** (installable en iOS/Android via `@ducanh2912/next-pwa`, same pattern as [luma-ai](https://github.com/ferrosasfp/luma-ai))
- **Agents**: 3 endpoints REST (validate / score / match) — descubiertos vía WasiAI A2A `/discover`, orquestados vía `/compose`
- **AI**: Anthropic Claude API para narrativa del scoring (provider-agnostic — drop-in para Oracle GenAI, OpenAI en deploy enterprise)
- **Onchain**: viem + EIP-3009 (transferWithAuthorization) en Avalanche (Fuji para demo, mainnet code-ready)
- **Settlement**: wasiai-facilitator (self-hosted, en prod desde 2026-05, soporta nativamente Kite + Avalanche Fuji + Avalanche Mainnet)
- **Hosting**: Vercel (UI) + Railway (existing wasiai-facilitator)

## Arquitectura de capas (hexagonal-light)

```
src/
├── core/          reglas puras: scoring bands, lender catalog, fee math, mxn↔usdc
├── infra/         I/O outbound: a2a-client, oracle-client, facilitator-client, mock-adapter
├── application/   use cases: validate-invoice, score-invoice, match-lender, settle-factoring
├── app/           Next.js (UI + API routes)
├── components/    React UI
└── types/         DTOs compartidos
```

La regla de dependencia es concéntrica: `app → application → infra → core`. `core` no importa de ningún otro layer. Cada use case en `application/` hace un único dispatch en `isDemoMode()` y delega a `infra/` (real) o `infra/mock-adapter` (determinista). Eso permite que el demo corra sin red y que pasar a producción real sea cambiar una env var.

## Diseño de agentes — qué es y qué no es

Para evitar confusión común en pitches/demos agénticos:

| Concepto | ¿Aplica a Cobraya? | Cómo se ve hoy |
|----------|--------------------|----------------|
| **Agent-native** (agentes discoverable + componible) | Sí | 3 agentes vía WasiAI A2A `/discover` + `/compose` |
| **Sovereign agents** (cada uno corre en su servicio) | Sí | Validator, scorer, matcher son endpoints separados |
| **Onchain settlement** (USDC + EIP-3009 + facilitator self-hosted) | Sí | Avalanche Fuji/mainnet vía wasiai-facilitator |
| **Pipeline lineal** (validator → scorer → matcher → settle, orden fijo) | Sí | Hard-coded en `src/app/demo/page.tsx` |
| **Autonomous agent** (LLM decide next action) | No | La secuencia la decide el cliente, no un LLM |
| **ReAct loop** (Reason → Act → Observe → Reason → …) | No | Cada agente es un RPC stateless, no hay loop |
| **Inter-agent reasoning** (agent A decide consultar agent B) | No | La composición la define `/compose` steps[], no los agentes mismos |

**Por qué no usamos ReAct hoy.** Tres razones, en orden de peso:

1. **Determinismo del demo.** Un pipeline fijo corre en 90 segundos exactos; un loop ReAct con LLM puede tardar 30-120s impredecibles y dar resultados diferentes en cada corrida. Eso asusta al jurado en vivo.
2. **Narrativa enfocada.** El pitch es "settlement onchain agéntico componible", no "razonamiento agéntico". Agregar ReAct dispersa la atención sin sumar al hilo de Avalanche/sponsors.
3. **Cost de iteración.** Un loop ReAct serio toma 6-10h de trabajo más QA. Esas horas las invertimos en la integración con Oracle GenAI + Bankaool, que son sponsors directos.

**Cuándo sí tiene sentido.** Post-hackathon, cuando Cobraya v2 necesite:
- Ramificación condicional (banda D → llamar `fraud-detector` antes de `matcher`)
- Retry inteligente (si Oracle GenAI devuelve incertidumbre, consultar segunda fuente)
- Negociación entre agentes (lender propone tasa → matcher contra-propone)

En ese momento se agrega un `factoring-orchestrator` agéntico encima del pipeline actual sin tocar los 3 agentes existentes. La arquitectura hexagonal de hoy lo deja preparado.

## Run local

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abrí `http://localhost:3000` y pasá por el flujo en `/demo`.

## Demo flow

Ver `doc/DEMO-FLOW.md` para el guión paso a paso.

## Hack plan (39h)

Ver `doc/HACK-PLAN.md` para el checklist completo.

## Pitch (español)

Ver `doc/PITCH.md` para el texto del pitch.

---

## Built on WasiAI

Cobraya corre sobre infraestructura WasiAI que **ya está en producción**:

- **wasiai-a2a** — gateway A2A protocol — github.com/ferrosasfp/wasiai-a2a
- **wasiai-v2** — marketplace de agentes — github.com/ferrosasfp/wasiai-v2
- **wasiai-facilitator** — self-hosted x402 facilitator — github.com/ferrosasfp/wasiai-facilitator

Esto no es un MVP de fin de semana. Es una capa nueva sobre rails productivos con 1,660+ tests y settlements reales onchain. Ver `https://wasiai.io/evidence` para el evidence kit.

---

**Fernando Rosas** · fernando@wasiai.io · [wasiai.io](https://wasiai.io)

---

## Honestidad: starting point pre-hackathon (declaración pública)

> Cobraya se implementa durante el **Avalanche LATAM Fintech Build hackathon (15-17 mayo 2026)** siguiendo un patrón arquitectónico ya probado en [`wasiai-agentshop`](https://github.com/ferrosasfp/wasiai-agentshop) (proyecto open source previo del mismo equipo, sometido al Kite Hackathon 2026). El patrón incluye: pipeline de 3 agentes vía WasiAI A2A, settlement EIP-3009 server-side, arquitectura hexagonal-light, demo UI con 4 phases.
>
> **Estado pre-hack (antes del 15 mayo 18:00 hora MX)**: scaffold Next.js + arquitectura hexagonal-light + planning docs (este README, `BACKLOG.md`, `doc/TRANSLATION-MATRIX.md`, `doc/PITCH.md`, `doc/DEMO-FLOW.md`, `doc/HACK-PLAN.md`). Cero código de business logic de Cobraya.
>
> **Implementación durante el hack**: 3 agentes específicos (cfdi-validator, credit-scorer, lender-matcher), EIP-3009 signing server-side con TREASURY wallet, demo UI con narrativa Cobraya, registry en wasiai-v2 marketplace, integración con Anthropic Claude API para rationale narrativo.
>
> El **git history** del branch `feat/wkh-cobraya-agents` es evidencia pública verificable de qué se construyó durante las 39h del hackathon.
