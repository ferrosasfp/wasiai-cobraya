# Video Pitch — Cobraya (Hackathon: LatAm Institucional)

> **Format**: 3-minute video (180 sec). Submission deliverable principal.
> **Audience**: jurado del hackathon + product/risk officers de Bankaool, Arkangeles, y potencialmente CNBV.
> **Goal**: que después del video, un institucional LATAM diga "este equipo entiende el problema real, hay que llamarlos".
> **Idioma**: voiceover en **español neutro** (ElevenLabs Multilingual v2). Subtitles en español + inglés.
> **Production**: ElevenLabs TTS + CapCut Pro + Artlist music + **Chrome DevTools mobile emulation (iPhone 14 Pro 393x852)** para screen recording + phone B-roll para Scene 1 + Snowtrace tabs.
> **Mobile-first**: Cobraya es PWA installable. 78% de PyMEs MX usan smartphone como dispositivo principal (INEGI ENDUTIH 2024). El demo se ve en phone, NO en laptop.

---

## Production stack

| Tool | Uso | Cost |
|---|---|---|
| ElevenLabs Multilingual v2 | Voiceover en español neutro | ~$5 |
| CapCut Pro | Edición + auto-captions ES/EN | gratis |
| Artlist o Epidemic Sound | Música licenciada (corporate/optimistic) | $9.90 (1 track) |
| OBS Studio | Screen recording 1080p | gratis |
| ChatGPT/Claude | Captions translation EN | gratis |

**Total cost**: ~$15. Cabe sobradamente en presupuesto solo.

---

## Voice direction (ElevenLabs)

- **Voice**: "Spanish Latin American — confident, professional, warm" (audicionar 2-3 en ElevenLabs)
- **Pace**: 3.5 words/sec (el modelo no pausa como uno cree, va corrido — calibrado en el video Kite)
- **Style**: claro, autoritativo, sin venderle. Tono "este es el state of the art y nosotros lo construimos".

---

## SCENE 0 · APERTURA CINEMÁTICA (0:00 → 0:15) — 15 sec

**Visual**: Fade-in desde negro. Black screen con white text typewriter-style:

```
México · 4.7 millones de PyMEs
$24 mil millones de USD perdidos al año
en capital de trabajo
```

Música: low-tension ambient, builds slowly.

**Voiceover** (15 sec, ~52 words):

> "Cada año, las pequeñas y medianas empresas mexicanas pierden mil ochocientos millones de dólares en capital de trabajo. ¿Por qué? Porque sus facturas tardan sesenta días en cobrarse. Y el factoraje tradicional toma una semana, requiere papeleo presencial, y deja a la PyME con setenta por ciento del valor de su factura."

---

## SCENE 1 · PROBLEM HUMANIZED + PHONE INTRO (0:15 → 0:35) — 20 sec

**Visual**:
- Quick stock footage: shot de PyME mexicana (mercado, tortillería, fábrica chica) — Artgrid free tier o similar
- Overlay: "Lupita · Tortillería La Esperanza · Iztapalapa, CDMX"
- Cut to: factura física CFDI en mesa, calendario marcando "60 días"
- **Close-up (3 sec final)**: Lupita saca su smartphone del mandil — **el dispositivo del 78% de PyMEs en MX** según INEGI 2024. B-roll real phone (iPhone o Android) en hand.

**Voiceover** (20 sec, ~70 words):

> "Lupita es dueña de una tortillería en Iztapalapa. Le factura cuarenta y ocho mil quinientos pesos a Walmart México. Vencimiento, sesenta días. Pero Lupita necesita ese cash mañana, para pagar harina y mantener a sus diez empleados. Hoy, Lupita tiene dos opciones: o pide un préstamo caro a un banco que tarda semanas en aprobar, o cede su factura a una financiera que se lleva el siete por ciento del valor."

---

## SCENE 2 · SOLUTION REVEAL + ADD TO HOME SCREEN (0:35 → 0:55) — 20 sec

**Visual (0:35 → 0:43, 8 sec)**:
- Logo Cobraya fade-in centrado
- Tagline: "Factoraje agéntico · 30 segundos · settle en USDC sobre Avalanche · Instalable como app"
- Cut to architecture diagram (animated): 4 agents in a pipeline, arrow flow visual

**Visual (0:43 → 0:55, 12 sec) — INSTALL MOMENT**:
- **Close-up phone screen**: Lupita abre Safari/Chrome → escribe "lendable.wasiai.io"
- Browser muestra banner "Instalar Cobraya" (Android automático) o Lupita hace tap en Share → "Add to Home Screen" (iOS)
- Cut: app icon Cobraya aparece en home screen del phone entre otros iconos (WhatsApp, etc)
- Lupita hace tap → app abre **standalone, sin browser chrome** — looks like native app
- Splash screen Cobraya verde aparece 1 sec → carga landing

**Voiceover** (20 sec, ~70 words):

> "Cobraya hace lo mismo en menos de un minuto. Cuatro agentes de inteligencia artificial componibles. Validación del CFDI. Detección de fraude on-chain. Scoring crediticio con reglas auditables. Subasta entre múltiples inversores. Settlement gasless en USDC sobre Avalanche. Y Cobraya funciona como app — Lupita la instala en su teléfono en dos tap-s. Sin papeleo. Sin oficinas. Sin intermediarios."

---

## SCENE 3 · DEMO FLOW EN PHONE (0:55 → 2:25) — 90 sec

**Visual**: Screen recording **Chrome DevTools mobile emulation iPhone 14 Pro 393x852 viewport** de wasiai-lendable.vercel.app/demo, edited with on-screen annotations. UI se ve mobile-first: bottom sheets, vertical timeline, touch targets grandes, no horizontal scroll.

### Sub-scene 3.1: Marketplace + invoice pick (0:55 → 1:05) — 10s

- Phone screen: usuario hace tap en "Iniciar demo" (button bottom-anchored, full-width)
- Marketplace panel **vertical list** de los 4 agents: `cobraya-cfdi-validator`, `cobraya-fraud-detector`, `cobraya-credit-scorer`, `cobraya-lender-matcher` cada uno con su precio en USDC visible
- **Tap** en CFDI card "Tortillería La Esperanza · Walmart · $48,500 MXN · 60d" (full-width tap area)

**Voiceover**:
> "Lupita sube su CFDI. Cuatro agentes IA discoverables en el marketplace WasiAI. Cada uno tiene su precio en USDC. Total del análisis: seis centavos."

### Sub-scene 3.2: Agents en acción paralelo (1:00 → 1:25) — 25s

- 4-step pipeline arranca, agents van encendiéndose:
  - **Step 0** validator: 2s ✓ "CFDI válido. Walmart confirmado como anchor buyer tier-1."
  - **Step 1** fraud-detector: 4s ✓ con on-screen annotation "Hash committed onchain → tx 0xab12... [link Snowtrace]"
  - **Step 2** credit-scorer (PARALELO al fraud): 5s ✓ score grande "74 / Banda B"
  - **Step 3** matcher: 2s ✓

**Voiceover** (25 sec, ~85 words):
> "Primer agente: validator. Verifica el CFDI y confirma a Walmart como anchor buyer tier uno. Segundo agente: fraud-detector. Computa un hash criptográfico de la factura y lo committee on-chain a Avalanche. Si Lupita intenta ceder la misma factura a otra plataforma, esa transacción será rechazada. Esto resuelve el problema número uno del factoring mexicano: la doble cesión, que la Comisión Nacional Bancaria lleva años pidiendo solucionar."

### Sub-scene 3.3: Score + rationale (1:25 → 1:40) — 15s

- Card de credit-scorer muestra:
  - Score 74 grande
  - Banda B con color amber
  - Rationale text typed-out: "Anchor buyer Walmart México tier-1, plazo medio 60 días, sector food retail estable. Banda B refleja buen perfil crediticio."
  - Subtítulo small: "Score determinístico · Rationale por Claude · Provider-agnostic"

**Voiceover** (15 sec, ~52 words):
> "Tercer agente: credit-scorer. El score se computa con reglas auditables, lo que es crítico para fintech regulada. La explicación textual la genera un modelo de lenguaje. Hoy usamos Claude, pero el código es provider-agnostic — para deploy enterprise puede correr sobre Oracle GenAI o cualquier proveedor."

### Sub-scene 3.4: Lender auction (1:40 → 1:55) — 15s

- Card matcher muestra 4 lenders compitiendo, animados como bidding live:
  - Bankaool Pool A — 14.5% APR / 92% advance / 30 min settle [tier 1]
  - **Arkangeles Fund I — 14.5% APR / 92% advance / 45 min settle [★ RECOMMENDED]**
  - BBVA SME Bridge — 12.0% APR / 95% advance / 2h settle [solo Banda A]
  - Konfío Express — 22.0% APR / 85% advance / 5 min settle [last resort]

**Voiceover** (15 sec, ~50 words):
> "Cuarto agente: lender-matcher. Devuelve la subasta entre los inversores que califican para este perfil. Bankaool con su pool institucional. Arkangeles Fund I. BBVA. Konfío. Cada uno con su tasa y velocidad de settle. El SME ve la subasta y elige."

### Sub-scene 3.5: Audit trail + settle (1:55 → 2:20) — 25s

- Audit panel lateral visible con todos los receipts firmados
- Click en "Firmar y settle"
- Modal: "Settling USDC 0.05 to OWNER..."
- Después 2-3s: receipt verde con tx hash + Snowtrace link
- Open new tab: Snowtrace con la tx real (capture pre-grabado de tx real ejecutada)
- Quick zoom-in en el tx hash + amount + timestamp

**Voiceover** (25 sec, ~85 words):
> "Cada paso emite un recibo criptográficamente firmado. Al final, Lupita puede descargar el audit trail completo en JSON, verificable offline por cualquier auditor sin hablar con nosotros. Esto es lo que pide la Circular 4 del 2024 de la CNBV: trazabilidad agéntica completa. Lupita firma la autorización. Nuestro facilitator paga el gas. Y este es el tx hash. Real. En Avalanche. Verificable ahora mismo en Snowtrace."

---

## SCENE 3.6 · REGULATORY HOOK INSTITUTIONAL (2:20 → 2:30) — 10 sec extra (insertar antes de TAM)

> **NEW**: este momento es **pitch gold institucional**. Inserción entre demo flow y TAM moment.

**Visual**: Black screen brief, después un timeline animado con 3 puntos en MX:
```
2018 SISCEA propuesto    ━━━━ ❌ (CNBV no implementó)
2019 Forum Indus         ━━━━ ❌ (bancos competition concerns)
2022 CONDUSEF push       ━━━━ ❌ (sin avance)
2026 Cobraya            ━━━━ ✅ (smart contract Avalanche)
```

**Voiceover** (10 sec, ~35 words):
> "México lleva ocho años intentando crear un registro nacional de cesiones de facturas. SISCEA, Forum Indus, CONDUSEF — todos fallaron por competition concerns. El smart contract es el tercero neutral que ningún privado podía aceptar."

---

## SCENE 4 · TAM MOMENT (2:30 → 2:50) — 20 sec

**Visual**: Black screen, white text appears progressively (typewriter):

```
TAM México factoring PyMEs        $24 B USD / año
Tiempo promedio actual             4.7 días
Costo promedio cobrado al SME     7.2% de la factura

Cobraya settle time              30 segundos
Cobraya costo al SME             $0.066 USDC en fees
Cobraya advance rate              92-95%

Si 1% del mercado migra            $240 M USD / año en agent fees
Si Bankaool integra                4 millones de PyMEs onboarded día 1
```

Música: builds.

**Voiceover** (20 sec, ~65 words):
> "El mercado de factoraje para PyMEs en México son veinticuatro mil millones de dólares al año. Las PyMEs pagan en promedio siete coma dos por ciento del valor de sus facturas. Cobraya cobra seis centavos. Si solo el uno por ciento del mercado migra a este rail, fluyen doscientos cuarenta millones de dólares anuales por agentes IA en LATAM."

---

## SCENE 5 · PRODUCTION PROOF (2:50 → 3:05) — 15 sec

**Visual**: Split screen montage (3-4 cuts):
- wasiai.io loading
- GitHub repo wasiai-a2a (commits, contributors, tests passing)
- Snowtrace con tx hash anterior (kite y avalanche, fechas reales 2026-05)
- Banner: "WasiAgentShop — Kite Hackathon submission · YouTube link"
- Final: stat bar "1,660+ tests · 4 chains · 3 production services"

Música: peak.

**Voiceover** (15 sec, ~50 words):
> "Cobraya no es vaporware. Corre sobre WasiAI A2A, infraestructura que llevamos cinco meses en producción, con mil seiscientos sesenta tests, transacciones onchain reales, y cuatro chains soportadas. Cobraya es la segunda vertical en este rail. La primera fue WasiAgentShop, presentada al Kite Hackathon. La tercera, quien quiera."

---

## SCENE 6 · CLOSE / VISION (3:05 → 3:15) — 10 sec

> **Note**: video ahora es 3:15 (15 sec más vs original 3:00 — Add to Home Screen +5s + Regulatory Hook +10s). Si portal hard-cap 3:00, cuts disponibles:
> - Cut 1 (preferido): cortar 10s del TAM moment Scene 4 → quedan solo los 3 stats clave ($24B / 30 seg / $0.066) sin "If 1% migrates"
> - Cut 2: cortar 5s del install moment Scene 2 (mantener app icon visible pero no toda la flow)
> - Cut 3 (último recurso): cortar Scene 3.6 regulatory hook — PERO pierde el institutional moment más fuerte. NO RECOMENDADO.

**Visual**: Logo Cobraya + WasiAI side by side. Tagline final:

> **Cobraya · La primera vertical de factoring agéntico sobre Avalanche.**
> **WasiAI A2A · El rail abierto para que LATAM corra sus agentes.**

URLs visibles: wasiai-lendable.vercel.app · github.com/ferrosasfp/wasiai-a2a · wasiai.io

Música: outro.

**Voiceover** (5 sec, ~17 words):
> "Cobraya. Para que LATAM resuelva sus problemas de capital. Con código abierto. Y agentes que nos pagamos entre nosotros."

---

## Caption strategy (CapCut)

1. **Auto-caption** en CapCut → genera ES (matches voiceover)
2. **Manual translate** ES → EN para subtitle EN (5-10 min con Claude)
3. **Position**: bottom-centered, white text + 80% black background bar
4. **Font**: Inter o similar sans-serif legible
5. **Style toggle**: el jurado puede ver con/sin subs según preferencia

---

## On-screen text overlays (CapCut layers)

| Scene | Layer | Text | Duration |
|---|---|---|---|
| 0 | Bottom-right tiny | "Hackathon: LatAm Institucional · May 2026" | full scene |
| 1 | Bottom-left | "Lupita · Tortillería La Esperanza · CDMX" | 1.5s |
| 2 | Center | "Cobraya" (logo + tagline) | 2s |
| 3.1 | Top-right | tx cost ticker "$0.001 → $0.005 → $0.05 → $0.01 = $0.066" | running |
| 3.2 | Snowtrace popup | "✓ On-chain commitment · block 42500001" | 1.5s |
| 3.3 | Bottom-left | "Score: rules · Rationale: LLM" | 2s |
| 3.4 | Side bar | "4 lenders bidding · matcher ranks" | 3s |
| 3.5 | Center | "Audit trail · CNBV-ready" | 2s |
| 4 | All | "Numbers via INEGI 2024, CNBV factoring stats 2025" | 1s (small font) |
| 5 | All | "Production endpoints live" | 2s |
| 6 | URLs at bottom | github + vercel + wasiai.io | 5s |

---

## Recording plan (Saturday)

| Time | Task |
|---|---|
| 14:00-15:00 | Generate ElevenLabs voiceover per scene (test 2-3 voices first) |
| 15:00-16:00 | Screen recording de demo (3-5 takes para tener safety) |
| 16:00-17:00 | Find/license music + b-roll stock |
| 17:00-19:00 | First edit in CapCut: assemble scenes + voiceover sync |
| 19:00-19:30 | Captions (auto + manual EN translation) |
| 19:30-20:00 | Color grading + sound mix + final export 1080p |
| 20:00-21:00 | Upload to YouTube unlisted + verify quality on different devices |
| 21:00-22:00 | Cushion / rewatch with fresh eyes / fixes |

**Output**: 1 mp4 file 1080p H.264 + 1 YouTube link unlisted + thumbnails.

---

## Risk register (video-specific)

| Risk | Mitigation |
|---|---|
| ElevenLabs no genera voz natural en MX neutro | Test 3 voices, fallback OpenAI TTS, last resort grabarlo yo en español |
| Demo flow no funciona end-to-end pre-recording | Demo mode siempre OK; grabar con MODE=true si MODE=false rompe |
| CapCut crashea con projecto grande | Render incremental, exportar por scene si necesario |
| Música license issue | Solo usar Artlist/Epidemic con factura — no YouTube audio library random |
| Subtitle timing off-sync | CapCut auto-caption ya está bien sincronizado al 95%, ajustar manual los 5% |
| Video >3:30 con buffer | Cortar primero TAM moment si overflow (no es lo más importante) |

---

## Distribution

1. **Submission portal del hackathon** (primary)
2. **YouTube unlisted** con link en repo README + en submission
3. **LinkedIn post** post-hack (recap pitch + link)
4. **WasiAI website** (`wasiai.io/lendable` opcional, V2)
5. **Twitter thread** con link al video + repos

---

## Backup safety nets

1. **Video corto 90s** versión también disponible (subset del 3min) por si el portal limita duración
2. **GIF de 10s** del demo flow para tweets / messaging
3. **Slide deck PDF** generado del PITCH.md texto por si piden alternativa estática
