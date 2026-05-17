# Cobraya — Video Pitch Script (3:00, locked to /pitch v3 landing)

**Duración objetivo:** 180s (3:00 min)
**Audiencia:** Hackathon: LatAm Institucional (jueces + mentores Bankaool/Arkangeles/CNBV)
**Idioma audio:** Español (LatAm neutro)
**Subtítulos:** Español + Inglés (toggle YouTube)
**Anchor visual:** `https://wasiai-cobraya.vercel.app/pitch` (dark theme por defecto)
**Demo en vivo:** `https://wasiai-cobraya.vercel.app/demo`
**Tono:** narrador contando una historia real — no leyendo features. Frases que respiren, oraciones que conecten ideas.

---

## Setup antes de grabar

| Pestaña | Qué cargar | Estado pre-grabación |
|---|---|---|
| **A** (foreground) | `https://wasiai-cobraya.vercel.app/pitch` | Scroll arriba del todo, dark theme ON, refresh hard |
| **B** (background) | `https://wasiai-cobraya.vercel.app/demo` | Cargada, factura $48,500 lista para subir |
| **C** (background) | Snowtrace tx histórica | Pestaña abierta para mostrar al click final |

Audio voice-over grabado por separado (Audacity / móvil con micro decente, sin reverb). Montaje encima del screen recording.

---

## 🎬 ACTO 1 — HOOK (0:00 – 0:20)

*Visual: fade-in al hero del `/pitch`. Cámara descansa unos segundos en el H1 "Tu factura, líquida en 30 segundos." y el phone mockup cycling. Cerca del segundo 15, scroll suave a sección Problema.*

> "En México hay más de cuatro millones de PyMEs… y una de ellas es Lupita.
>
> Acaba de venderle a Walmart una factura de cuarenta y ocho mil quinientos pesos. Pero el pago no le llega hasta dentro de sesenta días — y Lupita no puede esperar tanto."

*Pausa breve antes del Acto 2. La frase "no puede esperar tanto" pesa.*

---

## 🎬 ACTO 2 — PROMESA (0:20 – 0:45)

*Visual: arrancás en la sección Problema (cards "60 días" vs "30 segundos"), scrolleás suave por Flujo (pipeline 4 fases con flechas) y Agentes (4 cards con JSON snippets) durante estos 25 segundos.*

> "Acá entra Cobraya: factoraje agéntico para PyMEs mexicanas.
>
> Cuatro agentes de inteligencia artificial trabajan junto a un smart contract en Avalanche, y liquidan la factura en treinta segundos. Cada agente tiene su precio en USDC, y cada uno deja una huella verificable on-chain."

*Énfasis en "treinta segundos". La cámara debería pasar por las cards de agentes con sus JSON snippets visibles justo cuando decís esa frase.*

---

## 🎬 ACTO 3 — LIVE DEMO (0:45 – 2:15)

*Visual: cambio de pestaña a `/demo` exactamente en el segundo 50.*

> "Pero esto no es animación. **Veámoslo correr en vivo.**"

*🔴 Cmd+Tab → pestaña `/demo`. Pausa de 1 segundo para que el juez procese el cambio.*

> "Lupita sube su factura: cuarenta y ocho mil quinientos pesos, plazo sesenta días, Walmart México como comprador."

*El CFDI carga en pantalla, los datos aparecen.*

> "El primer agente valida el CFDI — parsea el XML, verifica la firma del SAT, todo por menos de un centavo de USDC. Listo, factura confirmada."

*Agente 1 ejecuta, progress bar se llena, check verde.*

> "El segundo es el detector de fraude. Commitea el hash de la factura en Avalanche Fuji, para que nadie pueda cederla dos veces. Y miren — acá aparece la transacción real on-chain."

*🎯 Punto clave del video: el tx hash aparece. Subrayalo con el cursor. Si el juez se va a convencer de algo, es acá.*

> "El tercer agente calcula el score crediticio: ochenta sobre cien, banda A. La explicación la genera Claude Haiku y queda en el comprobante descargable firmado EIP-712."

*Score 80 / A + rationale visible.*

> "Y el cuarto agente abre la subasta. Cuatro lenders compitiendo en vivo: Bankaool, Arkangeles, BBVA Pyme y Konfío. Gana Arkangeles, con doce por ciento APR y noventa y cinco por ciento de adelanto para Lupita."

*4 lender cards visibles, Arkangeles destaca en gold.*

> "El settlement va por EIP-3009, directo a la wallet. Y queda un audit trail completo, firmado y descargable."

*Pantalla final: $940 USDC + done rows con tx clickable.*

> "Treinta segundos en total. Y todo, verificable en Snowtrace."

*Click en tx hash → Snowtrace abre en split o pestaña nueva.*

---

## 🎬 ACTO 4 — VALIDACIÓN (2:15 – 2:45)

*Visual: 🔴 vuelta a `/pitch`, scroll directo a sección Comparativa.*

> "¿Por qué hace falta esto? El factoraje tradicional toma semanas, con papeleo, comités humanos, y costos del cuatro a ocho por ciento mensual.
>
> Cobraya hace lo mismo en treinta segundos, sin papeleo, con dos a tres por ciento APR. Y no es código de hackathon — corre sobre infraestructura ya productiva: wasiai-a2a y wasiai-facilitator, con más de novecientos cuarenta tests verdes detrás."

*Visual: cursor recorre la columna "Cobraya" de la tabla comparativa (los ◆ gold). Después scroll a la sección Stack y se ven los 9 logos pasando: Avalanche, USDC, Anthropic, Next.js, Supabase, wasiai-a2a, wasiai-facilitator, Foundry, CNBV.*

---

## 🎬 ACTO 5 — CIERRE (2:45 – 3:00)

*Visual: scroll a sección Quote (blockquote serif italic).*

> "El factoring tradicional sirvió durante cincuenta años. Pero ya cumplió.
>
> Ahora es turno de los agentes."

*Pausa de 1 segundo. Scroll suave al Final CTA.*

> "Cobraya: tu factura, líquida en treinta segundos.
>
> ¿Ya cobraste? Cobraya."

*Fade out con el logo + tagline.*

---

## Resumen

| Acto | Duración | % | Pantalla | Frases |
|---|---|---|---|---|
| 1 — Hook | 20s | 11% | Landing (hero → problema) | 2 párrafos |
| 2 — Promesa | 25s | 14% | Landing (problema → flujo → agentes) | 1 párrafo |
| 3 — **Live demo** | **90s** | **50%** | **`/demo` en vivo** | **8 momentos** |
| 4 — Validación | 30s | 17% | Landing (comparativa → stack) | 1 párrafo |
| 5 — Cierre | 15s | 8% | Landing (quote → CTA final) | 2 párrafos cortos |
| **TOTAL** | **180s** | **100%** | 50% landing / 50% demo | ~325 palabras |

**Word count**: ~325 palabras / 180s ≈ 1.8 wps — cadencia cinematográfica con pausas para respirar.

---

## Variantes alternas

### 60s teaser (para Twitter / LinkedIn / DM mentor)
Acto 1 (15s) + frase clave de Acto 3 (30s con tx hash) + Acto 5 cierre (15s).
Hook: "Lupita esperaba sesenta días por su pago. Ahora son treinta segundos." [demo loop] "¿Ya cobraste? Cobraya."

### 90s elevator (mentor face-to-face)
Acto 1 + Acto 3 completo + 1 frase de Acto 4 ("on-chain, verificable") + Acto 5 cierre.

---

## Tips de delivery

- Decimales USDC → centavos. "$0.001 USDC" se vuelve "menos de un centavo". El juez se identifica con centavos, no con decimales.
- Listados de 4 cosas → "tal, tal, tal **y** tal". Siempre con "y" antes del último para que no suene a checklist.
- Antes de cada acto importante, **1 segundo de silencio**. El silencio es la única cosa que da peso a lo que viene.
- **NO leas este script de corrido como tutorial.** Es un guión cinematográfico — el voice-over respira, deja pausas, y deja que las imágenes cuenten cuando puedan.
- **NO inventes tx hashes ni cifras** que no estén en el repo / Snowtrace real. Si una stat no se puede probar, cambiala por una que sí.
- **Si te quedás sin tiempo**, grabá el 60s teaser primero. Es mejor un teaser perfecto que un 3-min apurado.

---

## Checklist de filming

- [ ] Pestañas A/B/C abiertas y cargadas (ver tabla setup arriba)
- [ ] `DEMO_MODE=false` en Vercel → fraud-detector commitea on-chain real
- [ ] Wallet TREASURY tiene AVAX gas + USDC budget para 3-5 runs
- [ ] Cronometrá Acto 3 sin grabar — el `/demo` real tiene que correr en menos de 90s. Si tarda más, optimizar antes de grabar.
- [ ] B-roll Iztapalapa (opcional, para Acto 1) — Pexels search "Mexico City sunrise"
- [ ] Bed musical — instrumental sin lyrics, calmo + épico, ~3:10 de duración. Sugerencia: "Endless Motion" de Kevin MacLeod (CC0, YouTube Audio Library)
- [ ] Subtítulos auto-generados de YouTube + corrección manual de los 4 nombres de lenders (Bankaool / Arkangeles / BBVA Pyme / Konfío)
- [ ] Thumbnail YouTube: phone con "$940 USDC" + texto grande "30 segundos" + logo Cobraya
- [ ] Descripción del video: incluir links a `/pitch`, repo, Snowtrace contract, audit trail JSON
