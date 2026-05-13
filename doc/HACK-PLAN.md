# Lendable · 39h hack plan

**Evento**: Build LATAM Fintech · Avalanche · online · solo
**Inicio**: viernes 15 de mayo · 18:00 hora MX
**Cierre**: domingo 17 de mayo · 09:00 hora MX
**Premio**: 5K USDC + viaje presencial para exponer
**Sponsors**: Bankaool · Arkangeles · Oracle

---

## Pre-hack (mié 13 + jue 14)

Lo hago antes de que arranque el cronómetro, no cuenta en las 39h.

- [x] Repo scaffold con Next.js + agents skeleton + mock data
- [ ] Push inicial a github.com/ferrosasfp/wasiai-lendable
- [ ] Vercel deploy preview activo
- [ ] Oracle Cloud account verificada (al menos la consola free tier abierta)
- [ ] Wallet de demo PyME fondeada con AVAX testnet (Fuji)
- [ ] Lender wallet fondeada con USDC mock Fuji (faucet `https://faucet.circle.com`)
- [ ] Dry run completo del flujo demo en local (factura → settle Fuji → recibo)
- [ ] Slides pitch en español listas con datos reales del demo

## Día 1 — Viernes 15 (18:00 → 23:59) · 6h

**Objetivo**: kickoff + integración real con wasiai-a2a (matar el demo mode en validate/match).

- [ ] 18:00 conectar al evento + lectura final del brief
- [ ] 18:30 registrar 3 agentes (`invoice-validator`, `credit-scorer`, `lender-matcher`) en wasiai-a2a `/registry`
- [ ] 19:30 swap del client `agents.ts` de mock → real `/compose` call con `A2A_KEY`
- [ ] 21:00 conectar `credit-scorer` con Oracle GenAI real (si la API está abierta) o mantener el stub con disclaimer
- [ ] 22:00 deploy Vercel preview con env vars productivas
- [ ] 23:00 smoke test end-to-end con factura real
- [ ] 23:30 commit + sleep

## Día 2 — Sábado 16 (08:00 → 23:59) · 16h

**Objetivo**: settlement real onchain Fuji + pulido UI + arrancar pitch.

- [ ] 08:00 café + revisión del overnight feedback
- [ ] 09:00 implementar firma EIP-3009 en el cliente con viem (`signTypedData`)
- [ ] 11:00 settle real en Fuji vía wasiai-facilitator `/settle`
- [ ] 13:00 capturar primer tx hash Fuji para evidence
- [ ] 14:00 lunch
- [ ] 15:00 pulir UI demo (animaciones, colores, copy)
- [ ] 17:00 grabar video demo 90s (backup por si falla la red en vivo)
- [ ] 19:00 redactar pitch script español (5 min)
- [ ] 21:00 ensayo timing 3x
- [ ] 23:00 commit + sleep

## Día 3 — Domingo 17 (00:00 → 09:00) · 9h

**Objetivo**: bugfix + submit + pitch.

- [ ] 02:00 wake + revisar deploy + checks finales
- [ ] 03:00 contingencia si algo se rompe (rollback a demo mode si necesario)
- [ ] 05:00 último ensayo del pitch
- [ ] 06:00 submission al portal del hackathon
- [ ] 07:00 prep final del pitch + screen share check
- [ ] 09:00 pitch en vivo

---

## Reglas inviolables durante el hack

1. **No reescribir wasiai-a2a / wasiai-facilitator durante el hack.** Solo consumirlos. Si algo del facilitator no funciona en Fuji, fallback a demo mode antes que arreglarlo en vivo.
2. **TypeScript strict.** Cero `any` aunque sea hackathon.
3. **Cada commit deja el build verde.** Si rompo el build, lo arreglo antes del siguiente cambio.
4. **Demo mode siempre disponible.** El env `NEXT_PUBLIC_DEMO_MODE=true` debe permitir correr el flujo completo sin red ni wallets. Es mi paracaídas para el pitch.
5. **Si me empantano en algo más de 90 min, switcho de scope.** Mejor terminar todo en demo mode que tener una pieza real y el resto roto.

---

## Riesgos y mitigación

| Riesgo | Probabilidad | Mitigación |
|--------|--------------|-----------|
| Oracle GenAI no abre acceso a tiempo | media | mock-Oracle con disclaimer "Oracle GenAI integration ready, awaiting credentials" |
| Fuji RPC se cae | baja | switchear a Anvil local + mock USDC |
| wasiai-a2a tarda en validar agentes nuevos | baja | son míos, los registro hoy |
| Cansancio domingo 04:00 | alta | dormir 23:00 a 02:00 sábado/domingo |
| El pitch en vivo se cuelga | media | video backup de 90s grabado el sábado |

---

## Entregables hackathon

- [ ] Repo público con README + demo flow
- [ ] Vercel deploy live
- [ ] 1 tx hash real en Fuji visible en el demo
- [ ] Pitch 5 min en español
- [ ] Video backup 90s
- [ ] Slide deck (`doc/PITCH.md` → keynote)

---

## Post-hack (independientemente del resultado)

- Publicar caso de uso en blog wasiai.io
- LinkedIn post con tx hash + lessons learned
- Convertir el código de demo mode en template open source para futuros hackathons
