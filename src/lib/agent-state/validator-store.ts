// src/lib/agent-state/validator-store.ts
// DT-B: process-scoped in-memory duplicate detector for cobraya-cfdi-validator.
// Lives outside the route file because Next.js App Router routes may only
// export route handlers (GET/POST/etc) — colocating state forced a compile
// error in W2 (auto-blindaje 001).

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
