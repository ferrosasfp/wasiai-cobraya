# Cobraya — Video Pitch Script (3 min, locked to /pitch landing)

**Duración objetivo:** 180s (3:00 min)
**Audiencia:** Avalanche LATAM Fintech Build (jueces + mentores Bankaool/Arkangeles/CNBV)
**Idioma audio:** Español
**Subtítulos:** Español + Inglés (toggle en YouTube)
**Anchor visual:** `/pitch` landing page — cada acto = 1 sección, filmás scroll en orden

---

## Cómo grabar

1. **Setup**: Screen recording de `https://wasiai-cobraya.vercel.app/pitch` en desktop (1920×1080) + insertos de phone real (PWA installable) en celular.
2. **Voice-over** grabado por separado (Audacity / móvil con micro decente, sin reverb), montado encima del screen recording.
3. **Cortes** marcados con `[CUT]` — cada corte cambia plano.
4. **B-roll** marcado con `[B-ROLL: ...]`.
5. **Música**: bed cinematográfico calmo+épico (sugerencia: "Endless Motion" de Kevin MacLeod, free/CC, lo bajás de YouTube Audio Library).

---

## Acto 1 — HERO (0–15s) → Sección 1 de la landing

| t | Frase | Visual | Notas dirección |
|---|---|---|---|
| 0:00–0:03 | "México. 4.5 millones de PyMEs." | `[B-ROLL: drone Iztapalapa al amanecer]` | Música arranca suave |
| 0:03–0:06 | "Una de ellas: Lupita." | `[CUT]` Avatar de Lupita en la sección 2 de la landing (close-up) | |
| 0:06–0:10 | "Acaba de venderle $48,500 a Walmart." | `[CUT]` Phone real mostrando "$48,500" en la pantalla de subir factura | Inserto celular vertical |
| 0:10–0:15 | "El pago llega… en 60 días." | `[CUT]` Hero de la landing — titular "Tu factura, líquida en 30 segundos." entrando con fade | Beat dramático en "60 días" |

**Total acto 1:** 15s · 4 frases · ~32 palabras

---

## Acto 2 — PROBLEMA (15–45s) → Sección 2 de la landing

| t | Frase | Visual | Notas |
|---|---|---|---|
| 0:15–0:20 | "Lupita tiene que pagar nómina el viernes. No puede esperar." | Scroll a sección 2, cámara descansa en "60 días" | |
| 0:20–0:25 | "Es la realidad del 78% de las PyMEs mexicanas." | Stat "78%" hace zoom-in | |
| 0:25–0:30 | "El factoraje tradicional toma semanas. Papeleo. Comités. Intermediarios." | `[B-ROLL: stack de carpetas, fila bancaria]` | Tono crítico |
| 0:30–0:35 | "Y el mercado mueve veinticuatro mil millones de dólares al año." | Stat "$24B USD" hace zoom-in | |
| 0:35–0:40 | "Pero Lupita no llega a ese mercado." | Avatar de Lupita queda solo en pantalla, fade dark | |
| 0:40–0:45 | "Hasta hoy." | Pantalla negro → corte a logo Cobraya | Beat largo |

**Total acto 2:** 30s · 6 frases · ~52 palabras

---

## Acto 3 — LA SOLUCIÓN (45–105s) → Sección 3 de la landing — **EL CORAZÓN**

| t | Frase | Visual | Notas |
|---|---|---|---|
| 0:45–0:50 | "Cobraya. Factoraje agéntico para PyMEs mexicanas." | Logo Cobraya + tagline | Música sube |
| 0:50–0:55 | "Lupita sube la factura desde el celular. Treinta segundos después, tiene USDC en su wallet." | `[CUT]` Phone mockup del hero ejecutando el loop animado | El loop de 4s se ve completo |
| 0:55–1:00 | "Cuatro agentes. Treinta segundos. On-chain." | Scroll a sección 3, las 4 cards aparecen | |
| 1:00–1:05 | "Agente uno: valida el CFDI contra el SAT. Cero punto cero cero uno USDC." | Card 1 (CFDI Validator) — pulso verde | |
| 1:05–1:10 | "Agente dos: detecta doble cesión, en Avalanche Fuji. Cero punto cero cero cinco USDC." | Card 2 (Fraud Detector) — pulso verde | Acento en "Avalanche" |
| 1:10–1:15 | "Agente tres: calcula score crediticio, con rationale firmado por IA. Cero punto cero cinco USDC." | Card 3 (Credit Scorer) — pulso verde | |
| 1:15–1:20 | "Agente cuatro: subasta entre Bankaool, Arkangeles, BBVA y Konfío. Gana el mejor APR. Cero punto cero uno USDC." | Card 4 (Lender Matcher) — pulso verde, animación auction | Nombres de los 4 lenders se ven uno por uno |
| 1:20–1:25 | "Settlement vía EIP-3009. USDC en la wallet de Lupita." | `[CUT]` Phone con notificación push "USDC recibido" | Inserto celular |
| 1:25–1:35 | "Treinta segundos. Sin papeleo. Sin comités. Sin esperar." | Timeline horizontal de la sección 3 se anima end-to-end | Frase corta+enfática |
| 1:35–1:45 | "Y cada paso queda firmado, on-chain y verificable." | `[CUT]` Audit trail JSON descargándose | Transición a acto 4 |

**Total acto 3:** 60s · 10 frases · ~115 palabras

---

## Acto 4 — POR QUÉ ES REAL (105–150s) → Sección 4 de la landing

| t | Frase | Visual | Notas |
|---|---|---|---|
| 1:45–1:50 | "Esto no es un mockup." | Scroll a sección 4, título grande | Pausa de 1 beat |
| 1:50–2:00 | "Smart contract en Avalanche Fuji. Verificado en Snowtrace." | Badge 1 click → Snowtrace abre en split-screen | Mostrar contract address real |
| 2:00–2:10 | "Audit trail firmado EIP-712. Compatible con Circular 4/2024 de la CNBV." | Badge 2 click → JSON ejemplo se abre | "CNBV" subrayado en pantalla |
| 2:10–2:20 | "Subasta de lenders, en vivo. Cuatro instituciones reales compitiendo por la factura de Lupita." | Badge 3 click → ruta /negociar mostrando auction | |
| 2:20–2:30 | "Corre sobre wasiai-a2a y wasiai-facilitator. Infraestructura productiva. Mil seiscientos sesenta tests verdes." | Badge 4 click → GitHub repo | Acento en "productiva" |

**Total acto 4:** 45s · 5 frases · ~75 palabras

---

## Acto 5 — CIERRE (150–180s) → Sección 5 de la landing

| t | Frase | Visual | Notas |
|---|---|---|---|
| 2:30–2:40 | "El mercado mexicano de factoraje, veinticuatro mil millones de dólares, está esperando ser agéntico." | Scroll a sección 5, título grande | Música sube al climax |
| 2:40–2:50 | "Cobraya es ese rail. Sobre Avalanche." | Logo Cobraya + logo Avalanche side-by-side | |
| 2:50–2:55 | "PyMEs mexicanas, líquidas en treinta segundos." | `[CUT]` Phone real con USDC en la wallet | Sonrisa Lupita (avatar) |
| 2:55–3:00 | "¿Ya cobraste? Cobraya." | Logo final + tagline + URL `cobraya.mx` (o el dominio final) | Música cierra |

**Total acto 5:** 30s · 4 frases · ~32 palabras

---

## Resumen de timing

| Acto | Duración | Frases | Palabras | Sección landing |
|---|---|---|---|---|
| 1 — Hero | 15s | 4 | ~32 | Sección 1 |
| 2 — Problema | 30s | 6 | ~52 | Sección 2 |
| 3 — Solución | 60s | 10 | ~115 | Sección 3 |
| 4 — Real | 45s | 5 | ~75 | Sección 4 |
| 5 — Cierre | 30s | 4 | ~32 | Sección 5 |
| **TOTAL** | **180s** | **29** | **~306** | 5 secciones |

**Cadencia:** 306 palabras / 180s ≈ 1.7 wps → **ritmo cinematográfico** (más lento que conversación normal). Pausas dramáticas en acto 1 y acto 5.

---

## Checklist de filming

- [ ] Pantalla limpia: cerrar todas las pestañas que no sean `/pitch`
- [ ] Modo oscuro de OS desactivado (la landing usa paleta luma clara)
- [ ] Audio: probar voice-over en silencio absoluto, sin eco
- [ ] B-roll Iztapalapa: pedir prestado o usar archivo CC0 (Pexels search "Mexico City street market")
- [ ] Subtítulos auto-generados de YouTube + corrección manual de los 4 nombres de lenders
- [ ] Thumbnail YouTube: phone con "$940 USDC" + texto grande "30 segundos" + logo Cobraya
- [ ] Descripción del video: incluir links a `/pitch`, repo, Snowtrace contract, audit trail JSON

---

## Variantes alternas (si necesitás más corto)

### 60s teaser (Twitter / LinkedIn / DM a mentor)
- Acto 1 (15s) + primera mitad de Acto 3 (30s) + Acto 5 cierre (15s) = 60s exactos
- Hook: "Lupita esperaba 60 días por su pago. Ahora son 30 segundos." [demo del loop] "¿Ya cobraste? Cobraya."

### 90s elevator
- Acto 1 + Acto 3 completo + 1 frase de Acto 4 ("On-chain en Avalanche, verificable") + Acto 5 cierre

---

## Notas finales

- **NO leer este script de corrido como tutorial.** Es un guión cinematográfico — el voice-over respira, deja pausas, y deja que las imágenes cuenten cuando puedan.
- **NO inventar tx hashes ni cifras** que no estén en el repo / Snowtrace real. Si una stat no se puede probar, cambiala por una que sí.
- **Si te quedás sin tiempo**, grabá el 60s teaser primero. Es mejor un teaser perfecto que un 3-min apurado.
