// src/lib/demo/rate-limit.ts — in-memory rate limiter for the public /demo page.
//
// The public /demo flow triggers a REAL on-chain USDC settlement (capped at
// ONCHAIN_AMOUNT_CAP_USDC = 0.05 USDC per run via /api/settle), so without a
// throttle a single bored visitor could empty the TREASURY wallet for the
// hackathon. We need:
//
//   1. A short cooldown so spam-clicking the CTA can't fire two runs back-to-back.
//   2. A per-hour quota so a determined visitor can't drain a few USD over the
//      course of a few minutes.
//
// We key by client fingerprint = `x-forwarded-for` (first hop) | `x-real-ip` |
// "unknown". This is best-effort — a malicious visitor behind a fresh proxy
// can bypass it. For the hackathon judging window that's acceptable: the
// downstream CD-5 cap ($0.05/run) already bounds blast radius, and Vercel/Next
// edge already terminates abusive volumes. If this graduates to production the
// in-memory map should be swapped for Upstash Redis (see hackathon TODO note
// in the README).
//
// CD-9: no IPs are persisted anywhere; the Map lives in-process and entries
// expire on `consume()`.

export const DEMO_COOLDOWN_MS = 60_000; // 60s between runs from the same client.
export const DEMO_HOUR_QUOTA = 5; // max runs/hour per client.
export const DEMO_HOUR_MS = 60 * 60 * 1000;

interface ClientWindow {
  /** ISO ms timestamps of runs that fall inside the last hour. */
  recentRuns: number[];
}

// Module-scoped Map. Note: in dev with Next.js HMR this MAY be recreated when
// the route handler module hot-reloads; that's fine — worst case is a window
// re-opens once per code change.
const windows: Map<string, ClientWindow> = new Map();

export interface ConsumeResult {
  ok: boolean;
  /** Reason: "cooldown" if too recent, "quota" if hourly cap hit. */
  reason?: "cooldown" | "quota";
  /** Seconds the caller must wait before retrying. Always >0 when ok=false. */
  retryAfterSec?: number;
  /** Remaining runs in the current hour AFTER this call (0 when blocked). */
  remainingHour: number;
}

/**
 * Try to consume one demo run for the given client fingerprint. If `ok` is
 * true the run is recorded; otherwise no state mutation happens and the
 * caller should display the retry hint.
 *
 * Pass `nowMs` to make tests deterministic.
 */
export function consume(
  fingerprint: string,
  nowMs: number = Date.now(),
): ConsumeResult {
  const fp = fingerprint || "unknown";
  const existing = windows.get(fp);
  const recent = (existing?.recentRuns ?? []).filter(
    (t) => nowMs - t < DEMO_HOUR_MS,
  );

  // 1. Cooldown check — last run < 60s ago.
  const lastRun = recent.length > 0 ? recent[recent.length - 1] : 0;
  if (lastRun > 0 && nowMs - lastRun < DEMO_COOLDOWN_MS) {
    const retryAfterSec = Math.ceil((DEMO_COOLDOWN_MS - (nowMs - lastRun)) / 1000);
    // Persist trimmed list so the Map doesn't keep stale (>1h) entries forever.
    windows.set(fp, { recentRuns: recent });
    return {
      ok: false,
      reason: "cooldown",
      retryAfterSec,
      remainingHour: Math.max(0, DEMO_HOUR_QUOTA - recent.length),
    };
  }

  // 2. Hourly quota check — already at the cap.
  if (recent.length >= DEMO_HOUR_QUOTA) {
    const oldest = recent[0];
    const retryAfterSec = Math.ceil((DEMO_HOUR_MS - (nowMs - oldest)) / 1000);
    windows.set(fp, { recentRuns: recent });
    return {
      ok: false,
      reason: "quota",
      retryAfterSec,
      remainingHour: 0,
    };
  }

  // 3. Allowed — record the run.
  recent.push(nowMs);
  windows.set(fp, { recentRuns: recent });
  return {
    ok: true,
    remainingHour: DEMO_HOUR_QUOTA - recent.length,
  };
}

/**
 * Extract the best-effort client fingerprint from request headers. Falls back
 * to "unknown" if none are present (vercel/edge will always set at least one).
 */
export function fingerprintFromHeaders(
  get: (name: string) => string | null,
): string {
  const xff = get("x-forwarded-for");
  if (xff) {
    // First hop is the client; subsequent hops are proxies.
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

/** Test-only — clears the in-memory Map. NEVER call from app code. */
export function __resetDemoRateLimitForTests(): void {
  windows.clear();
}
