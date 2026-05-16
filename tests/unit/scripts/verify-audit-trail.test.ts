// tests/unit/scripts/verify-audit-trail.test.ts — fix-pack BLQ-BAJO-3.
// Validates that scripts/verify-audit-trail.js handles `receipt: null` steps
// without throwing TypeError. We invoke the CLI via child_process against a
// temporary audit JSON and assert exit code + stderr content.
import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";

function stampTrail(trail: Record<string, unknown>): string {
  const { trailHashSHA256: _ignored, ...rest } = trail as { trailHashSHA256?: string };
  void _ignored;
  const recomputed =
    "0x" +
    createHash("sha256")
      .update(JSON.stringify({ ...rest, trailHashSHA256: "" }))
      .digest("hex");
  return recomputed;
}

describe("scripts/verify-audit-trail.js — null receipt handling (BLQ-BAJO-3)", () => {
  it("T-VERIFY-NULL-RECEIPT prints a clear FAIL line and exits 2 (no TypeError crash)", () => {
    const dir = mkdtempSync(join(tmpdir(), "cobraya-verify-"));
    try {
      const file = join(dir, "audit.json");
      const trail: Record<string, unknown> = {
        schemaVersion: "1.0.0",
        requestId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        startedAt: "2026-05-16T00:00:00.000Z",
        completedAt: "2026-05-16T00:00:01.000Z",
        totalLatencyMs: 1000,
        invoice: {
          uuid: "abc",
          rfcEmisorMasked: "TLE8***",
          amountMXN: 48500,
          anchorBuyer: "Walmart México",
          paymentTermsDays: 60,
          sector: "food retail",
        },
        steps: [
          {
            stepIndex: 0,
            agentSlug: "cobraya-cfdi-validator",
            agentName: "Cobraya CFDI Validator",
            priceUsdc: 0.001,
            agentSigner: "0x1234567890123456789012345678901234567890",
            input: { ok: true },
            output: { ok: true },
            success: true,
            latencyMs: 12,
            receipt: null, // <- the case we're guarding against
            onchain: null,
          },
        ],
        settlement: null,
        totalCostUSDC: 0.001,
        trailHashSHA256: "0x" + "0".repeat(64),
      };
      trail.trailHashSHA256 = stampTrail(trail);
      writeFileSync(file, JSON.stringify(trail, null, 2));

      const proc = spawnSync(
        "node",
        ["scripts/verify-audit-trail.js", file],
        { encoding: "utf8", cwd: process.cwd() },
      );
      // Exit code must be 2 (verify failure), NOT 3 (uncaught exception).
      expect(proc.status).toBe(2);
      const combined = `${proc.stdout}\n${proc.stderr}`;
      expect(combined).toContain("missing receipt");
      // No TypeError should leak to the user.
      expect(combined).not.toContain("TypeError");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
