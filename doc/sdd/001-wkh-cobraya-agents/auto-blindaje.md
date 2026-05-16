# Auto-Blindaje — WKH-COBRAYA-AGENTS

Catálogo de errores reales encontrados durante F3 + fix aplicado, para que futuras HUs no repitan el mismo tropiezo.

### [2026-05-15 21:13] Wave W0.5 — jsdom no provee window.matchMedia
- **Error**: tests con `@testing-library/react` fallaron porque `install-prompt.tsx` llama a `window.matchMedia("(display-mode: standalone)")` en mount, y jsdom no expone matchMedia por default.
- **Causa raíz**: vitest config sin setupFiles; jsdom-only environment carece de APIs visuales típicas (matchMedia, ResizeObserver, IntersectionObserver).
- **Fix**: agregar `tests/setup.ts` con stub `Object.defineProperty(window, "matchMedia", ...)` que retorna `{matches: false}`. Registrado en `vitest.config.ts → test.setupFiles`.
- **Aplicar en**: cualquier nuevo component que use `matchMedia`, `ResizeObserver`, `IntersectionObserver`. Si aparecen → extender `tests/setup.ts`.

### [2026-05-15 21:21] Wave W2 — Next.js route handler rejects non-handler exports
- **Error**: `npm run build` falló con `Type error: Route ".../cobraya-cfdi-validator/invoke/route.ts" does not match the required types of a Next.js Route. "__resetSeenUuids" is not a valid Route export field.`
- **Causa raíz**: Next.js 14 App Router valida que los exports de `route.ts` sean exclusivamente handler names (GET/POST/PUT/DELETE/PATCH/HEAD/OPTIONS) o `runtime`/`dynamic`/etc. Exportar un helper test-only `__resetSeenUuids` rompe el contrato.
- **Fix**: mover el state + helper a `src/lib/agent-state/validator-store.ts` (módulo separado). El route importa `isUuidSeen` / `markUuidSeen`. El test importa el reset helper directamente del módulo de state.
- **Aplicar en**: cualquier futuro route handler que necesite state o test hooks → SIEMPRE colocar el state en `src/lib/agent-state/` o `src/infra/`. NO exportar nada extra desde `route.ts`.
