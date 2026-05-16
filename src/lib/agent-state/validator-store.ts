// src/lib/agent-state/validator-store.ts
// DT-B: process-scoped in-memory duplicate detector for cobraya-cfdi-validator.
// Lives outside the route file because Next.js App Router routes may only
// export route handlers (GET/POST/etc) — colocating state forced a compile
// error in W2 (auto-blindaje 001).
//
// BLQ-BAJO-2 (post-AR fix-pack): the cfdi-validator agent surfaces this state
// via `duplicateCheckInstance` (not `duplicateCheck`) so consumers don't
// mistake the per-process flag for a global guarantee. Process-scoped Set.
// NOT cross-instance reliable: a Vercel cold start, a horizontal scaling
// event, or a server-action vs route-handler context split all create
// separate processes with empty Sets. The authoritative dup check in the
// Cobraya pipeline is the fraud-detector + the onchain
// `CobrayaInvoiceCommitments.commitInvoice` reverting `AlreadyCommitted` —
// see story §6 + W2.5. V2 path → migrate this Set to a Redis-backed
// key/expiry pair so the validator can short-circuit cheap dupes pre-onchain.

const SEEN_UUIDS = new Set<string>();

export function isUuidSeen(uuid: string): boolean {
  return SEEN_UUIDS.has(uuid);
}

export function markUuidSeen(uuid: string): void {
  SEEN_UUIDS.add(uuid);
}

// Test-only — keeps test isolation (CD-24 spirit).
export function __resetSeenUuids(): void {
  SEEN_UUIDS.clear();
}
