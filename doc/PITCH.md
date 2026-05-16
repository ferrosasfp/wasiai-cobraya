# Cobraya · Pitch (versión texto — anchor del video)

> El pitch del Hackathon: LatAm Institucional es **video submission** (no en vivo).
> Este documento es el texto-ancla del que sale el voiceover del video.
> Script de producción completo en `doc/VIDEO-SCRIPT.md` (3 min, 7 scenes).
> Este pitch en texto se usa también para LinkedIn post + landing copy + slide deck PDF backup.

---

## Apertura (30s)

Buenos días. Soy Fernando Rosas, fundador de WasiAI. En los próximos cinco minutos les voy a mostrar **Cobraya**, una capa de factoraje agéntico para PyMEs mexicanas que settle en USDC sobre Avalanche.

Lo construí en este hackathon, pero corre sobre rails productivos que llevan cinco meses en mainnet. No es un MVP. Es una capa nueva sobre infraestructura que ya está pagando facturas reales.

---

## El problema (45s)

En México hay 4.7 millones de PyMEs. La mayoría factura a 30, 60, 90 días. Mientras esperan el pago, no tienen capital de trabajo. No pueden comprar materia prima, no pueden contratar, no pueden crecer.

El factoraje existe, pero el proceso tradicional es así:

- 3 a 7 días para evaluar la factura
- Papeleo presencial
- Cuatro capas humanas entre la PyME y el inversor

El spread de toda esa cadena se queda casi entero con la financiera. La PyME recibe entre 70 y 80% del valor de su factura. Y se entera **una semana después**.

---

## La solución (45s)

Cobraya hace lo mismo en menos de un minuto, con **cuatro agentes IA componibles**:

1. **cobraya-cfdi-validator** verifica shape del CFDI y el anchor buyer
2. **cobraya-fraud-detector** previene doble-cesión on-chain (Avalanche commitment)
3. **cobraya-credit-scorer** computa el score con reglas auditables y genera la narrativa con LLM
4. **cobraya-lender-matcher** devuelve una subasta entre inversores compitiendo por la factura

Si hay match, el inversor firma una autorización gasless. Nuestro facilitator paga el gas y settle en USDC sobre Avalanche.

La PyME recibe el dinero en su wallet en segundos. Sin papeleo. Sin oficinas. Sin cuatro intermediarios.

---

## Demo (90s)

[Compartir pantalla]

Voy a tomar esta factura de la Tortillería La Esperanza, que le factura $48,500 pesos a Walmart con vencimiento a 60 días.

[Click]

Ven los tres agentes corriendo en paralelo. En menos de 5 segundos:

- CFDI validado contra el registry tier-1 (Walmart confirmado)
- Hash de la factura committed on-chain en Avalanche (anti doble-cesión, problema regulatorio #1 del factoring MX)
- Credit score 74, banda B. El LLM explica en lenguaje natural: anchor buyer Walmart tier-1, plazo 60 días, sector food retail bajo riesgo
- Subasta entre 4 lenders compitiendo: Bankaool, Arkangeles, BBVA, Konfío. Mejor pick recomendado: Arkangeles Fund I, 92% advance rate, 14.5% APR
- Audit trail JSON descargable, firmado, verificable offline (CNBV Circular 4/2024 ready)

[Click "Firmar y settle"]

Y este es el tx hash. Real. En Avalanche. Pueden verificar en Snowtrace ahora mismo.

[Mostrar Snowtrace]

La PyME recibió 2,238 USDC en su wallet. Total time: menos de un minuto.

---

## Por qué los sponsors caen aquí (45s)

**Avalanche**. Es nuestra chain primaria de settlement. USDC nativo sin bridges, sub-segundo finality que habilita UX "click → cash", y subnets-ready si Bankaool o cualquier banco quiere su propio rail privado. Cobraya es agentic fintech building directly on Avalanche.

**Bankaool**. PyMEs son su core de clientes. Cobraya les abre un canal agéntico nuevo sin mover su core bancario. El banco puede listar su pool de capital aquí y los agentes hacen el matching.

**Arkangeles**. Plataforma de matching de inversores con PyMEs. Cobraya es la capa de settlement onchain que les faltaba. El matching humano se vuelve agéntico, settlement en segundos vs días.

**Sobre el AI provider**. El credit-scorer usa una arquitectura "deterministic scoring + LLM narrative" — el score se computa con reglas auditables (importante para fintech regulada), y la explicación textual se genera con LLM. Hoy usamos Anthropic Claude vía API, pero el código es provider-agnostic: drop-in compatible con Oracle GenAI, OpenAI, o cualquier provider para deploy enterprise. La pieza diferenciadora no es qué LLM se usa, es la composición agéntica + el settlement onchain.

---

## Por qué Avalanche (30s)

- USDC nativo · sin bridges · sin riesgo cross-chain
- Sub-segundo finality · el UX es "click → cash"
- Fees predecibles · la PyME ve el net amount antes de firmar
- Subnet-ready · si Bankaool quiere su propio rail privado, está listo

---

## Lo que ya está construido (30s)

Cobraya corre sobre WasiAI, que ya está en producción:

- 3 servicios live en mainnet · 4 chains
- 1,660+ tests pasando
- Transacciones onchain reales verificables · ver `wasiai.io/evidence`
- Facilitator self-hosted desde el 11 de mayo

Esto no es vaporware. Es una capa fintech sobre rails que ya funcionan.

---

## El problema regulatorio histórico (30-45s) — INSTITUTIONAL HOOK

Hoy en México, **NO existe un registry universal de facturas factorizadas**. Cada institución tiene su propio sistema interno. Una financiera NO ve si la factura que está comprando ya fue cedida en otra.

**Tres intentos previos fallaron**:
1. **SISCEA** (Sistema de Información de Cesiones de Cuentas por Cobrar) — propuesta CNBV 2018, nunca implementada por falta de consenso entre actores privados.
2. **Forum Indus Factoring Mexico** — propuestas privadas 2019-2021 — falló por competition concerns (los bancos no quieren que su competencia vea su cartera).
3. **CONDUSEF** lleva 3 años pidiendo "un registro nacional de cesiones" — sin avance por el mismo motivo.

**El resultado**: la tasa de fraude por doble-cesión en factoring no-bancario es del **3-8%** según AMEF/Banxico. Los bancos formales lo evitan con due diligence manual (lento y caro). Las fintech rápidas absorben el costo en el pricing (de ahí el 22% APR de Konfío). **El SME paga implícitamente por un fraude que el sistema no previene**.

**Por qué blockchain lo resuelve donde nadie ha podido**:

| Pregunta institucional | Respuesta con blockchain |
|---|---|
| "¿Quién opera el registry?" | **Nadie**. Smart contract autoexecutable. Sin operador político. |
| "¿Quién ve mi data?" | **Solo hashes**. RFC, UUID y monto reales viven en tu base. La chain solo ve `0xab12...`. |
| "¿Cómo confío que no manipulen?" | **No pueden**. Código público, auditable, inmutable post-deploy. |
| "¿Y si la competencia se retira?" | **No depende de nadie**. Sigue funcionando aunque desaparezcan todos los actores. |
| "¿Y la regulación?" | **CNBV Circular 4/2024** PIDE "trazabilidad agéntica" como sistema neutral. Esto LO ES. |

**La frase punzante**: *"Hoy no existe esta solución porque nadie privado pudo coordinarlo. Blockchain lo resuelve por arquitectura, no por buenas intenciones — porque no requiere consenso entre actores: el smart contract ES la coordinación."*

---

## TAM moment (20s)

| Métrica | Valor |
|---|---|
| TAM México factoring PyMEs | $24 mil millones USD/año |
| Tiempo promedio actual | 4.7 días |
| Costo promedio cobrado al SME | 7.2% del valor de la factura |
| **Cobraya settle time** | **30 segundos** |
| **Cobraya costo total al SME** | **$0.066 USDC en agent fees** |
| **Cobraya advance rate** | **92-95%** |
| Si 1% del mercado migra | $240 millones USD/año en agent fees fluyen por este rail |
| Si Bankaool integra | 4 millones de PyMEs onboarded día 1 |

## Production proof (15s)

Cobraya corre sobre **WasiAI A2A**, infraestructura que llevamos cinco meses en producción:

- **3 servicios live** en mainnet: wasiai-a2a, wasiai-facilitator, wasiai-v2
- **4 chains soportadas**: Kite Ozone (testnet+mainnet), Avalanche Fuji + C-Chain mainnet
- **1,660+ tests passing** distribuidos entre wasiai-a2a (941) + facilitator + marketplace + agentshop
- **WasiAgentShop** (primera vertical de remittances) ya submitted al Kite Hackathon — settle real con tx hashes verificables
- **Cobraya** es la **segunda vertical** sobre el mismo rail. La tercera, quien quiera.

Esto no es vaporware. Es una capa fintech sobre rails que ya funcionan.

## Cierre (10s)

Cobraya es factoraje agéntico para 4.7 millones de PyMEs mexicanas, con settlement en segundos sobre Avalanche.

WasiAI A2A es el rail abierto para que LATAM corra sus agentes sin pedirle permiso a nadie.

Gracias.

---

## Q&A — respuestas preparadas

**¿Quién pone el capital de los lenders?**
Tres fuentes: bancos como Bankaool con pools dedicados, fondos de venture debt como Arkangeles, y DAOs de yield en LATAM. El matcher elige por tasa y banda de riesgo.

**¿Qué pasa si la factura no se paga al vencimiento?**
La factura cedida es el colateral. En la V2 implementamos un seguro de incumplimiento sobre el pool de lenders (similar a Goldfinch). Para el hackathon, asumimos rate de default bajo dado que validamos el anchor buyer.

**¿Cómo cumple con la regulación mexicana?**
La operación de factoraje es legal en MX bajo la LGTOC. El settlement onchain es tema fiscal del lender, no de la PyME. Estamos en conversación con la CNBV para el caso de Bankaool.

**¿Por qué Avalanche y no Solana o Base?**
USDC nativo + ecosistema sponsors + sub-segundo finality + subnet-ready para banca corporativa. Solana tiene volatilidad de fees. Base no tiene anchor LATAM.

**¿Qué chunk del round de 5K USDC necesitan para llegar a 100 facturas reales?**
$5K USDC nos da 6 meses de runway adicional. Para 100 facturas reales lo que necesitamos es el partnership con Bankaool (que es lo que el premio del viaje habilita).

**¿Los agentes razonan? ¿Usan un loop tipo ReAct?**
No. Hoy es un pipeline lineal: validator → scorer → matcher → settle. Cada agente es un endpoint stateless que recibe input y devuelve output. La orquestación está hard-coded en el cliente, no la decide un LLM. Eso es intencional para el demo — un pipeline determinístico se demuestra en 90 segundos y no se rompe en vivo. Lo que sí tenemos es agent-native architecture: los 3 agentes son discoverables vía A2A `/discover`, componibles vía `/compose`, y pueden ser de terceros sin tocar el código de Cobraya. Esa es la tesis. Un loop ReAct con orquestador LLM es la V2 — útil cuando el scoring tenga que ramificar (ej: si banda D, llamar fraud-detector antes de match). Para MVP sería sobrearquitectura.

**¿Por qué Anthropic Claude y no Oracle GenAI / OpenAI?**
Es una decisión operacional, no arquitectónica. Para fintech regulada, lo importante es que el **score** sea auditable y determinista — eso vive en reglas codificadas en `src/core/scoring.ts`. El LLM solo genera la **narrativa explicatoria**, que es valor agregado pero no decisivo. Elegimos Claude Haiku para el demo por costo (~$0.0001/call), latencia (<1s p50), y familiaridad. El `src/infra/llm-client.ts` es un thin wrapper de 30 líneas — cambiar a Oracle GenAI o OpenAI es 5 minutos de trabajo. Para deploy enterprise con Bankaool, podemos usar Oracle GenAI en línea con su stack cloud.

**¿Cómo se previene doble-cesión hoy en MX? ¿Por qué es problema?**
Hoy NO se previene bien. Cada financiera tiene su propio sistema interno y NO ve la cartera de la competencia. SISCEA (CNBV 2018), Forum Indus Factoring (2019-2021), y CONDUSEF (2022-actualidad) han propuesto registros nacionales — todos fallaron por competition concerns: los bancos no quieren que su competencia vea su cartera. Resultado: 3-8% de fraude por doble-cesión en factoring no-bancario (AMEF/Banxico), absorbido en el pricing al SME. Blockchain lo resuelve por arquitectura — el smart contract ES el tercero neutral que ningún privado podía aceptar.

**¿Y si una factura ya cedida en otra plataforma vuelve a aparecer en Cobraya años después? ¿La búsqueda no se vuelve lenta?**
No — la búsqueda es O(1) regardless de la edad del commit. Leemos directamente del storage del smart contract (`mapping(bytes32 => Commitment)`), que es un hash table — un solo read storage instantáneo, ~150ms en Avalanche Fuji. Sea hoy o dentro de 5 años, mismo tiempo. La gente confunde "blockchain" con "log cronológico" — eso es solo para `events`/`logs`, no para storage. Nuestro design usa storage exclusivamente para queries puntuales, events solo para audit histórico (subgraph V2 si lo necesitamos).

**¿Qué pasa si dos plataformas distintas intentan committear la misma factura al mismo tiempo?**
El smart contract previene atómicamente. Aunque ambas pasen el pre-check (`isCommitted: false`), solo la primera tx que entra a un block puede escribir el state. La segunda revierte con `AlreadyCommitted(hash, ts, committer)`. Defensa en profundidad: pre-check para UX rápido, smart contract revert como garantía atómica.

**¿Cuál es la diferencia entre "agent-native" y "autónomo"?**
Agent-native = los componentes son agentes (discoverables, componibles, intercambiables). Autónomo = el sistema decide qué hacer next sin que un humano hard-codee el flow. Cobraya es agent-native pero no autónomo. Hacerlo autónomo (ReAct) es trivial técnicamente — lo difícil es no romper el determinismo del demo. Esa decisión la tomamos post-hackathon.
