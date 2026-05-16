# Cobraya · Demo flow (paso a paso) — v2

> **Update 2026-05-15**: el pitch es **video submission** (no live). Tiempo total objetivo del flow visible en video: **90 segundos** del Scene 3 (de los 180 sec totales del video). Ver `doc/VIDEO-SCRIPT.md` para el script completo de 7 escenas.
> **v2 flow** incluye 4 agentes (con fraud-detector onchain) y auction visible.

---

## Setup pre-demo (hacer antes de empezar)

- Browser en `https://wasiai-lendable.vercel.app/demo` (o `localhost:3010/demo` si es local)
- Segunda tab abierta en `https://testnet.snowtrace.io/`
- DevTools cerradas
- Notificaciones del sistema silenciadas
- Verificar que `NEXT_PUBLIC_DEMO_MODE=false` si quiero pegarle a la cadena de verdad. `true` si voy a usar el path de demostración determinista.

---

## Guion narrado

### 0:00 — Entrada

> "Voy a tomar una factura de una PyME mexicana, La Tortillería La Esperanza, que le factura $48,500 pesos a Walmart con vencimiento a 60 días."

[Click en la primera tarjeta · Tortillería La Esperanza]

### 0:10 — Pipeline arranca

> "En cuanto hago click, tres agentes IA arrancan en paralelo. Los descubrió WasiAI A2A en su `/discover` y los orquestó con un solo `/compose`."

[Los tres bullets verdes se encienden uno por uno · ~3 segundos]

### 0:25 — Validator (Step 0)

> "Primer agente: cobraya-cfdi-validator. Verifica el shape del CFDI y confirma que Walmart está en nuestro registry de anchor buyers tier-1. Menos de 2 segundos."

[Punto verde · "DONE"]

### 0:30 — Fraud detector + Scorer en paralelo (Step 1 + Step 2)

> "Segundo y tercer agentes corren en paralelo. fraud-detector computa un hash criptográfico de la factura y lo committee on-chain a Avalanche — si Lupita intenta ceder la misma factura a otra plataforma, esa transacción será rechazada. Esto resuelve el problema número uno del factoring mexicano: la doble cesión."

[Mostrar tx hash del commitment apareciendo en panel · Snowtrace link]

> "En paralelo, credit-scorer devuelve score 74 en banda B. El score se computa con reglas auditables — anchor buyer tier-1, plazo 60 días, sector food retail. El rationale lo genera un LLM en lenguaje natural: 'Anchor buyer Walmart México tier-1, plazo medio de 60 días, sector food retail estable. Banda B refleja buen perfil crediticio.'"

[Mostrar la card de score · enfatizar el número grande "74" y el rationale]

### 0:50 — Matcher con auction (Step 3)

> "Cuarto agente: cobraya-lender-matcher. Devuelve la subasta entre los inversores que califican para este perfil de riesgo: Bankaool, Arkangeles Fund I, BBVA y Konfío Express. Cada uno con su tasa, advance rate, y velocidad de settle. El SME ve la subasta completa y elige; el sistema recomienda Arkangeles Fund I, 92% advance rate, 14.5% APR anual, por el mejor combined score."

[Mostrar el panel auction con 4 lenders rankeados, star en Arkangeles]

[Mostrar la card de match · enfatizar el "$ NN.NN USDC" net]

### 1:00 — Settle

> "Ahora el inversor firma una autorización EIP-3009 gasless. Nuestro facilitator paga el gas. Click."

[Click en "Firmar y settle"]

[Esperar 2-3s · aparece el panel verde de settled]

### 1:15 — Recibo onchain

> "Este es el tx hash. Avalanche. Real. Pueden verificar en Snowtrace."

[Click en el link del tx hash · se abre Snowtrace en la otra tab]

### 1:20 — Audit trail download

> "Cada paso del flow emite un recibo criptográficamente firmado con EIP-712. Lupita puede descargar el audit trail completo en JSON, verificable offline por cualquier auditor sin hablar con Cobraya. Esto es lo que pide la Circular 4 del 2024 de la CNBV: trazabilidad agéntica completa."

[Click en "Descargar audit trail JSON" · file downloads]

### 1:30 — Cierre

> "La PyME recibió USDC en su wallet. La factura quedó cedida al inversor y registrada onchain. Total: menos de un minuto. Cero papeleo. Cero oficinas. Cuatro agentes, una subasta, un commitment onchain, un facilitator, y un audit trail."

---

## Variantes del demo

### Variante 1 — modo seguro (paracaídas)

Si la red falla o Vercel está down:
- Levantar `localhost:3010` con `NEXT_PUBLIC_DEMO_MODE=true`
- Todo corre con mocks, deterministico, sin red
- El tx hash es random pero la UX es idéntica
- En la narración, decir "este es nuestro modo demo determinístico" si me preguntan

### Variante 2 — modo real Fuji

`NEXT_PUBLIC_DEMO_MODE=false` + wallets fondeadas + Fuji RPC up:
- El tx hash es real y verificable
- Tiempo extra ~5-8 segundos por confirmación de bloque
- Tip: empezar la narración del Q&A antes de que confirme, no esperar en silencio

### Variante 3 — modo mainnet (solo si lo piden)

`AVALANCHE_CHAIN_ID=43114` + USDC real + lender wallet con USDC mainnet:
- Lo activo solo si hay tiempo y el panel lo pide
- Demuestra que el código no cambia, solo el env

---

## Q&A típica del demo

**¿Cuánto demoraron los 3 agentes en correr?**
3-4 segundos en demo mode, ~8 segundos contra prod real (red incluida).

**¿Los agentes son tuyos o de terceros?**
Los tres son míos para el hackathon. La arquitectura permite que sean de terceros (el matcher podría ser de Arkangeles, el scorer de Oracle, etc.). Esa es la tesis de WasiAI A2A.

**¿Qué pasa si la factura está chueca?**
El validator devuelve `isValid: false` y el pipeline aborta antes de pedirle al scorer que gaste un call de Oracle. Eso es composición agéntica con short-circuit.

**¿Y si no hay lender que matchee?**
El matcher devuelve `null` y la UI muestra "No hay inversor disponible · tu factura quedó en cola." En la V2 esto dispara un alert a lenders del pool.

---

## Checklist 60 segundos antes del demo

- [ ] Vercel deploy URL abierta y respondiendo
- [ ] Snowtrace tab abierta
- [ ] Sound notifications off
- [ ] Wifi check
- [ ] Reload del `/demo` para limpiar estado anterior
- [ ] Wallet del lender con USDC suficiente (si modo real)
