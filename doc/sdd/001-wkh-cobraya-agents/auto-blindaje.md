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

### [2026-05-16 00:06] FIX-PACK post-AR — BLQ-BAJO-3 silent signer failures + TypeError on null receipt
- **Error**: cuando `signReceipt` fallaba (hot key missing, RPC blip, viem version mismatch), los 4 agent routes catcheaban silenciosamente y devolvían `receipt: null`. Sin log, imposible debuggear por qué los signers stoppeaban en prod. Y el `scripts/verify-audit-trail.js` crasheaba con TypeError "Cannot read property 'message' of null" al encontrarlo — UX terrible para el verifier offline.
- **Causa raíz**: durante W5.5 priorizamos "respond agent even if audit fails" → catch silencioso. Pero "silently degrade" ≠ "silently degrade without observability". Y el verify script asumió `step.receipt` siempre presente.
- **Fix**:
  - Cada catch en los 4 agent routes ahora emite `console.warn("[cobraya-agent-receipt] signing failed:", { agentSlug, requestId, errorName })`. CD-9 compliant: NO stack trace (puede contener path local), NO `err.message` (puede contener privkey si la lib lo formattea mal — viem actually does include it).
  - `scripts/verify-audit-trail.js` ahora chequea `step.receipt === null` antes del `r.message` access, y emite `FAIL step <i>: missing receipt (signer failed at write time)`. Exit code sigue siendo 2 (verify-failed), nunca 3 (uncaught).
  - Tests T-AGENT-RECEIPT-FAIL (cfdi-validator emite el warn + receipt:null) y T-VERIFY-NULL-RECEIPT (script CLI con audit JSON con null receipt → exit 2 + "missing receipt" + sin TypeError).
- **Aplicar en**: cualquier try/catch que silencia un error de un componente "best effort" (audit logs, métricas, telemetría) — SIEMPRE meter un `console.warn` estructurado con identificadores (agent, request id, error name). Sin que sea verbose-enough para leakear stack o message. Pattern: `{agentSlug, requestId, errorName}` está bien; agregar `err.message` o `err.stack` es bug de seguridad.

### [2026-05-16 00:00] FIX-PACK post-AR — BLQ-MED-2 metadataPointer cross-anchor
- **Error**: el route `cobraya-fraud-detector/invoke` llamaba a `commitInvoice(commitmentHash, ZERO_BYTES32)` desperdiciando el segundo argumento `metadataPointer` del contrato. Resultado: el log onchain del commit no tenía manera de cross-referenciar el audit trail off-chain.
- **Causa raíz**: durante W2.5 se priorizó "deployar el contrato + lograr el primer commit" — el `metadataPointer` quedó como TODO documentado y nadie lo retomó en W5.5 cuando aparecieron los `requestId`s.
- **Fix**: `metadataPointer = keccak256(\`${requestId}:${commitmentHash}\`)` (caso normal) o `keccak256(\`anon:${commitmentHash}\`)` cuando no hay requestId. Surfaced en el output del agente para que verifiers offline puedan asserts: `assert(onchainEvent.metadataPointer == keccak256(audit.requestId + ":" + audit.step.commitmentHash))`. Test `T-FRAUD-METADATA-BOUND` captura los args de `writeContract` y confirma que (a) el campo no es ZERO_BYTES32, (b) la respuesta JSON expone el mismo valor que se mandó onchain.
- **Aplicar en**: cualquier contrato con un campo `metadata` o `memo` opcional — usar siempre un keccak256 de los identificadores off-chain relevantes para anclar la audit chain. Nunca dejarlo en ZERO_BYTES32 — eso indica "missing audit anchor" que un attacker puede confundir con "ANON commit".

### [2026-05-15 23:58] FIX-PACK post-AR — BLQ-ALTO-2 audit-trail IDOR + RFC PII leak
- **Error**: dos issues encadenados levantados por AR:
  - **A**: `/api/audit-trail/[requestId]` no validaba auth — cualquiera con un `requestId` UUID (logs, referrer, browser history) bajaba el JSON con `rfcEmisor` parcial, anchor buyer, monto, sector y un EIP-712 signed receipt — un dossier de financial PII.
  - **B**: dentro de cada agent route, el `inputForReceipt` que se persistía en `step.input` del audit JSON contenía `rfcEmisor` RAW (no masked) — el download leakeaba el RFC completo aunque la response del agente lo enmascarara.
- **Causa raíz**: durante W5.5 se priorizó el flujo offline-verifiable del audit trail (`scripts/verify-audit-trail.js`) y se asumió que el `requestId` UUID era "unguessable enough". También se asumió que el `step.input` era audit-only y nunca expondría PII. Ambos asumed-not-leak terminaron siendo leaks: el ID es enumerable (4M+ chars en logs/proxies) y el JSON descargable es leakable.
- **Fix**:
  - **Para A**: nuevo helper `src/lib/audit-auth.ts` con `signAuditToken(requestId) = HMAC-SHA256(requestId, AUDIT_AUTH_SECRET)`. Cada agent route que pusha un step adjunta una `Set-Cookie: cobraya_audit_token_<requestId>=<hmac>; HttpOnly; SameSite=Strict; Path=/api/audit-trail/<requestId>; Max-Age=3600`. La ruta GET `/api/audit-trail/[requestId]` valida `verifyAuditToken(cookie, requestId)` con `timingSafeEqual` antes del trail lookup. Mismatch → 403. AUDIT_AUTH_SECRET es nueva env var (32-byte random) y debe ir en Vercel.
  - **Para B**: cada agent route ahora produce dos copias del input: `inputForReceipt` (RAW, lo come signReceipt para preservar la integridad de inputHash y la capacidad de verify offline) e `inputForAudit` (MASKED — `rfcEmisor.slice(0,4) + "***"` consistente con `output.rfcEmisorMasked`). `pushStep` recibe `inputForAudit`. El verify script no re-hashea step.input (compara recovered signer vs step.agentSigner) → el cambio es backwards-compat para el verifier.
  - **Para BLQ-MED-1 (relacionado)**: nuevo helper `src/lib/uuid-validator.ts isValidUuidV4()`. Llamado en la ruta GET audit-trail antes de cualquier lookup, y en cada agent route antes de threading el header `x-cobraya-request-id` al audit buffer. Defiende contra CRLF injection (`poison\r\nSet-Cookie:...`) y de polución del buffer keyspace.
- **Aplicar en**:
  - Cualquier endpoint que devuelva JSON sensible keyed por un identificador "unguessable" (audit logs, settlement receipts, tax records). El opaque ID **NO basta** como auth. Patrón: bind el identifier a la session/auth del caller via HMAC cookie o user_id FK.
  - Cualquier payload que se persista en JSON descargable y contenga PII — separar `inputForReceipt` (hashing canónico para verifies) de `inputForAudit` (consumer-facing, masked). NUNCA dejar que un campo PII raw entre al `step.input` del trail.
  - Cualquier header/parámetro UUID que se use como key de Map o como filename → validar shape estricto antes (`isValidUuidV4`). Si no es UUID, 400 inmediato.

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
