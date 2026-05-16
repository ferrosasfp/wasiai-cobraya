# Audit Trail Schema — Regulator-Ready Receipts

> **Status**: planning doc (design only, no implementation).
> Implementation lives in hack-day Wave W6.5.
>
> **Compliance angle**: CNBV Circular 4/2024 "trazabilidad agéntica en operaciones fintech" requiere log estructurado de cada decisión automatizada. Este schema lo implementa **literal**.

---

## 1. Propósito

Cada `/compose` run de Cobraya genera un **audit trail JSON** que es:
- **Descargable** por el usuario (botón "Descargar audit trail" en UI)
- **Firmado** por cada agente (EIP-712 typed data signatures)
- **Verificable** offline (cualquier auditor puede checkear las signatures sin hablar con Cobraya)
- **Inmutable** post-settle (en V2: hash final también va onchain como audit anchor)

Para el video: en el segundo 1:35 mostramos el JSON building en tiempo real, y a los 1:50 el usuario hace click "Descargar audit trail" → el JSON se descarga. **Esto es el momento "regulator-friendly" que ningún otro demo de hackathon tiene.**

---

## 2. JSON schema (TypeScript types)

```typescript
// src/types/audit-trail.ts (HACK-DAY)

interface AuditTrail {
  /** Version del schema (semver) — empieza en "1.0.0" */
  schemaVersion: string;

  /** UUID v4 generado por Cobraya al inicio del compose */
  requestId: string;

  /** ISO-8601 con TZ del momento que arrancó el flow */
  startedAt: string;

  /** ISO-8601 con TZ del momento que terminó (settle confirmed) */
  completedAt: string;

  /** Total latency end-to-end en ms */
  totalLatencyMs: number;

  /** Invoice input (PII-friendly: RFC partial mask) */
  invoice: {
    uuidCfdi: string;
    rfcEmisorMasked: string;      // e.g. "TLE850***" — partial mask for privacy
    anchorBuyer: string;
    amountMXN: number;
    paymentTermsDays: number;
    sector: string;
  };

  /** Each agent step, in execution order */
  steps: AuditStep[];

  /** Final settlement details (only if settle succeeded) */
  settlement: AuditSettlement | null;

  /** Total cost in USDC paid by the SME (sum of priceUsdc per step) */
  totalCostUSDC: number;

  /** SHA-256 of the entire AuditTrail (computed AFTER all fields set, except this one) */
  trailHashSHA256: string;
}

interface AuditStep {
  /** Step index in the compose pipeline (0, 1, 2, 3) */
  stepIndex: number;

  /** Agent slug as registered in wasiai-v2 marketplace */
  agentSlug: string;          // e.g. "cobraya-fraud-detector"

  /** Agent display name */
  agentName: string;

  /** Price paid for this step in USDC */
  priceUsdc: number;

  /** Wallet that signed the agent's receipt (agent's hot key) */
  agentSigner: string;        // 0x...

  /** Inputs sent to agent (sanitized — no full PII) */
  input: Record<string, unknown>;

  /** Outputs received from agent */
  output: Record<string, unknown>;

  /** Was this step successful? */
  success: boolean;

  /** Error message if !success */
  error: string | null;

  /** ISO-8601 timestamps */
  startedAt: string;
  endedAt: string;
  latencyMs: number;

  /** EIP-712 signature of {agentSlug, input, output, startedAt} signed by agentSigner */
  receipt: {
    domain: { name: string; version: string; chainId: number };
    types: { Receipt: Array<{ name: string; type: string }> };
    primaryType: "Receipt";
    message: Record<string, unknown>;
    signature: string;        // 0x... (65 bytes hex)
  };

  /** OnChain artifacts (for fraud-detector + settle steps) */
  onchain: {
    txHash: string;
    blockNumber: number;
    chain: "avalanche-fuji" | "avalanche-mainnet";
    snowtraceUrl: string;
  } | null;
}

interface AuditSettlement {
  /** EIP-3009 typed data that was signed */
  authorization: {
    from: string;             // TREASURY (lender) address
    to: string;               // OWNER (SME) address
    value: string;            // USDC amount in 6dec units
    validAfter: number;
    validBefore: number;
    nonce: string;
  };

  /** EIP-3009 signature */
  signature: string;

  /** Settlement tx (executed by facilitator) */
  txHash: string;
  blockNumber: number;
  chain: "avalanche-fuji" | "avalanche-mainnet";
  snowtraceUrl: string;

  /** Confirmed amount delivered to SME (could differ from authorization.value if there were caps) */
  deliveredAmountUSDC: string;

  /** Facilitator that processed the settlement */
  facilitatorUrl: string;
}
```

---

## 3. Ejemplo concreto (Tortillería La Esperanza)

```json
{
  "schemaVersion": "1.0.0",
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "startedAt": "2026-05-16T03:42:18.123-06:00",
  "completedAt": "2026-05-16T03:43:09.847-06:00",
  "totalLatencyMs": 51724,
  "invoice": {
    "uuidCfdi": "C70D6E70-B5FE-4D5A-8E37-919A03C5556B",
    "rfcEmisorMasked": "TLE850***",
    "anchorBuyer": "Walmart México",
    "amountMXN": 48500,
    "paymentTermsDays": 60,
    "sector": "food retail"
  },
  "steps": [
    {
      "stepIndex": 0,
      "agentSlug": "cobraya-cfdi-validator",
      "agentName": "AgentShop CFDI Validator",
      "priceUsdc": 0.001,
      "agentSigner": "0xVALIDATOR_HOT_KEY",
      "input": { "uuidCfdi": "...", "rfcEmisorMasked": "TLE850***", "amountMXN": 48500 },
      "output": { "isCompliant": true, "anchorBuyerTier": 1, "policyId": "ml-tier-1-2026" },
      "success": true,
      "error": null,
      "startedAt": "2026-05-16T03:42:18.123-06:00",
      "endedAt": "2026-05-16T03:42:20.456-06:00",
      "latencyMs": 2333,
      "receipt": { "domain": {"name":"Cobraya","version":"1","chainId":43113}, "...": "..." },
      "onchain": null
    },
    {
      "stepIndex": 1,
      "agentSlug": "cobraya-fraud-detector",
      "agentName": "Cobraya Fraud Detector",
      "priceUsdc": 0.005,
      "agentSigner": "0xFRAUD_HOT_KEY",
      "input": { "uuidCfdi": "...", "rfcEmisorMasked": "TLE850***", "amountMXN": 48500 },
      "output": {
        "isUnique": true,
        "commitmentHash": "0xab12...",
        "commitTxHash": "0xcd34..."
      },
      "success": true,
      "error": null,
      "startedAt": "2026-05-16T03:42:20.456-06:00",
      "endedAt": "2026-05-16T03:42:24.012-06:00",
      "latencyMs": 3556,
      "receipt": { "...": "..." },
      "onchain": {
        "txHash": "0xcd34...",
        "blockNumber": 42500001,
        "chain": "avalanche-fuji",
        "snowtraceUrl": "https://testnet.snowtrace.io/tx/0xcd34..."
      }
    },
    {
      "stepIndex": 2,
      "agentSlug": "cobraya-credit-scorer",
      "agentName": "Cobraya Credit Scorer",
      "priceUsdc": 0.05,
      "agentSigner": "0xSCORER_HOT_KEY",
      "input": { "amountMXN": 48500, "anchorBuyer": "Walmart México", "paymentTermsDays": 60, "sector": "food retail" },
      "output": {
        "score": 74,
        "band": "B",
        "advanceRatePct": 92,
        "aprPct": 14.5,
        "rationale": "Anchor buyer Walmart México tier-1, plazo medio de 60 días, sector food retail estable. Banda B refleja buen perfil crediticio.",
        "rationaleProvenance": "anthropic-claude-haiku-4-5"
      },
      "success": true,
      "error": null,
      "startedAt": "2026-05-16T03:42:24.012-06:00",
      "endedAt": "2026-05-16T03:42:30.234-06:00",
      "latencyMs": 6222,
      "receipt": { "...": "..." },
      "onchain": null
    },
    {
      "stepIndex": 3,
      "agentSlug": "cobraya-lender-matcher",
      "agentName": "Cobraya Lender Matcher",
      "priceUsdc": 0.01,
      "agentSigner": "0xMATCHER_HOT_KEY",
      "input": { "band": "B", "amountMXN": 48500, "anchorBuyer": "Walmart México", "sector": "food retail" },
      "output": {
        "auction": [
          { "lenderId": "lender-arkangeles-i", "lenderName": "Arkangeles Fund I", "aprPct": 14.5, "advanceRatePct": 92, "estimatedSettleMinutes": 45, "rank": 1 },
          { "lenderId": "lender-bankaool", "lenderName": "Bankaool Pool A", "aprPct": 14.5, "advanceRatePct": 92, "estimatedSettleMinutes": 30, "rank": 2 },
          { "lenderId": "lender-konfio", "lenderName": "Konfío Express", "aprPct": 22.0, "advanceRatePct": 85, "estimatedSettleMinutes": 5, "rank": 3 }
        ],
        "recommendedLender": "lender-arkangeles-i",
        "recommendationReason": "Best APR-advance combination for band B sector food retail"
      },
      "success": true,
      "error": null,
      "startedAt": "2026-05-16T03:42:30.234-06:00",
      "endedAt": "2026-05-16T03:42:31.789-06:00",
      "latencyMs": 1555,
      "receipt": { "...": "..." },
      "onchain": null
    }
  ],
  "settlement": {
    "authorization": {
      "from": "0x1d024Bdb20B4c3E139B8516ed6d834a9654F21cF",
      "to": "0x94DCDb84207724A609B17e4838936832EA59B9eD",
      "value": "44620000",
      "validAfter": 1715000000,
      "validBefore": 1715003600,
      "nonce": "0xRANDOM_32BYTE_NONCE"
    },
    "signature": "0xSIG_65BYTES",
    "txHash": "0xSETTLE_TX_HASH",
    "blockNumber": 42500015,
    "chain": "avalanche-fuji",
    "snowtraceUrl": "https://testnet.snowtrace.io/tx/0xSETTLE_TX_HASH",
    "deliveredAmountUSDC": "0.05",
    "facilitatorUrl": "https://wasiai-facilitator-production.up.railway.app"
  },
  "totalCostUSDC": 0.066,
  "trailHashSHA256": "0xDEEDBEEF..."
}
```

---

## 4. Signing strategy

### Hot keys per agent (V1 hackathon)

Cada agent endpoint tiene una **hot key** dedicada para firmar receipts. Estas keys son:
- Generadas durante el hack (ephemeral, no recovery)
- Stored como env vars en Vercel (`VALIDATOR_HOT_KEY`, `FRAUD_HOT_KEY`, `SCORER_HOT_KEY`, `MATCHER_HOT_KEY`)
- Cada una firma SOLO los receipts de su agent (separación clara)

**EIP-712 domain**:
```js
{
  name: "Cobraya",
  version: "1",
  chainId: 43113  // Fuji
}
```

**EIP-712 types**:
```js
{
  Receipt: [
    { name: "agentSlug", type: "string" },
    { name: "stepIndex", type: "uint256" },
    { name: "inputHash", type: "bytes32" },    // keccak256(JSON.stringify(input))
    { name: "outputHash", type: "bytes32" },   // keccak256(JSON.stringify(output))
    { name: "startedAt", type: "uint256" },    // unix timestamp seconds
    { name: "priceUsdc", type: "uint256" }      // in 6dec units
  ]
}
```

### V2 (post-hackathon) production approach

- Hot keys rotation cada 24h
- Cold key (per agent) firma policy delegating to hot key
- Hash anchor: `keccak256(trail)` se publica al `CobrayaInvoiceCommitments` contract como tx con `metadataPointer`

---

## 5. UI integration

### Audit panel (W6.5 wave)

Durante el demo, panel lateral (similar al TraceConsole de agentshop pero más estructurado):

```
┌─ AUDIT TRAIL ──────────────────────────┐
│ requestId: 550e8400-...              │
│                                      │
│ ✓ Step 0: cfdi-validator            │
│   ⤿ receipt signed by 0xVAL...      │
│                                      │
│ ✓ Step 1: fraud-detector             │
│   ⤿ receipt signed by 0xFRA...      │
│   ⤿ on-chain tx: 0xcd34... ↗        │
│                                      │
│ ✓ Step 2: credit-scorer              │
│   ⤿ receipt signed by 0xSCR...      │
│   ⤿ rationale by Claude Haiku       │
│                                      │
│ ✓ Step 3: lender-matcher             │
│   ⤿ receipt signed by 0xMAT...      │
│                                      │
│ ⏳ Settle:                          │
│   pending TREASURY signature...      │
│                                      │
│ [ Descargar audit trail JSON ]       │
└──────────────────────────────────────┘
```

### Download endpoint

```
GET /api/audit-trail/[requestId]/route.ts (HACK-DAY)
→ returns: AuditTrail JSON con headers
  Content-Type: application/json
  Content-Disposition: attachment; filename="cobraya-audit-{requestId}.json"
```

---

## 6. Verification flow (offline, post-demo)

Para mostrar que un auditor puede verificar sin hablar con Cobraya:

```bash
# 1. Download audit trail
curl https://wasiai-lendable.vercel.app/api/audit-trail/550e8400-... > audit.json

# 2. Verify receipts (script we ship in repo)
node scripts/verify-audit-trail.js audit.json
# Output:
#   ✓ Step 0 receipt verified (signer 0xVAL...)
#   ✓ Step 1 receipt verified (signer 0xFRA...)
#   ✓ Step 2 receipt verified (signer 0xSCR...)
#   ✓ Step 3 receipt verified (signer 0xMAT...)
#   ✓ On-chain commitment verified at block 42500001
#   ✓ Settlement tx verified at block 42500015
#   ✓ trailHashSHA256 matches recalculated hash
#   ALL CHECKS PASSED ✓
```

Esto es el momento "este sistema es auditable independientemente" que el regulador necesita ver.

---

## 7. Out of scope (post-hack)

- KYC linkage (audit trail ata-a una identidad)
- AML report generation (auto-generate suspicious activity reports)
- Multi-jurisdiction templates (Brazil CVM, Colombia SuperFinanciera, etc.)
- Hash anchoring on-chain (commit final `trailHashSHA256` to commitment contract)
- Permissioned access (only auditor wallets can fetch full trails)
- Encrypted PII (RFC complete cifrado para auditor con permisos)
