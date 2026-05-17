# Cobraya — Post-Hackathon Roadmap V1

**Estado**: planificado en Jira (proyecto WKH) · pendiente de ejecutar post-submisión del hackathon LatAm Institucional (deadline 17-may-2026).

**Objetivo**: que cuando un mentor, auditor o regulador abra el repo y el demo, no encuentre claims que no estén respaldados por código real ejecutable + evidencia on-chain verificable.

---

## Epic raíz

**[WKH-94](https://ferrosasfp.atlassian.net/browse/WKH-94)** — Cobraya — Post-Hackathon Roadmap V1: production-grade agents

---

## Stories (status snapshot)

| ID | Item | Status | Esfuerzo | Riesgo |
|---|---|---|---|---|
| A1 | fraud-detector verify prod + 3 tx reales en Snowtrace | ✅ DONE | 1.5h | bajo |
| [WKH-95](https://ferrosasfp.atlassian.net/browse/WKH-95) | A2 — cfdi-validator: parsear XML real del SAT + dedup en Supabase | 📋 TODO | 3.5-4h | medio |
| [WKH-96](https://ferrosasfp.atlassian.net/browse/WKH-96) | A3 — lender-matcher: 4 EOAs reales firmando EIP-712 | 📋 TODO | 4.5-5h | medio-alto |
| [WKH-97](https://ferrosasfp.atlassian.net/browse/WKH-97) | A4 — credit-scorer: multifactor real | 📋 TODO (opcional) | 2-2.5h | bajo |
| [WKH-98](https://ferrosasfp.atlassian.net/browse/WKH-98) | A5 — /transparencia page pública | 📋 TODO | 1.5-2h | bajo |
| A6 | /pitch landing (varias iteraciones) | ✅ DONE | n/a | n/a |

**Total esfuerzo V1**: ~11-14h (A2 + A3 + A4 + A5). Sin A4 (opcional): ~9-12h.

---

## Por qué este roadmap importa

Cada uno de los 4 items cierra un gap entre "lo que el pitch dice" y "lo que el código realmente hace". Para audiencias críticas (CNBV, abogados fiscales, risk officers institucionales), estos gaps son la diferencia entre "demo de hackathon" y "producto auditable".

### A2 — el más urgente regulatorio

El pitch dice "valida con el SAT" pero hoy el agente confía en los campos parseados que le pasa el caller. Implementar parseo real + verificación criptográfica del SelloSAT convierte el claim en algo demostrable. Sin esto, en piloto CNBV el primer pedido es "muéstrenme cómo verifican el sello del SAT".

### A3 — el más urgente para partnerships con lenders

El pitch dice "4 ofertas firmadas EIP-712" pero solo hay 1 firma global del matcher. Para Bankaool / Arkangeles / BBVA en conversación seria, mostrarles que su firma sería una de 4 distintas verificables off-chain es la prueba de que el sistema acepta entrada de terceros reales.

### A4 — opcional, profundidad

Modelo crediticio actual: 4 factores. Risk officer de un banco va a preguntar por DPO, concentración de cliente, volatilidad sectorial. A4 agrega 3-5 factores más usando datos públicos / sintéticos sin requerir buró.

### A5 — el más vendedor visualmente

Página pública con histórico de todas las tx del demo, leyendo on-chain en vivo. Para un auditor regulatorio o investment officer, ver "X commits en los últimos N días" dice más que cualquier deck.

---

## Orden de ejecución sugerido

1. **A5 primero** (1.5-2h, riesgo bajo) — agrega evidencia visible sin tocar el flow del demo. Quick win.
2. **A2 segundo** (3.5-4h, riesgo medio) — el más urgente regulatoriamente.
3. **A3 tercero** (4.5-5h, riesgo medio-alto) — convierte la auction en "real". Requiere generar 4 wallets nuevas en Fuji.
4. **A4 último o skipear** (2-2.5h, riesgo bajo) — solo si hay tiempo + se proyecta conversación con risk officer formal.

**Total mínimo viable post-hackathon**: A2 + A5 = ~5.5h en un día de trabajo concentrado.

**Total completo V1**: A2 + A3 + A5 = ~9.5-11h en 2-3 días.

---

## Constraints transversales (todas las stories)

- **CD-1**: TypeScript strict, sin `any`
- **CD-2**: `npm test` + `npm run build` verdes pre-merge
- **CD-4**: NO modificar `wasiai-a2a`, `wasiai-facilitator`, `wasiai-v2`
- **CD-5**: Cap `ONCHAIN_AMOUNT_CAP_USDC=0.05` honrado en cualquier settlement
- **CD-6**: NO commits con `--no-verify`
- **CD-7**: Co-Authored-By Claude en commits
- **CD-9**: NO leak de `owner_ref`, private keys, o A2A_KEY hash en logs
- **CD-18**: mobile-first ≥360px, touch targets ≥48px
- **CD-30**: NO tocar `src/core/*` directamente — extender via `src/infra/` o `src/lib/`
- **WKH-53**: Ownership Guard — toda query/mutación sobre `a2a_agent_keys` filtra por `owner_ref` además del `id`

---

## Métrica de éxito del V1

Cuando A2 + A3 + A5 estén mergeados, cualquier mentor o auditor que abra el repo + corra el demo + lea `/transparencia` debería poder verificar end-to-end:

1. ✅ El CFDI fue validado contra el SAT (firma criptográfica)
2. ✅ El hash quedó committed on-chain en Avalanche Fuji
3. ✅ Las 4 ofertas de lenders vienen firmadas por 4 wallets distintas
4. ✅ El histórico de uso del producto es público y visible

Sin más mocks, sin claims falsos, sin teatro.

---

## Mantenimiento

Este doc se actualiza cuando una story se marca DONE en Jira. Para chequear el estado real consultá Jira directamente — este doc es snapshot, no source of truth.

**Última actualización**: 2026-05-16 (post-A1, pre-submission)
