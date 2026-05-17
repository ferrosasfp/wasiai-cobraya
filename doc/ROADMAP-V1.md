# Cobraya — Post-Hackathon Roadmap V1 (demand-driven)

**Estado**: planificado en Jira (proyecto WKH, prefijo "HL ·") · ejecución **demand-driven** según mentor que aparezca primero post-submisión del hackathon LatAm Institucional.

**Cambio de enfoque**: el roadmap original decía "100% obligatorio". Lo evolucionamos a **ejecución bajo demanda** porque gastar 12h en código a ciegas es trabajo sin receptor. El playbook de triage ([WKH-102](https://ferrosasfp.atlassian.net/browse/WKH-102)) define qué A ejecutar según el perfil del primer mentor que se interese.

---

## Epic raíz

**[WKH-94](https://ferrosasfp.atlassian.net/browse/WKH-94)** — HL · Cobraya — Post-Hackathon Roadmap V1: production-grade agents

---

## Stories (status snapshot)

| ID | Item | Jira | Status | Esfuerzo | Cuándo ejecutar |
|---|---|---|---|---|---|
| **Triage playbook** 🆕 | Post-hack mentor triage + first-response | [WKH-102](https://ferrosasfp.atlassian.net/browse/WKH-102) | 📋 TODO | ~2h | **PRIMERO post-pitch** — define el resto |
| A1 | fraud-detector verify prod + 3 tx reales en Snowtrace | (pre-Jira) | ✅ DONE | 1.5h | pre-Jira |
| A2 | cfdi-validator: parsear XML real del SAT + Supabase dedup | [WKH-95](https://ferrosasfp.atlassian.net/browse/WKH-95) | 📋 TODO | 3.5-4h | si llega regulador / cliente PyME |
| A3-mini | lender-matcher: 1 wallet EOA (Arkangeles) firmando EIP-712 | [WKH-99](https://ferrosasfp.atlassian.net/browse/WKH-99) | 📋 TODO | 1.5h | si llega lender |
| A3 | lender-matcher: 4 EOAs reales firmando EIP-712 (extiende A3-mini) | [WKH-96](https://ferrosasfp.atlassian.net/browse/WKH-96) | 📋 TODO | 3h | si avanza la conversación con lender |
| A4 (3 opciones) | credit-scorer mejorado — **elegir UNA opción** | — | 📋 TODO | 1-2.5h | si llega regulador / investor |
| ↳ A4 original | + 5 factores (2 mocked) | [WKH-97](https://ferrosasfp.atlassian.net/browse/WKH-97) | 📋 TODO | 2-2.5h | menos defendible |
| ↳ A4-reducido | + 3 factores reales | [WKH-100](https://ferrosasfp.atlassian.net/browse/WKH-100) | 📋 TODO | ~1h | si goal es profundidad sin mocks |
| ↳ A4-alt ⭐ | audit-grade explainability del modelo actual | [WKH-101](https://ferrosasfp.atlassian.net/browse/WKH-101) | 📋 TODO | ~1.5h | si goal es defensibilidad regulatoria |
| A5 | /transparencia page pública | [WKH-98](https://ferrosasfp.atlassian.net/browse/WKH-98) | 📋 TODO | 1.5-2h | si llega investor / curioso / nadie en 30d |
| A6 | /pitch landing (varias iteraciones) | (pre-Jira) | ✅ DONE | n/a | pre-Jira |

---

## Tabla de triage (resumen del playbook WKH-102)

| Si el primer mentor es… | Story prioritaria | Tiempo total a deliverable |
|---|---|---|
| Regulador / abogado fintech (CNBV, Banxico) | **A2** + **A4-alt** | ~5.5h |
| Lender institucional (Bankaool, Arkangeles, BBVA, Konfío) | **A3-mini** + **A3** | ~4.5h |
| Investor / VC | **A5** + **A4-alt** | ~3.5h |
| Cliente PyME piloto | **A2** + **A5** | ~5.5h |
| Mentor curioso / journalist | **A5** | ~2h |
| Sin mentor en 30 días | **A2 + A5** (universales) | ~6h en background |

Templates de email + log de inbound + checklists están en [WKH-102](https://ferrosasfp.atlassian.net/browse/WKH-102).

---

## Esfuerzo estimado por escenario

| Escenario | Stories | Tiempo total |
|---|---|---|
| Regulador | WKH-102 + A2 + A4-alt | ~7.5h |
| Lender | WKH-102 + A3-mini + A3 | ~6.5h |
| Investor | WKH-102 + A5 + A4-alt | ~5.5h |
| Sin mentor (background) | WKH-102 + A2 + A5 | ~8h en 30 días |

**MUCHO menor que el ~12.5h del "100% obligatorio" anterior.** Y cada hora invertida tiene receptor identificado.

---

## Orden de ejecución recomendado

1. **WKH-102 primero** (playbook) — antes de tocar código. Define qué vamos a ejecutar.
2. **A1** ya hecho — cero acción.
3. **A2, A3-mini, A3, A4 (la elegida), A5** — en el orden que el triage indique según el primer mentor.
4. **Re-priorizar después de cada mentor** — el playbook se itera con la data real del log de inbound.

---

## Métrica de éxito (nueva, no "100% stories DONE")

1. ✅ Al menos 3 mentores triageados con el playbook activo
2. ✅ Al menos 1 mentor pidió segunda conversación / call de piloto
3. ✅ Las stories ejecutadas tuvieron receptor identificado (no se hicieron a ciegas)
4. ✅ El log de inbound tiene métricas: tiempo de respuesta, outcome, story que se ejecutó

---

## Por qué demand-driven vence "100% obligatorio"

| Eje | "100% obligatorio" | Demand-driven |
|---|---|---|
| Tiempo gastado a ciegas | 12.5h | 0h |
| Receptor identificado por story | No | Sí (por triage) |
| Métrica de éxito | "Todas DONE" (vanity) | "Mentor pidió pilot" (real) |
| Aprendizaje del mercado | Cero | Cada mentor enseña qué importa |
| Storytelling para investors | "Hicimos N stories" | "Cerramos N conversaciones reales" |

---

## Constraints transversales

- **CD-1**: TypeScript strict, sin `any`
- **CD-2**: `npm test` + `npm run build` verdes pre-merge
- **CD-4**: NO modificar `wasiai-a2a`, `wasiai-facilitator`, `wasiai-v2`
- **CD-5**: Cap `ONCHAIN_AMOUNT_CAP_USDC=0.05` honrado en cualquier settlement
- **CD-6**: NO commits con `--no-verify`
- **CD-7**: Co-Authored-By Claude en commits
- **CD-9**: NO leak de `owner_ref`, private keys, A2A_KEY hash en logs, ni nombres de mentores en docs públicos
- **CD-18**: mobile-first ≥360px, touch targets ≥48px
- **CD-30**: NO tocar `src/core/*` directamente — extender via `src/infra/` o `src/lib/`
- **WKH-53**: Ownership Guard — toda query/mutación sobre `a2a_agent_keys` filtra por `owner_ref`

---

## Mantenimiento

- Este doc se actualiza cuando una story se marca DONE en Jira o cuando cambia el orden de prioridad
- Log de inbound de mentores: `doc/MENTOR-INBOUND-LOG.md` (creado en WKH-102)
- Source of truth = Jira

**Última actualización**: 2026-05-16 (post-WKH-102 creación, cambio a demand-driven, pre-submission hackathon)
