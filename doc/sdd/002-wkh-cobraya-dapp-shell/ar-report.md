# AR Report — WKH-COBRAYA-DAPP-SHELL

> Date: 2026-05-16 · Reviewer: nexus-adversary (AR)
> Branch: `feat/wkh-cobraya-dapp-shell` · HEAD `5ab34ba`
> Commits: 13 (W0..W11 + DD-P fix-pack)

## Veredict

**APROBADO CON OBSERVACIONES** — 0 BLOQUEANTE-ALTO, 0 BLOQUEANTE-MEDIO, 1 BLOQUEANTE-BAJO, 3 MENORES.

The gate is open for F4 after the BLQ-BAJO is fixed; nothing here is a security or data-loss risk. DD-P fix-pack already neutralized the only real prod risk (shared `mailer_autoconfirm`). CD-34 enforced materially. Engine boundary diff empty. RLS + app-layer ownership doubled up. All 18 ACs trace to passing tests.

## Hallazgos

### BLQ-ALTO (0) · BLQ-MED (0)
None.

### BLQ-BAJO

#### BLQ-BAJO-1 — Onboarding routes inherit `TopNav` from parent `(app)/layout.tsx` (DD-D divergence)
- **Files**: `src/app/(app)/layout.tsx:7`, `src/app/(app)/onboarding/layout.tsx:1-16`, `src/components/nav/TopNav.tsx:13-55`
- **Description**: Story File DD-D + SDD §3.DD-D + Story §10 wireframe all state onboarding has its own layout WITHOUT TopNav. Implementation removed BottomTabs (via `HIDE_PREFIXES`) but TopNav has no self-hide and is rendered by the parent `(app)/layout.tsx` for every descendant — including `/onboarding/step/N`. Nested layouts wrap children, don't replace ancestors.
- **Reproduction**: signup → land on `/onboarding/step/1` → DOM shows `<header style="background: var(--luma-nav-gradient)">` with desktop tabs. Clicking "Inicio" routes to `/dashboard`, middleware bounces back to `/onboarding/step/1` (CD-28).
- **Impact**: UX inconsistency, not security. User sees nav they cannot use. Spec violation visible in screenshots.
- **Suggestion**: add `HIDE_PREFIXES` to `TopNav.tsx` mirroring `BottomTabs.tsx:6` (`/login`, `/signup`, `/auth`, `/onboarding`, `/~offline`, `===` `/`).
- **Severity rationale**: BLQ-BAJO because AC-15 is about BottomTabs (passes), middleware enforces gate, easy fix, but directly contradicts closed DD-D.

### MNR

#### MNR-1 — DD-O / DD-P / CD-34 not back-propagated to SDD / Story File
- **Files**: SDD §6.1, §8.1, Story §8.1, §9 still reference `profiles` / `settled_invoices` without prefix
- **Description**: Dev correctly renamed all tables to `cobraya_*` (DD-O) and added admin.createUser pattern (DD-P) + CD-34 (admin server-only). Documented in code comments + auto-blindaje.md but never appended to SDD/Story.
- **Suggestion**: nexus-docs in DONE phase appends `§15 — Post-implementation Decision Doc updates` with DD-O / DD-P / CD-34.
- **Severity**: MENOR (works correctly, tests assert new names).

#### MNR-2 — `loadDashboardStats` swallows DB errors silently
- **Files**: `src/lib/dashboard/stats.ts:36-46`
- **Description**: On `cobraya_settled_invoices` query failure, returns zeros without UI signal. User sees stats all-zero as if never used app.
- **Suggestion**: discriminated union `{ ok: true; stats } | { ok: false; reason }` + UI pill.
- **Severity**: MENOR (edge case, RLS still enforces DB-layer).

#### MNR-3 — `(supabase as any)` cast in `stats.ts` with eslint-disable
- **Files**: `src/lib/dashboard/stats.ts:27-28`
- **Description**: Single `as any` with eslint-disable + justification comment. Same goal achievable with structural interface.
- **Suggestion**: tighten to structural type at next refactor.
- **Severity**: MENOR.

## AC closure (18/18 verified)

| AC | Description | Evidence | Status |
|----|-------------|----------|--------|
| AC-1 | Anon → `/login` redirect | `src/middleware.ts:52-54` + test `middleware.test.ts:38-46` | PASS |
| AC-2 | Authed + pending → `/onboarding/step/1` | `src/middleware.ts:70-84` | PASS |
| AC-3 | Authed on /login → /dashboard | `src/middleware.ts:57-67` | PASS |
| AC-4 | LUM-100 signup (DD-P) | `src/actions/auth.ts:37-61` + test `auth.test.ts:65-88` | PASS |
| AC-5 | SignOut → /login | `src/actions/auth.ts:87-92` | PASS |
| AC-6 | Step 5 atomic + redirect | `src/actions/profile.ts:82-90` | PASS |
| AC-7 | Anti-bypass step skipping | `(app)/onboarding/step/[step]/page.tsx:35-36` + `lib/onboarding/resume.ts` | PASS |
| AC-8 | ProgressDots 5 dots | `components/onboarding/ProgressDots.tsx` | PASS |
| AC-9 | Dashboard stats + recents | `(app)/dashboard/page.tsx:24-87` | PASS |
| AC-10 | Negociar = demo flow port | `(app)/negociar/page.tsx:1-675`, engine diff empty | PASS |
| AC-11 | recordSettlement shape | `src/actions/settlement.ts:16-53` | PASS |
| AC-12 | Historial filtered desc | `(app)/historial/page.tsx:25-31` | PASS |
| AC-13 | RLS isolation + app-layer filter | `settlement.ts:33` + migration RLS | PASS |
| AC-14 | updateProfile upsert + `.eq('id', user.id)` | `profile.ts:113-116` | PASS |
| AC-15 | BottomTabs 4 tabs, ≥48px, safe-area | `BottomTabs.tsx:8-47` | PASS |
| AC-16 | Burgundy palette | `tailwind.config.ts` + `globals.css` | PASS |
| AC-17 | manifest theme_color `#651332` | `public/manifest.json:9` | PASS |
| AC-18 | No hardcoded supabase URL/key | grep clean | PASS |

## CD compliance (CDs 1-34)

| CD | Status | Notes |
|----|--------|-------|
| CD-1..18 | N/A (heredados) | Engine untouched |
| CD-19 engine intact | PASS | git diff on engine paths empty |
| CD-20 Server Actions, no API routes | PASS | Only src/actions/* added |
| CD-21 RLS enabled | PASS | 001_profiles.sql:18, 002_settled_invoices.sql:22 |
| CD-22 ES-MX copy | PASS | All user-facing strings |
| CD-23 mobile-first, ≥48px | PASS | BottomTabs + buttons |
| CD-24 env vars only | PASS | grep clean |
| CD-25 SW NetworkOnly for cookie routes | PASS | next.config.js:43-47 |
| CD-26 authed on auth/* → bounce | PASS | middleware.ts:57-67 |
| CD-27 anon on /(app)/* → /login | PASS | middleware.ts:52-54 |
| CD-28 incomplete onboarding bounce | PASS | middleware.ts:70-84 |
| CD-29 vi.mock pattern | PASS | All 7 new test files |
| CD-30 engine no-modify | PASS | git diff empty |
| CD-31 console.warn errorCode only | PASS | No err.message/stack in logs |
| CD-32 app-layer user_id filter | PASS | settlement.ts:33, historial:30, dashboard:50, stats:31 |
| CD-33 isValidUuidV4 reuse | PASS | settlement.ts:21-23 |
| CD-34 admin.ts server-only | PASS | grep returns only src/actions/auth.ts |

## Engine boundary check (CD-30)

`git diff main..feat/wkh-cobraya-dapp-shell --name-only -- 'src/app/api/**' 'src/core/**' 'src/infra/**' 'contracts/**' src/lib/audit-trail-composer.ts src/components/InvoiceScanner.tsx src/components/PipelineProgress.tsx src/components/TraceConsole.tsx` → **empty** ✓

DD-I engine-adjacent restyling verified clean (only Tailwind class swaps).

## Quality metrics

| Metric | Target | Actual |
|--------|--------|--------|
| Tests | ≥105 | **169/169** |
| `: any` new files | 0 | 1 (MNR-3, justified) |
| `as unknown as X` new | 0 unjustified | 0 in src/, OK in tests |
| Skipped tests | 0 | 0 |
| TODO/FIXME | 0 | 0 |
| `console.log` | 0 | 0 |
| Engine diff | empty | empty |
| Hardcoded URLs | 0 | 0 |
| Commits | 13 | 13 |
| `--no-verify` | 0 | 0 |

## Recomendación al fix-pack

**Must fix before F4**: BLQ-BAJO-1 (TopNav self-hide on onboarding) — one-file ~5 LOC change.

MNR-1 → nexus-docs (DONE phase). MNR-2, MNR-3 → backlog.
