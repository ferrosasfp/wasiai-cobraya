# Auto-Blindaje — WKH-COBRAYA-AGENTS

Catálogo de errores reales encontrados durante F3 + fix aplicado, para que futuras HUs no repitan el mismo tropiezo.

### [2026-05-15 21:13] Wave W0.5 — jsdom no provee window.matchMedia
- **Error**: tests con `@testing-library/react` fallaron porque `install-prompt.tsx` llama a `window.matchMedia("(display-mode: standalone)")` en mount, y jsdom no expone matchMedia por default.
- **Causa raíz**: vitest config sin setupFiles; jsdom-only environment carece de APIs visuales típicas (matchMedia, ResizeObserver, IntersectionObserver).
- **Fix**: agregar `tests/setup.ts` con stub `Object.defineProperty(window, "matchMedia", ...)` que retorna `{matches: false}`. Registrado en `vitest.config.ts → test.setupFiles`.
- **Aplicar en**: cualquier nuevo component que use `matchMedia`, `ResizeObserver`, `IntersectionObserver`. Si aparecen → extender `tests/setup.ts`.

### [2026-05-15 21:38] Wave W5 — viem signTypedData enforces address checksum
- **Error**: tests con `signTransferAuthorization({to: "0xAAAA..."})` fallaron con `Address "0xAAAA..." is invalid. - Address must match its checksum counterpart.`
- **Causa raíz**: viem 2.21 valida EIP-55 checksum en addresses dentro de typed data. Una address en todo-uppercase o todo-lowercase no es válida (excepto que sea válida por accidente).
- **Fix**: usar `getAddress(...)` (offline) o `cast --to-checksum-address` para precomputar la checksum correcta. Para tests fixtures: `"0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa"`.
- **Aplicar en**: cualquier address literal en tests EIP-712 (W5.5 receipts, W6 settlement). NUNCA pegues una address sin checksum válida.

### [2026-05-15 21:21] Wave W2 — Next.js route handler rejects non-handler exports
- **Error**: `npm run build` falló con `Type error: Route ".../cobraya-cfdi-validator/invoke/route.ts" does not match the required types of a Next.js Route. "__resetSeenUuids" is not a valid Route export field.`
- **Causa raíz**: Next.js 14 App Router valida que los exports de `route.ts` sean exclusivamente handler names (GET/POST/PUT/DELETE/PATCH/HEAD/OPTIONS) o `runtime`/`dynamic`/etc. Exportar un helper test-only `__resetSeenUuids` rompe el contrato.
- **Fix**: mover el state + helper a `src/lib/agent-state/validator-store.ts` (módulo separado). El route importa `isUuidSeen` / `markUuidSeen`. El test importa el reset helper directamente del módulo de state.
- **Aplicar en**: cualquier futuro route handler que necesite state o test hooks → SIEMPRE colocar el state en `src/lib/agent-state/` o `src/infra/`. NO exportar nada extra desde `route.ts`.

### [2026-05-15 23:50] FIX-PACK post-AR — DT-Q `smeWalletOverride` was an attack surface
- **Error**: `/api/settle` aceptaba `smeWalletOverride` arbitrario del request body y lo usaba como `to` de la authorization EIP-3009. Sin auth de caller, cualquiera podía drenar la treasury enviando N requests con `to=ATTACKER_WALLET`. AR lo levantó como **BLQ-ALTO-1**.
- **Causa raíz**: durante W5 se introdujo `smeWalletOverride` "por flexibilidad" para tests onchain, pero el demo siempre opera con `SME == OWNER` (Lupita). El override nunca se usó en producción y quedó como input no-validado, sin verificación de ownership ni allowlist.
- **Fix**: campo eliminado del `InputSchema`. zod por default hace strip de keys extras, así que un attacker que mande `smeWalletOverride` ve su valor silenciosamente descartado. `to` se resuelve server-side desde `OWNER_ADDRESS` (env var, single source of truth). Documentado como **DT-Q** en este auto-blindaje + cubierto por test `T-SETTLE-NO-OVERRIDE`.
- **Aplicar en**: cualquier endpoint que reciba una address en el body — si la address controla destination of funds, NO debe venir del caller. Pattern: lookup determinístico desde un identifier auth-bound (owner_id, invoice_id, etc.) → resolved server-side. Si fuera Opción B (varias invoices con distintos destinations), introducir `MOCK_INVOICES`/`getInvoiceById()` que mapea `invoiceId → borrowerAddress` server-side.

### [2026-05-15 22:08] Wave W7 — smoke E2E dependencies fuera de scope F3
- **Error**: W7 requiere `vercel deploy --prod` (sin credenciales `vercel login` en este entorno) + `INSERT INTO agents` en Supabase de wasiai-v2 (sin `SUPABASE_SERVICE_ROLE_KEY` para v2 en `.env.local` de lendable).
- **Causa raíz**: la story file documenta W7 como "deploy + SQL + smoke E2E", pero la story §16 también recuerda que CD-4 prohíbe modificar wasiai-v2 — sólo se permite el INSERT remoto, que es una operación de DBA que requiere credenciales que no están provistas a F3.
- **Fix**: F3 deja todo el codebase listo (build verde, 60 tests verdes, `/api/marketplace` funcional contra mock), documenta los blockers en este auto-blindaje + escala al orquestador. El usuario humano hace en orden: `(a)` `vercel login` + `vercel --prod` con todas las env vars de §1 (incluyendo `COBRAYA_COMMITMENTS_ADDRESS=0x5F8F8a31e51d8B2FEe0E0C2f1AffC3B4c6B12506`), `(b)` correr el SQL INSERT §14.1 contra el Supabase de wasiai-v2, `(c)` ejecutar los 3 smoke runs y pegar tx hashes en `doc/PRODUCTION-EVIDENCE.md §3`.
- **Aplicar en**: cualquier futura HU que mezcle "deploy a infra externa" con "código" en la misma wave → separar en una wave "deploy ops" (humano) y dejar F3 cubriendo sólo "código + smoke local". Si el orquestador exige W7 dentro de F3, debe proveer las credenciales antes del p4 launch.
