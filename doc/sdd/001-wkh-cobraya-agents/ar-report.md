# AR Report — WKH-COBRAYA-AGENTS

> Date: 2026-05-15 · Reviewer: nexus-adversary
> Branch: `feat/wkh-cobraya-agents` (tip `ff3a2cf`)

## Veredict
**RECHAZADO** — 2 BLQ-ALTO + 2 BLQ-MED + 3 BLQ-BAJO + 5 MENORs. Production tx hashes en Snowtrace **verificados reales** vía Fuji RPC (no fraud en evidence). El smart contract es sólido. Bloqueantes concentrados en: (1) treasury drain via attacker-controlled wallet redirect en `/api/settle`, (2) IDOR en `/api/audit-trail/[requestId]` que leakea rfcEmisor unmasked.

## Bloqueantes (deben fixearse pre-DONE)

### BLQ-ALTO-1 — Treasury drain via `smeWalletOverride` en `/api/settle`
**Archivos**: `src/app/api/settle/route.ts:18-20, 105-111`, `src/infra/eip3009-signer.ts:40-81`

`/api/settle` acepta `smeWalletOverride` arbitrario sin auth, sin allowlist, sin link a audit trail / requestId / lender. TREASURY_PRIVATE_KEY firma EIP-3009 con `to = smeWalletOverride`, facilitator broadcastea onchain. Cap $0.05 USDC es único barrier — pero N llamadas paralelas = drain TREASURY hasta agotar.

**Reproducción** (live PROD):
```bash
ATTACKER=0xDeadBeef0000000000000000000000000000DEAD
for i in $(seq 1 100); do
  curl -sX POST https://wasiai-cobraya.vercel.app/api/settle \
    -H 'Content-Type: application/json' \
    -d "{\"match\":{\"lenderId\":\"x\",\"lenderName\":\"x\",\"netAmountUSDC\":0.05},\"smeWalletOverride\":\"$ATTACKER\"}"
done
```

**Sugerencia**: remover `smeWalletOverride` del InputSchema o constrain via server-side lookup `requestId` → audit buffer → smeWallet. Sin uso real en demo (mock-data ya pinea cada invoice a issuer conocido).

### BLQ-ALTO-2 — IDOR en `/api/audit-trail/[requestId]` (PII leak unmasked rfcEmisor)
**Archivos**: `src/app/api/audit-trail/[requestId]/route.ts:6-27`, `src/infra/agent-signer.ts:149-151`

Endpoint sin auth. Quien conozca/adivine un `requestId` baja trail completo con `steps[].input.rfcEmisor` **unmasked** (RFC completo, identificador personal LFPDPPP MX). El mask en `invoice.rfcEmisorMasked` es cosmético — `inputForReceipt` pushea raw rfcEmisor.

**Sugerencia**: (a) auth via httpOnly cookie/signed token gating download. (b) Independiente: sanitizar `inputForReceipt` para reemplazar rfcEmisor → rfcEmisorMasked antes de pushear a `step.input`.

### BLQ-MED-1 — `requestId` shape no validado → header injection / DoS
**Archivo**: `src/app/api/audit-trail/[requestId]/route.ts:6-9`

Route toma `ctx.params.requestId` sin length cap, format check, sanitización. Header injection via `\r\n` en `requestId` (propagado desde client en `x-cobraya-request-id`) → `Content-Disposition` header attacker-controllable.

**Sugerencia**: validate UUIDv4 regex `^[0-9a-f-]{36}$` en cada agent route + audit-trail route.

### BLQ-MED-2 — `metadataPointer` siempre `ZERO_BYTES32` defeats CD-design
**Archivos**: `src/app/api/agents/cobraya-fraud-detector/invoke/route.ts:19, 158`, `contracts/src/CobrayaInvoiceCommitments.sol:13-17, 52, 61`

Contract reserva `bytes32 metadataPointer` para bind audit trail / IPFS hash. Route hardcodea zero. AC-12 cumple letra pero pierde "audit trail anchored onchain" spirit del pitch.

**Sugerencia**: pasar `keccak256(JSON.stringify(inputForReceipt))` o `keccak256(requestId)` como metadataPointer.

### BLQ-BAJO-1 — Gas claim en PRODUCTION-EVIDENCE impreciso
**Archivo**: `doc/PRODUCTION-EVIDENCE.md:50,76`

Forge test claims 58,407 gas. Live Fuji tx muestra 50,936 gas (verified `eth_getTransactionReceipt`). Discrepancia 13%. CD-11 (<80K) satisfecho, pero doc inconsistente.

### BLQ-BAJO-2 — `validator-store.ts` in-memory Set unreliable en serverless
**Archivo**: `src/lib/agent-state/validator-store.ts:7-15`

Set vive en proceso Vercel, no cross-instances. `duplicateCheck: clean` puede mentir después de cold-start. DT-B documented ("V2 → Redis") pero el field name es engañoso.

### BLQ-BAJO-3 — `try/catch` en agent routes swallow signer failures
**Archivos**: `src/app/api/agents/cobraya-{validator,fraud,scorer,matcher}/invoke/route.ts` (4×)

`signReceipt` errors → `receipt: null` sin log. `verify-audit-trail.js` crashea con TypeError en lugar de "ALL CHECKS PASSED". AC-13 falla silenciosamente.

## Menores
- MNR-1: `recoverTypedDataAddress` dynamic import en verify script (require viem package)
- MNR-2: `Content-Disposition` filename usa requestId untrusted
- MNR-3: `mxnToUSDC` rate hardcoded 19.85
- MNR-4: `ANTHROPIC_API_KEY` allow-list by prefix only
- MNR-5: `mockSettle` random hex looks like real tx hash (could mislead)

## OK verificado (19 vectores, ver tabla en review original)

Smart contract atomic anti-double-commit ✓, Ownable2Step ✓, gas <80K ✓, owner_ref no leak (no toca a2a tables) ✓, TREASURY_PRIVATE_KEY no leak ✓, EIP-3009 replay protection ✓, PWA NetworkOnly correcto ✓, marketplace slug whitelist ✓, **3 tx hashes Snowtrace verified real via RPC ✓**.

## Fix-pack priority
1. BLQ-ALTO-1 treasury drain (critical security)
2. BLQ-ALTO-2 IDOR audit-trail (PII compliance)
3. BLQ-MED-1 requestId validation
4. BLQ-MED-2 metadataPointer binding
5. BLQ-BAJO-1 gas doc
6. BLQ-BAJO-2 duplicate Set rename
7. BLQ-BAJO-3 signer error log
