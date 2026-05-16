# product-context.md — Cobraya

> [GENERATED FROM EXISTING DOCS] Auto-generado por nexus-analyst F0 en 2026-05-15.
> Fuentes: README.md + BACKLOG.md + doc/PITCH.md + doc/DEMO-FLOW.md.
> No contiene requisitos inventados — solo sintetiza lo declarado explícitamente.

---

## Propuesta de valor

**"¿Ya cobraste? Cobraya."**

Cobraya convierte facturas (CFDIs) de PyMEs mexicanas en USDC en menos de un minuto. Donde el factoraje tradicional toma 3-7 días con papeleo presencial y 4 capas humanas, Cobraya entrega el proceso en <60 segundos vía 4 agentes IA componibles + settlement onchain en Avalanche.

---

## El problema

- 4.7 millones de PyMEs en México facturan a 30/60/90 días sin capital de trabajo
- Factoraje tradicional: 3-7 días, presencial, spread absorbido por 4 intermediarios
- PyME recibe 70-80% del valor de su factura — una semana después
- Doble-cesión (ceder la misma factura a 2 financieras) es el fraude #1 en factoring MX (sin solución técnica hasta ahora)
- Regulación CNBV Circular 4/2024 pide "trazabilidad agéntica" — sin implementación estándar en la industria

---

## La solución — 4 agentes en pipeline

| Agente | Precio | Función |
|---|---|---|
| `cobraya-cfdi-validator` | $0.001 USDC | Shape check + anchor buyer tier-1 + duplicados |
| `cobraya-fraud-detector` | $0.005 USDC | Onchain commitment en `CobrayaInvoiceCommitments.sol` — previene doble-cesión |
| `cobraya-credit-scorer` | $0.05 USDC | Score determinista + rationale LLM (Claude Haiku) con fallback local |
| `cobraya-lender-matcher` | $0.01 USDC | Auction entre 4 lenders (Bankaool / Arkangeles / BBVA / Konfío) |

**Total demo cost**: $0.066 USDC por run

**Flow de ejecución**: validator → [fraud-detector || credit-scorer en paralelo] → matcher → Sign & Settle

---

## Persona principal

**Lupita** — "Tortillería La Esperanza", PyME en CDMX. Factura $48,500 MXN a Walmart MX a 60 días. No tiene capital para comprar harina mientras espera el pago. En 60 segundos recibe $44,620 MXN equiv en USDC en su wallet.

---

## CFDIs de demo (3 pre-loaded)

| PyME | Buyer | Monto MXN | Plazo | Band esperada |
|---|---|---|---|---|
| Tortillería La Esperanza | Walmart México | 48,500 | 60d | B (score 74) |
| Confecciones Nayeli | Bimbo | 28,200 | 30d | A (score 82) |
| Construcciones Hermanos Ruiz | Cemex | 156,800 | 90d | C (score 58) |

---

## Lenders en subasta (4)

| Lender | Bandas | APR | Advance | Velocidad |
|---|---|---|---|---|
| Bankaool Pool A | A, B | 14.5% | 92% | 30min |
| Arkangeles Fund I | A, B, C | 15.8% | 90% | 45min |
| BBVA SME Bridge | A only | 12.0% | 95% | 120min |
| Konfío Express | B, C, D | 22.0% | 85% | 5min |

---

## TAM y pitch institucional

- $24B/año factoring MX (CNBV 2025)
- 1% migración agéntica = $240M/año en agent fees
- Settlement en segundos vs días = ventaja competitiva visible para lenders
- CNBV Circular 4/2024 compliance = angle regulatorio real

---

## Sponsors relevantes

| Sponsor | Encaje |
|---|---|
| Avalanche | Chain primaria settlement — USDC nativo + sub-segundo finality + subnet-ready banca |
| Bankaool | PyMEs = core de clientes — canal agéntico nuevo sin tocar core bancario |
| Arkangeles | Matching humano → matching agéntico + settlement onchain en segundos |

---

## Diferenciadores vs hackathon genérico

1. **4 agentes + fraud-detector onchain** — resuelve doble-cesión, problema regulatorio #1
2. **Lender auction** — momento "competencia entre inversores" que cualquier institucional entiende
3. **Audit trail panel + JSON descargable** — CNBV Circular 4/2024 implementada literal
4. **Production proof** — wasiai.io live + 1,660+ tests + tx hashes históricos (Kite hack)
5. **PWA installable** — demo en phone real, diferenciador visual en video

---

## Modo demo (paracaídas)

`NEXT_PUBLIC_DEMO_MODE=true` corre el flujo completo con mocks deterministas, sin red ni wallets. Garantía para video pitch si Fuji RPC o facilitator fallan en vivo.

---

## Out of scope (esta versión)

- Real CFDI parsing del SAT (mockeado — V2 con `mensaje.sat.gob.mx`)
- Refunds onchain (WKH-93 backlog post-hack)
- ReAct / orquestación agéntica autónoma (pipeline lineal fijo, no LLM-planner)
- Anti-fraud para band D separado
- Mainnet deploy (código ready, requiere KYC Bankaool real)
- Dashboard de lenders
- Camera capture CFDIs
- Push notifications
- Oracle GenAI (dropeado pre-hack por riesgo de signup time-boxed)

---

## Video entregable

- 3 min cinematic, 7 scenes, voiceover ElevenLabs, subtítulos ES + EN
- YouTube unlisted → portal hackathon
- Deadline: domingo 17 mayo 06:00 hora MX
