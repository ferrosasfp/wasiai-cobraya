# Lendable · Pitch (español · 5 min)

---

## Apertura (30s)

Buenos días. Soy Fernando Rosas, fundador de WasiAI. En los próximos cinco minutos les voy a mostrar **Lendable**, una capa de factoraje agéntico para PyMEs mexicanas que settle en USDC sobre Avalanche.

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

Lendable hace lo mismo en menos de un minuto, con tres agentes IA componibles:

1. **invoice-validator** verifica el CFDI contra el SAT
2. **credit-scorer** corre sobre Oracle GenAI y puntúa al emisor
3. **lender-matcher** busca el inversor con mejor tasa en el pool activo

Si hay match, el inversor firma una autorización gasless. Nuestro facilitator paga el gas y settle en USDC sobre Avalanche.

La PyME recibe el dinero en su wallet en segundos. Sin papeleo. Sin oficinas. Sin cuatro intermediarios.

---

## Demo (90s)

[Compartir pantalla]

Voy a tomar esta factura de la Tortillería La Esperanza, que le factura $48,500 pesos a Walmart con vencimiento a 60 días.

[Click]

Ven los tres agentes corriendo en paralelo. En menos de 5 segundos:

- CFDI validado contra el SAT
- Score Oracle GenAI: banda B, score 74. El rationale dice que el anchor buyer Walmart es tier 1 y el historial está limpio.
- Match con Arkangeles Fund I, 92% advance rate, 14.5% APR.

[Click "Firmar y settle"]

Y este es el tx hash. Real. En Avalanche. Pueden verificar en Snowtrace ahora mismo.

[Mostrar Snowtrace]

La PyME recibió 2,238 USDC en su wallet. Total time: menos de un minuto.

---

## Por qué los 3 sponsors (45s)

**Bankaool**. PyMEs son su core de clientes. Lendable les abre un canal agéntico nuevo sin mover su core bancario. El banco puede listar su pool de capital aquí y los agentes hacen el matching.

**Arkangeles**. Plataforma de matching de inversores con PyMEs. Lendable es la capa de settlement onchain que les faltaba. El matching humano se vuelve agéntico.

**Oracle**. Credit scoring corre sobre Oracle GenAI. Cada llamada del scorer paga al endpoint de Oracle vía el protocolo agéntico de pagos. Oracle se convierte en proveedor de AI para una capa fintech entera.

---

## Por qué Avalanche (30s)

- USDC nativo · sin bridges · sin riesgo cross-chain
- Sub-segundo finality · el UX es "click → cash"
- Fees predecibles · la PyME ve el net amount antes de firmar
- Subnet-ready · si Bankaool quiere su propio rail privado, está listo

---

## Lo que ya está construido (30s)

Lendable corre sobre WasiAI, que ya está en producción:

- 3 servicios live en mainnet · 4 chains
- 1,660+ tests pasando
- Transacciones onchain reales verificables · ver `wasiai.io/evidence`
- Facilitator self-hosted desde el 11 de mayo

Esto no es vaporware. Es una capa fintech sobre rails que ya funcionan.

---

## Cierre (15s)

Lendable es factoraje agéntico para 4.7 millones de PyMEs mexicanas, con settlement en segundos sobre Avalanche.

Gracias. ¿Preguntas?

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
