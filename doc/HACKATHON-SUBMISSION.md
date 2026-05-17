# Cobraya — Hackathon Submission Package

**Hackathon:** LatAm Institucional 2026
**Status:** ready to submit (copia/pega los campos de abajo en el form)

---

## Tracks postulados

| Track | Prioridad | Argumento de 1 línea |
|---|---|---|
| **RWA IFC** (Real World Assets · Inclusión Financiera y Crédito) | 🥇 Primario | Factoring agéntico convierte el CFDI mexicano en RWA accesible para PyMEs subatendidas. Combina los 3 ejes — RWA + crédito + inclusión — en un solo producto. |
| **Inclusión Financiera Digital** | 🥈 Secundario | PWA mobile-first que liquida facturas en 30 segundos, accesible desde el celular de cualquier PyME mexicana sin requerir conocimiento crypto (roadmap V1 incluye off-ramp MXN directo a cuenta bancaria). |
| **RWA** (general) | 🥉 Terciario | El CFDI hash commiteado on-chain con anti-doble-cesión por arquitectura. Roadmap V2: tokenización ERC-721 completa. |

### Por qué Cobraya encaja en RWA IFC (track primario)

El CFDI (Comprobante Fiscal Digital por Internet) es el **Real World Asset mexicano por excelencia**: firmado criptográficamente por SAT, identificable inequívocamente por UUID, legalmente endosable bajo Ley General de Títulos y Operaciones de Crédito. Cualquier sistema serio de RWA en México pasa por el CFDI.

Cobraya hace de ese CFDI un instrumento financiero accesible:

1. **RWA**: el hash del CFDI queda commiteado on-chain (`CobrayaInvoiceCommitments.sol` en Avalanche Fuji). Roadmap V2: tokenización ERC-721 completa con lifecycle (emitido → cedido → cobrado → settled).
2. **Inclusión**: target = PyMEs subatendidas por el factoring tradicional (papeleo, comités, costos del 4-8% mensual). 4.5 millones de PyMEs en México, mayoría sin acceso fácil a liquidez de capital de trabajo.
3. **Crédito**: el factoring ES crédito de corto plazo respaldado por una receivable. Los 4 lenders (Bankaool, Arkangeles, BBVA Pyme, Konfío) compiten por proveer ese crédito; gana quien ofrezca el mejor APR para la PyME.

Es el track más alineado conceptualmente — Cobraya no fue construido pensando "vamos a hacer un proyecto RWA"; fue construido pensando "vamos a resolver el problema de liquidez de Lupita usando los rieles más adecuados". Esos rieles resultan ser RWA + crédito agéntico + inclusión digital.

### Por qué Cobraya encaja en Inclusión Financiera Digital (track secundario)

- **Mobile-first PWA installable**: Lupita instala Cobraya desde Safari/Chrome en su iPhone en 2 taps. No app store, no descargas de 100MB.
- **Sin barrera crypto** (post roadmap V1): la PyME ve el monto en pesos mexicanos, recibe pesos en su cuenta CLABE. La capa USDC + Avalanche queda invisible para el usuario, visible solo para el regulador.
- **Sin papeleo**: el flujo completo se hace desde el celular, sin presencialidad bancaria.
- **30 segundos vs 7-30 días**: la diferencia entre "pagar nómina el viernes" y "perder a un empleado por falta de cash".
- **Audit trail bulletproof**: cada decisión queda registrada para que cualquier regulador, auditor o auditor interno de banco pueda verificar.

---

## Short description (≤140 chars)

> Factoraje agéntico para PyMEs mexicanas. 4 agentes IA + smart contract en Avalanche liquidan tu factura en 30 segundos.

**(127 caracteres)**

---

## Tagline / one-liner

> Tu factura, líquida en 30 segundos. Sin esperar 60 días.

---

## Project description (1–2 paragraphs)

> Cobraya es factoraje agéntico para PyMEs mexicanas. Lupita, dueña de una tortillería en Iztapalapa, le vendió a Walmart una factura de $48,500 MXN — pero el pago no le llega hasta dentro de 60 días, y no puede esperar tanto. Cobraya resuelve eso: 4 agentes de IA y un smart contract en Avalanche validan la factura, detectan doble cesión on-chain, calculan score crediticio firmado por Claude Haiku, y lanzan una subasta entre Bankaool, Arkangeles, BBVA Pyme y Konfío. La PyME recibe USDC directo en su wallet vía EIP-3009, con audit trail firmado EIP-712 listo para sandbox CNBV (Ley Fintech 2018, Art. 80).
>
> No es código de hackathon. Cobraya corre sobre infraestructura agéntica productiva: wasiai-a2a (gateway agéntico que descubre, compone, ejecuta el pipeline y paga a los agentes) y wasiai-facilitator (settlement service multi-chain), ambos en Railway prod con más de 940 tests verdes. El contrato `CobrayaInvoiceCommitments.sol` está verificado en Avalanche Fuji con consumo de gas < 80K por commit.

---

## Tech stack

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript strict + Tailwind + PWA installable |
| Smart contract | Foundry + Solidity 0.8.24 + OpenZeppelin Ownable2Step |
| Blockchain | Avalanche Fuji (ChainID 43113) |
| Settlement | USDC + EIP-3009 (gasless authorization) |
| AI | Anthropic Claude Haiku 4.5 (rationale generation, EIP-712 signed) |
| Infra agéntica | wasiai-a2a (gateway: discover + compose + pipeline + pay) + wasiai-facilitator (settlement multi-chain) — Railway prod |
| Database | Supabase (Postgres + RLS app-layer + SERVICE_ROLE ownership guard) |
| Deploy | Vercel (PWA mobile-first) |

---

## Demo URLs

| Recurso | URL |
|---|---|
| **Landing pitch** | `https://wasiai-cobraya.vercel.app/pitch` |
| **Demo en vivo público** | `https://wasiai-cobraya.vercel.app/demo` |
| **Video pitch (3 min)** | `https://www.youtube.com/watch?v=UcliO0pN-qs` |
| **GitHub repo (Cobraya)** | `https://github.com/ferrosasfp/wasiai-cobraya` |
| **GitHub repo (a2a)** | `https://github.com/ferrosasfp/wasiai-a2a` |
| **Smart contract en Snowtrace** | `https://testnet.snowtrace.io/address/0x5F8F8a31e51d8B2FEe0E0C2f1AffC3B4c6B12506` |
| **Audit trail ejemplo (JSON)** | `https://wasiai-cobraya.vercel.app/audit-example.json` |
| **Evidencia de 3 tx reales en Fuji** | `doc/FRAUD-DETECTOR-EVIDENCE.md` |

---

## Cómo recibe el SME el dinero

Pregunta frecuente de mentores: "Lupita es una tortillera en Iztapalapa — no tiene wallet crypto. ¿Cómo recibe los $940 USDC?"

### Hoy (MVP testnet)
- USDC on-chain a la wallet del SME (`OWNER` address)
- Settlement vía EIP-3009: el lender firma, el facilitator ejecuta el transfer
- USDC llega en ~5 segundos, sin gas del lado de la PyME
- En testnet el monto on-chain está capped a $0.05 USDC para no vaciar TREASURY (CD-5). El audit trail muestra ambos: `netAmountUSDC` (monto negociado real) + `deliveredAmountUSDC` (lo realmente transferido on-chain)

### Roadmap V1 (post-hackathon)
- **Integración off-ramp**: Bitso · Volabit · SPEI bridge
- La PyME ve el monto **en pesos mexicanos** en la UI
- Cobraya hace el bridge USDC → MXN automáticamente
- Lupita recibe pesos en su cuenta CLABE en T+0
- El smart contract de settlement no cambia — solo se intercala una cuenta custodia
- KYC PyME via CURP + comprobante de domicilio
- UX final: "meté tu RFC, subí tu factura, recibí pesos en tu cuenta". La capa USDC + Avalanche queda invisible para Lupita, pero el audit trail on-chain queda para el regulador

### Por qué este diseño no es bug — es feature
1. **Audit trail bulletproof** para CNBV (sandbox CNBV (Ley Fintech 2018, Art. 80)): cada settlement queda firmado on-chain
2. **Composability DeFi**: una vez que la PyME tiene USDC, puede acceder a yield, swaps, otros productos
3. **Multi-jurisdicción**: si mañana abrimos a PyMEs colombianas o brasileras, USDC es el mismo. MXN bancario es rail específico de México. USDC desacopla el rail del país

---

## Modelo de negocio (5 revenue streams)

### Per-transaction economics
| Item | Costo USD |
|---|---|
| Gas Avalanche (commitment + EIP-3009) | ~$0.13 |
| Agentes consumidos (CFDI + Fraud + Score + Match) | ~$0.07 |
| LLM (Claude Haiku rationale) | ~$0.01 |
| **Costo total por transacción** | **~$0.21** |

### Revenue streams

| # | Stream | Detalle | Ingreso por tx ($48,500 MXN típica) |
|---|---|---|---|
| 1 | **Take rate** | 1-2% del monto negociado | $9.40 USDC (1%) |
| 2 | **Lender subscription** | $500-2K USD/mes por institución (4 lenders) | n/a (recurrente) |
| 3 | **Agent gateway fee** | 15% de cada invocación que pasa por wasiai-a2a | $0.01 USDC |
| 4 | **Float / treasury yield** | 3-5% APR sobre USDC en escrow | n/a (volumétrico) |
| 5 | **Data analytics** | Credit data anonimizada → HR Ratings, Fitch, S&P MX | post año 1 |

### Margen y proyección TAM

| Variable | Año 1 | Año 3 | Año 5 |
|---|---|---|---|
| % del mercado MX que migra a agéntico | 0.01% | 0.3% | 1% |
| Volumen anual procesado | $2.4M | $72M | $240M |
| Take rate efectivo (1.2%) | $29K | $864K | $2.88M |
| + Lender subscriptions | $48K | $240K | $480K |
| + Agent marketplace + float | $5K | $80K | $400K |
| **Ingresos brutos** | **~$82K** | **~$1.2M** | **~$3.8M** |
| Costos infra | ~$24K | ~$60K | ~$180K |
| **% margen bruto** | **71%** | **95%** | **95%** |

### Frase de 30 segundos para mentor

> "Cada factura procesada nos cuesta veinte centavos. Cobramos uno punto dos por ciento del monto negociado, así que en una factura típica de mil dólares ganamos nueve. Margen noventa y siete por ciento por transacción. A escala — uno por ciento del mercado mexicano migrado a factoring agéntico en cinco años — son tres millones ochocientos mil dólares de revenue, con noventa y cinco por ciento de margen."

---

## CFDI + tokenización (roadmap V2)

### El CFDI es el corazón del factoring MX
En México, **toda venta comercial requiere un CFDI** (Comprobante Fiscal Digital por Internet) emitido por SAT. El CFDI es:
- XML firmado digitalmente por SAT
- UUID único e inmutable
- Datos: emisor RFC, receptor RFC, monto, conceptos, plazo
- Tiene el timbre fiscal (sello SAT)

**Sin CFDI no hay venta válida → no hay factura factorable.** El CFDI es legalmente el "título" — como un pagaré digital.

### Lo que Cobraya hace hoy con el CFDI
1. **CFDI Validator** parsea el XML, valida firma SAT, extrae datos
2. **Fraud Detector** hashea el CFDI completo y commitea el hash on-chain → anti doble-cesión
3. Credit Scorer + Lender Matcher trabajan sobre los datos del CFDI parseado
4. Settlement = lender paga la factura representada por ese CFDI

### Lo que viene en V2: tokenización completa
El próximo paso es **tokenizar el CFDI como NFT (ERC-721)** en Avalanche:
- Cada factura procesada → mint de NFT con `tokenId` único
- Metadata on-chain: `{ cfdiHash, amountMXN, anchorBuyer, status }`
- Lifecycle: `MINTED` → `AUCTIONED` → `SETTLED` (o `CANCELLED`)
- Owner transfers cuando un lender vende la factura a otro lender (mercado secundario)
- Burn al settlement final

### Por qué importa al regulador
Hay un movimiento concreto en México llamado **"Factura Electrónica Negociable"**: SAT y CNBV vienen empujando que las facturas cedidas queden registradas en un sistema centralizado para combatir doble cesión. Hoy ese registro es voluntario, lento y costoso de consultar.

**Cobraya propone el reemplazo descentralizado**: el smart contract `CobrayaInvoiceCommitments.sol` ya es el registro de cesiones on-chain. Tokenizar el CFDI lo lleva al siguiente nivel — trazabilidad fiscal completa, anti-fraude estructural, alignment con sandbox CNBV (Ley Fintech 2018, Art. 80) CNBV, y candidato natural a **sandbox regulatorio CNBV**.

### Roadmap concreto
- **V2 (3 meses)**: `CobrayaInvoiceNFT.sol` ERC-721 + lifecycle hooks + UI de NFT visible al SME
- **V3 (6 meses)**: mercado secundario entre lenders + indexer (Goldsky o The Graph)
- **V4 (12 meses)**: fractionalization + composability con Aave/Compound como collateral
- **V5 (12-18 meses)**: piloto CNBV + integración directa con API de SAT (auto-sync de status)

---

## Key innovations (5 differentiators)

1. **Anti doble-cesión on-chain** — `CobrayaInvoiceCommitments.sol` commitea el hash de cada CFDI antes del settlement. El mismo problema regulatorio #1 que vio CNBV en factoraje MX, resuelto en gas real ~51K por op (CD-11 cap es 80K). **3 transacciones reales verificables**: ver `doc/FRAUD-DETECTOR-EVIDENCE.md`.
2. **Subasta de lenders visible y firmada** — 4 lenders compitiendo en vivo (Bankaool, Arkangeles, BBVA Pyme, Konfío) con ofertas firmadas EIP-712. La PyME ve qué APR y qué advance rate ofrece cada uno. Gana la mejor para la PyME, no para Cobraya.
3. **Audit trail JSON canónico** firmado EIP-712 + EIP-3009 con provenance LLM trackeado. Compatible sandbox CNBV (Ley Fintech 2018, Art. 80) CNBV (trazabilidad agéntica). Ver `audit-example.json`.
4. **Settlement gasless EIP-3009** — la PyME no necesita gas nativo. USDC en su wallet en 30s, sin fricción.
5. **Production proof reel** — corre sobre wasiai-a2a (gateway agéntico: descubre, compone, ejecuta pipeline y paga a los agentes) y wasiai-facilitator (settlement service multi-chain), ambos productivos en Railway con 940+ tests verdes. No es código de hack.

---

## Market opportunity

| Métrica | Valor | Fuente |
|---|---|---|
| TAM México (factoring) | ~$24B USD/año | estimación del sector |
| PyMEs MX activas | ~4.5 millones | datos públicos INEGI |
| PyMEs MX que cierran por problemas de liquidez | ~78% | estudios de mortalidad de PyMEs |
| Migración agéntica (proyección 1%) | ~$240M USDC/año en agent fees | proyección interna |

> **Nota sobre fuentes**: las cifras son estimaciones de orden de magnitud basadas en datos públicos disponibles y discusión del sector. Para due diligence con cifras auditadas, recomendamos contratar análisis de mercado dedicado (Statista, Frost & Sullivan, o equivalente).

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
- **wasiai-a2a**: 940+ tests (la misma infra agéntica que corre en prod)
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

## FAQ del mentor

### ¿Es legal en México? ¿Tienen licencia?
Cobraya MVP corre en testnet (Avalanche Fuji) con datos sintéticos. Para producción se requiere licencia ITF (Institución de Tecnología Financiera) o IFPE (Institución de Fondos de Pago Electrónico) bajo Ley Fintech mexicana, o entrar al **sandbox regulatorio CNBV** (artículo 80 Ley Fintech). Hay 2-3 fintech mexicanas ya en sandbox con propuestas similares (Bitso, Bankaool). Plazo realista: 6-12 meses de tramitación.

### ¿Quién tiene la custodia del USDC?
En el MVP testnet, la wallet TREASURY (operada por el equipo) funciona como custodia transitoria. Para producción se requiere o bien:
(a) Custodia self-hosted (no requiere licencia adicional pero exige seguro)
(b) Partnership con custodio licenciado (Bitso, Anchorage)
(c) Modelo non-custodial puro: el lender firma directo al SME wallet sin escrow

Diseño preferido: (c) — minimiza compliance y reduce surface de ataque.

### ¿Qué pasa si la factura no se paga?
Riesgo de crédito 100% del lender, no de Cobraya. El lender hace su due diligence (con el score 0-100 + banda A-D de Cobraya como input). Si el comprador (Walmart) no paga la factura cedida, el lender tiene los mismos remedios legales que en factoring tradicional: cobro judicial, registro en buró, etc. Cobraya no asegura el riesgo — facilita el matching y la trazabilidad.

### ¿Por qué Avalanche y no Ethereum, Solana, Base?
- **Costos**: tx en Avalanche ~$0.13 vs Ethereum L1 ~$5-15. Solana cae ocasionalmente; Base es razonable pero Avalanche LATAM tiene comunidad e integraciones (Bitso, Bitso Card, Avalanche Card)
- **Finality**: 1 segundo en Avalanche vs 12+ en Ethereum vs ~2 en Solana
- **Compliance**: subnets permiten KYC integrado (relevante post-V1)
- **EVM-compatible**: reutilizamos toda la herramienta Ethereum (Foundry, OpenZeppelin, EIP-712, EIP-3009)

### ¿Quién paga el gas?
Cobraya (la wallet TREASURY del facilitator). ~$0.13 USD por transacción procesada. A escala (10K tx/día) son $1,300/día = $39K/mes, bien dentro del margen del take rate (1-2% del monto).

### ¿Cómo evitan la doble cesión?
`CobrayaInvoiceCommitments.sol` commitea el hash del CFDI on-chain antes de cualquier settlement. Si alguien intenta procesar la misma factura dos veces, el contrato revierte la segunda. Es la solución estructural al problema #1 del factoring MX (vs el registro centralizado SAT que es voluntario).

### ¿El SME necesita saber qué es crypto?
**No.** Hoy la UX requiere wallet, pero en V1 se intercala el off-ramp MXN: el SME ve pesos, recibe pesos en su cuenta CLABE, y la capa USDC + Avalanche queda invisible. El smart contract sigue corriendo por debajo — el audit trail on-chain queda para el regulador, no para el usuario final.

### ¿Por qué los lenders se subirían? ¿No prefieren su proceso actual?
Tres razones:
1. **Costos operativos**: comité humano, papeleo, scoring manual cuesta ~$50-200 USD por solicitud. Cobraya lo automatiza a $0.07.
2. **Acceso a long-tail**: hoy los lenders no atienden facturas <$100K MXN porque el costo operativo no cierra. Con Cobraya el TAM se abre hacia PyMEs más chicas.
3. **Trazabilidad pre-compliance**: cuando llegue la regulación de "factura electrónica negociable" (que viene), los lenders que ya están on-chain tendrán años de ventaja.

### ¿No están haciendo lo que ya hace Konfío / Mercado Pago?
- **Konfío** da créditos basados en historial, no factoring agéntico contra CFDI específico
- **Mercado Pago** da adelantos sobre sus propias ventas (cerrado al ecosistema MP)
- **Bankaool** hace factoring tradicional con comité y papeleo
- **Cobraya** es la primera capa **abierta + agéntica + on-chain** sobre el CFDI mexicano. Los 3 anteriores son competencia, pero también son **potenciales lenders en nuestra subasta**

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
- [x] Audit trail compliance sandbox CNBV (Ley Fintech 2018, Art. 80)
- [x] Video pitch 3 min subido a YouTube — https://www.youtube.com/watch?v=UcliO0pN-qs
- [ ] Form de submission del hackathon llenado (usar este doc como source)
- [ ] Tweet / LinkedIn de anuncio (post-submission)
