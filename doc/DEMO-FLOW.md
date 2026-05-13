# Lendable · Demo flow (paso a paso)

Tiempo total objetivo: **90 segundos**.

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

### 0:25 — Validator

> "Primer agente: invoice-validator. Verifica el CFDI contra el SAT en menos de 2 segundos. La factura es real, no es duplicada."

[Punto verde · "DONE"]

### 0:35 — Scorer

> "Segundo agente: credit-scorer. Corre sobre Oracle GenAI. Devuelve score 74 en banda B. El rationale dice que Walmart es anchor buyer tier 1 y el historial fiscal está limpio."

[Mostrar la card de score · enfatizar el número grande "74" y el rationale]

### 0:50 — Matcher

> "Tercer agente: lender-matcher. Encuentra al mejor inversor para este perfil: Arkangeles Fund I, 92% de advance rate, 14.5% APR anual."

[Mostrar la card de match · enfatizar el "$ NN.NN USDC" net]

### 1:00 — Settle

> "Ahora el inversor firma una autorización EIP-3009 gasless. Nuestro facilitator paga el gas. Click."

[Click en "Firmar y settle"]

[Esperar 2-3s · aparece el panel verde de settled]

### 1:15 — Recibo onchain

> "Este es el tx hash. Avalanche. Real. Pueden verificar en Snowtrace."

[Click en el link del tx hash · se abre Snowtrace en la otra tab]

### 1:25 — Cierre

> "La PyME recibió USDC en su wallet. La factura quedó cedida al inversor. Total: menos de un minuto. Cero papeleo. Cero oficinas. Tres agentes y un facilitator."

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
