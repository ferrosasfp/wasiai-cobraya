# Lendable — SmartFactoring agéntico para PyMEs

> Marketplace agent-native de factoraje de facturas. Validación, scoring y matching los hacen 3 agentes IA componibles vía WasiAI A2A. Settlement en USDC sobre Avalanche.

**Hackathon Build LATAM Fintech** · Avalanche · Mayo 2026 · Solo · Bankaool / Arkangeles / Oracle

---

## El problema

PyMEs mexicanas con facturas a 30/60/90 días no tienen capital de trabajo. Factoraje tradicional toma 3-7 días, requiere papeleo presencial, y el spread se queda casi entero con la financiera porque hay 4 capas humanas entre la PyME y el inversor que firma el cheque.

## La solución

Una factura entra. Tres agentes la procesan en paralelo y entregan veredicto en <60s:

1. **invoice-validator** — verifica CFDI contra el SAT (mock-Oracle), extrae monto y emisor, detecta duplicados.
2. **credit-scorer** — usa Oracle GenAI para puntuar al emisor en base a historial fiscal + buró + comportamiento de pago.
3. **lender-matcher** — busca el inversor con mejor tasa para ese perfil de riesgo en el pool de lenders activos.

Si hay match, el inversor firma una autorización gasless (EIP-3009) y nuestro facilitator settlement en USDC sobre Avalanche mainnet. La PyME recibe el cash en su wallet en segundos.

## Por qué Avalanche

- USDC nativo + finalidad sub-segundo → settlement real-time
- Sub-segundo finality permite UX de "click → cash"
- Fee predecible → la PyME ve el net amount antes de firmar
- Subnet-ready si una contraparte (banco) necesita su propio rail

## Por qué los 3 sponsors caen aquí

| Sponsor | Encaje |
|---------|--------|
| **Bankaool** | PyMEs son su core de clientes. Lendable les abre canal agéntico nuevo sin mover su core bancario. |
| **Arkangeles** | Plataforma de matching para PyMEs. Lendable es su capa de settlement onchain. |
| **Oracle** | Credit scoring corre sobre Oracle GenAI. Cada llamada del scorer paga al endpoint de Oracle. |

## Arquitectura

```
[ PyME sube CFDI ] ─→ [ Lendable UI ]
                          │
                          ▼
                  [ WasiAI A2A: /compose ]
                          │
              ┌───────────┼───────────┐
              ▼           ▼           ▼
        [validator]  [scorer]    [matcher]
            (SAT)   (Oracle AI)  (lenders)
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

- **Frontend**: Next.js 14 App Router · TypeScript strict · Tailwind
- **Agents**: 3 endpoints REST (validate / score / match) — descubiertos vía WasiAI A2A `/discover`, orquestados vía `/compose`
- **AI**: Oracle GenAI para credit scoring
- **Onchain**: viem + EIP-3009 (transferWithAuthorization) en Avalanche (Fuji para demo, mainnet code-ready)
- **Settlement**: wasiai-facilitator (self-hosted, en prod desde 2026-05)
- **Hosting**: Vercel (UI) + Railway (existing wasiai-facilitator)

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

Lendable corre sobre infraestructura WasiAI que **ya está en producción**:

- **wasiai-a2a** — gateway A2A protocol — github.com/ferrosasfp/wasiai-a2a
- **wasiai-v2** — marketplace de agentes — github.com/ferrosasfp/wasiai-v2
- **wasiai-facilitator** — self-hosted x402 facilitator — github.com/ferrosasfp/wasiai-facilitator

Esto no es un MVP de fin de semana. Es una capa nueva sobre rails productivos con 1,660+ tests y settlements reales onchain. Ver `https://wasiai.io/evidence` para el evidence kit.

---

**Fernando Rosas** · fernando@wasiai.io · [wasiai.io](https://wasiai.io)
