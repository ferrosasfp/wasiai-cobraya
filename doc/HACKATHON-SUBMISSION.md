# Cobraya — Hackathon Submission Package

**Hackathon:** LatAm Institucional 2026
**Status:** ready to submit (copia/pega los campos de abajo en el form)

---

## Short description (≤140 chars)

> Factoraje agéntico para PyMEs mexicanas. 4 agentes IA + smart contract en Avalanche liquidan tu factura en 30 segundos.

**(127 caracteres)**

---

## Tagline / one-liner

> Tu factura, líquida en 30 segundos. Sin esperar 60 días.

---

## Project description (1–2 paragraphs)

> Cobraya es factoraje agéntico para PyMEs mexicanas. Lupita, dueña de una tortillería en Iztapalapa, le vendió a Walmart una factura de $48,500 MXN — pero el pago no le llega hasta dentro de 60 días, y no puede esperar tanto. Cobraya resuelve eso: 4 agentes de IA y un smart contract en Avalanche validan la factura, detectan doble cesión on-chain, calculan score crediticio firmado por Claude Haiku, y lanzan una subasta entre Bankaool, Arkangeles, BBVA Pyme y Konfío. La PyME recibe USDC directo en su wallet vía EIP-3009, con audit trail firmado EIP-712 listo para CNBV Circular 4/2024.
>
> No es código de hackathon. Cobraya corre sobre infraestructura agéntica productiva: wasiai-a2a (marketplace de agentes multi-chain) y wasiai-facilitator (settlement service), ambos en Railway prod con más de 1660 tests verdes. El contrato `CobrayaInvoiceCommitments.sol` está verificado en Avalanche Fuji con consumo de gas < 80K por commit.

---

## Tech stack

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript strict + Tailwind + PWA installable |
| Smart contract | Foundry + Solidity 0.8.24 + OpenZeppelin Ownable2Step |
| Blockchain | Avalanche Fuji (ChainID 43113) |
| Settlement | USDC + EIP-3009 (gasless authorization) |
| AI | Anthropic Claude Haiku 4.5 (rationale generation, EIP-712 signed) |
| Infra agéntica | wasiai-a2a (marketplace) + wasiai-facilitator (settlement) — Railway prod |
| Database | Supabase (Postgres + RLS app-layer + SERVICE_ROLE ownership guard) |
| Deploy | Vercel (PWA mobile-first) |

---

## Demo URLs

| Recurso | URL |
|---|---|
| **Landing pitch** | `https://wasiai-cobraya.vercel.app/pitch` |
| **Demo en vivo público** | `https://wasiai-cobraya.vercel.app/demo` |
| **Video pitch (3 min)** | _[PENDING] subir a YouTube y pegar URL acá_ |
| **GitHub repo (Cobraya)** | `https://github.com/ferrosasfp/wasiai-cobraya` |
| **GitHub repo (a2a)** | `https://github.com/ferrosasfp/wasiai-a2a` |
| **Smart contract en Snowtrace** | `https://testnet.snowtrace.io/address/0x5F8F8a31e51d8B2FEe0E0C2f1AffC3B4c6B12506` |
| **Audit trail ejemplo (JSON)** | `https://wasiai-cobraya.vercel.app/audit-example.json` |

---

## Key innovations (5 differentiators)

1. **Anti doble-cesión on-chain** — `CobrayaInvoiceCommitments.sol` commitea el hash de cada CFDI antes del settlement. El mismo problema regulatorio #1 que vio CNBV en factoraje MX, resuelto en gas < 80K por op.
2. **Subasta de lenders visible y firmada** — 4 lenders compitiendo en vivo (Bankaool, Arkangeles, BBVA Pyme, Konfío) con ofertas firmadas EIP-712. La PyME ve qué APR y qué advance rate ofrece cada uno. Gana la mejor para la PyME, no para Cobraya.
3. **Audit trail JSON canónico** firmado EIP-712 + EIP-3009 con provenance LLM trackeado. Compatible Circular 4/2024 CNBV (trazabilidad agéntica). Ver `audit-example.json`.
4. **Settlement gasless EIP-3009** — la PyME no necesita gas nativo. USDC en su wallet en 30s, sin fricción.
5. **Production proof reel** — corre sobre wasiai-a2a (marketplace de agentes multi-chain) y wasiai-facilitator (settlement service multi-chain), ambos productivos en Railway con 1660+ tests verdes. No es código de hack.

---

## Market opportunity

| Métrica | Valor | Fuente |
|---|---|---|
| TAM México (factoring) | **$24B USD/año** | Banxico + CNBV reports 2024 |
| PyMEs MX activas | 4.5 millones | INEGI Censos Económicos |
| PyMEs MX que cierran por flujo de caja | 78% | INEGI + Asociación de Factoraje |
| Migración agéntica (proyección 1%) | $240M USDC/año en agent fees | Cálculo interno |

---

## Mock data ético

- **Lupita** es un personaje sintético compuesto. RFC mostrado en demo es enmascarado (`***010101***`).
- Los 4 lenders en la subasta (Bankaool, Arkangeles, BBVA Pyme, Konfío) son **referencias a instituciones reales del mercado MX, no partnerships activos**. Sus parámetros (APR, advance rate) son ilustrativos del rango competitivo del mercado factoring MX.
- El demo público hace settlement REAL en Avalanche Fuji (testnet), con cap `$0.05 USDC` por corrida.

---

## Team

| Rol | Persona |
|---|---|
| Founder + Engineer | Fernando Rosas — `ferrosasfp@gmail.com` |
| AI co-architect | Claude (Anthropic) — pipeline NexusAgil AUTO QUALITY |

---

## Testing footprint

- **Cobraya repo**: 189 tests automatizados (Vitest + RTL + Foundry forge)
- **wasiai-a2a**: 1660+ tests (la misma infra agéntica que corre en prod)
- **wasiai-facilitator**: 100+ tests sobre settlement multi-chain
- **Foundry coverage**: 100% lines + branches + funcs en `CobrayaInvoiceCommitments.sol`
- Lighthouse score `/pitch`: pendiente medir post-deploy final

---

## Onchain proof

- Contract address: `0x5F8F8a31e51d8B2FEe0E0C2f1AffC3B4c6B12506`
- Chain: Avalanche Fuji (43113)
- Contrato verificado en Snowtrace (CobrayaInvoiceCommitments.sol)
- Gas per commit: **< 80K** (forge-reported)
- Wallet TREASURY (lender): `0x1d024Bdb20B4c3E139B8516ed6d834a9654F21cF`
- Wallet OWNER (SME): `0x94DCDb84207724A609B17e4838936832EA59B9eD`

---

## License

MIT.

---

## Submission checklist

- [x] Landing público accesible sin login
- [x] Demo en vivo accesible sin login
- [x] Smart contract verificado en Snowtrace
- [x] Audit trail JSON canónico servido públicamente
- [x] GitHub repos abiertos y públicos
- [x] README + docs en español + inglés
- [x] Audit trail compliance CNBV Circular 4/2024
- [ ] Video pitch 3 min subido a YouTube (pendiente grabar)
- [ ] Form de submission del hackathon llenado (usar este doc como source)
- [ ] Tweet / LinkedIn de anuncio (post-submission)
