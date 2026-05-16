# CR Report — WKH-COBRAYA-DAPP-SHELL

> Date: 2026-05-16 · Reviewer: nexus-adversary (CR, paralelo a AR)
> Branch: `feat/wkh-cobraya-dapp-shell` · HEAD `5ab34ba` · base `70f0d7d` (PR #6)

## Veredict

**APROBADO CON OBSERVACIONES** — 0 BLQ-ALTO, 0 BLQ-MED, 0 BLQ-BAJO. 7 MNR (calidad / pulido). El fix-pack es opcional — no bloquea F4.

## AC closure (calidad — funcional lo dictamina F4)

Todos 18/18 con archivo:línea verificados PASS (mirror del AR — sin duplicar items, foco en calidad de código vs adversarial).

## CD compliance

| CD | Verificación | Estado |
|----|--------------|--------|
| CD-19 layer rule | grep `from '@/core'` en src/lib y src/components → empty | OK |
| CD-20 Server Actions | git diff src/app/api/ vacío de archivos nuevos | OK |
| CD-21 RLS | 001_profiles.sql:18, 002_settled_invoices.sql:22 | OK |
| CD-22 ES-MX | copias revisadas (Correo, Crear cuenta, Cuéntanos un poco más) — naturales | OK |
| CD-23 ≥48px | BottomTabs:38, login-form:51, todos button shells `min-h-[48px]` | OK |
| CD-24 env only | client/server/admin solo `process.env.*` | OK |
| CD-25 SW NetworkOnly | next.config.js:42-45 explícito | OK |
| CD-26..28 middleware bounce | middleware.ts:52-84 | OK |
| CD-29 vi.mock | todos los tests de actions+middleware usan vi.mock — cero red Supabase | OK |
| CD-31 console.warn errorCode only | shape `{ action, errorCode }` en todos los warns | OK |
| CD-32 app-layer user_id | stats.ts:31, historial:30, dashboard:50 | OK |
| CD-33 uuid v4 strict | settlement.ts:20 + test CRLF | OK |
| CD-34 admin solo en actions/ | único hit grep: `src/actions/auth.ts:5` | OK |

## Hallazgos

### BLQ-MED · BLQ-BAJO
None.

### MNR (7)

#### MNR-1 — `revalidatePath('/(app)/perfil', 'page')` con route-group en la ruta
- **Files**: `src/actions/profile.ts:124`
- **Description**: Route groups como `(app)` NO son parte de la URL pública. `/(app)/perfil` no matchea ningún path en el cache → silenciosamente no-op. La URL real es `/perfil`.
- **Funciona "por casualidad"** porque `(app)/perfil/page.tsx:7` declara `dynamic = 'force-dynamic'` → SSR re-renderiza cada request regardless.
- **Suggestion**: `revalidatePath('/perfil', 'page')` o remover la llamada (redundante con force-dynamic).
- **Severity**: MENOR — bug latente, no funcional hoy.

#### MNR-2 — Zod `step4Schema.max(9_999_999_999_99)` excede column SQL
- **Files**: `src/lib/validation/profile.ts:21-25` vs `supabase/migrations/001_profiles.sql:10`
- **Description**: Zod max = 999_999_999_999 (12 dígitos). SQL `NUMERIC(12,2)` max = 9_999_999_999.99 (10 enteros + 2 decimales). Valor entre 10B y 999B pasa Zod, falla en Postgres con `22003 numeric value out of range`. UX: "No se pudo guardar." sin contexto.
- **Suggestion**: alinear Zod `.max(9_999_999_999.99)`. Opcional: agregar `case '22003'` en `mapError`.
- **Severity**: MENOR (edge case extremo).

#### MNR-3 — `(supabase as any)` cast en `stats.ts`
- **Files**: `src/lib/dashboard/stats.ts:18,27-28`
- **Description**: Firma `StatsClient = Pick<SupabaseClient, 'from'> | unknown` se colapsa a `unknown` (union with unknown). Internamente `(supabase as any).from(...)` con eslint-disable.
- **Suggestion**: interface estructural minimal sin `as any`.
- **Severity**: MENOR (contenido a 1 función).

#### MNR-4 — `Step3Form` case-sensitive buyer dedup
- **Files**: `src/components/onboarding/step3-form.tsx:12-18`
- **Description**: "Walmart" y "walmart" se agregan como items distintos.
- **Suggestion**: `buyers.some(b => b.toLowerCase() === v.toLowerCase())`.
- **Severity**: MENOR.

#### MNR-5 — Duplicación tabs config entre `BottomTabs.tsx:8-13` y `TopNav.tsx:6-11`
- **Description**: Misma lista en ambos. Renombre rompe sincronía silenciosamente.
- **Suggestion**: extraer a `src/components/nav/tabs.config.ts`.
- **Severity**: MENOR (deuda técnica).

#### MNR-6 — Comentario faltante en hidden input pattern (`step3-form.tsx:76-81`)
- **Description**: `<input type="hidden" readOnly value={JSON.stringify(buyers)} />` funciona correctamente (FormData lee value DOM al submit) pero el patrón es no-obvio. Falta comentario explicativo.
- **Suggestion**: agregar `// hidden field driven by buyers[]; FormData reads current value on submit`.
- **Severity**: MENOR (legibilidad).

#### MNR-7 — `<style jsx>` warning en `InvoiceScanner.tsx` durante tests
- **Files**: heredado, Engine intocable §6
- **Description**: jsdom imprime warning preexistente. Cero impacto.
- **Severity**: MENOR / OUT OF SCOPE (Engine no se toca).

## DD-I restyling compliance

| Archivo | Cambios | Cumple "solo className"? |
|---------|---------|--------------------------|
| InvoiceCard.tsx | 13/13 className swaps ink→luma | SI |
| LenderAuctionPanel.tsx | 4/4 className swaps | SI |
| Settlement.tsx | 14 className swaps + remoción comentario obsoleto z-index | SI |
| AuditPanel.tsx | 4 className swaps + `fixed bottom-0` → `relative mt-6` (DD-I exception R-6 fix) | SI |
| BrandIcon.tsx | rewrite hardcoded → CSS vars (DD-K) | SI |

Cero props/handlers/state/fetch alterados. DD-I respetado 100%.

## Quality metrics

| Metric | Target | Actual |
|--------|--------|--------|
| Tests | 105+ | **169/169** (45 test files) |
| TypeScript | 0 errors | **0** (`tsc --noEmit` clean) |
| Build | green | **green** (workbox SW, 7 static, 11 dynamic) |
| `: any` count | 0 | 0 (1 `as any` justified MNR-3) |
| `as unknown as X` (non-test) | 0 | 0 |
| Duplications | 0 | 1 (MNR-5) |
| TODOs nuevos | 0 | 0 |
| `console.log` | 0 | 0 |
| Commits | 13 | 13 |

## Test patterns

| Aspecto | Estado |
|---------|--------|
| `vi.mock` con stubs createClient + createAdminClient | OK |
| Cleanup `beforeEach(vi.clearAllMocks)` | OK |
| `rejects.toThrow("REDIRECT:...")` consistente | OK |
| `// @vitest-environment node` en middleware test | OK |
| Mocks capturan args + assertean shape (no solo "se llamó") | OK |
| RTL tests cubren happy + error + edge | OK |

## Recomendación a fix-pack

**Opcional**. Cero BLQ → no obligación. Si se quiere pulir pre-merge:

1. MNR-1 revalidatePath (1 char) — 5 min
2. MNR-2 Zod max alignment — 5 min
3. MNR-3 stats.ts type refactor — 20 min
4. MNR-5 tabs config extract — 10 min
5. MNR-4/6 — opcionales, 5 min cada uno

Total opcional: ~45 min. **Ninguno bloquea F4.**
