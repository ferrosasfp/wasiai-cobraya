// tests/unit/api/scan-invoice.test.ts
// T-SCAN-1..5 — covers GET 405, POST 200 shape, UUID v4 validity, no UUID
// collisions across 100 invocations, and persona-buyer semantic coherence.
import { describe, it, expect } from "vitest";
import { GET, POST, type ScannedInvoicePayload } from "@/app/api/scan-invoice/route";
import { MOCK_PERSONAS } from "@/lib/mock-data";
import { isValidUuidV4 } from "@/lib/uuid-validator";

const ALL_PERSONAS = MOCK_PERSONAS.map((p) => p.businessName);

describe("/api/scan-invoice", () => {
  it("T-SCAN-1 GET → 405 method_not_allowed", async () => {
    const res = await GET();
    expect(res.status).toBe(405);
    expect(res.headers.get("allow")).toBe("POST");
    const json = (await res.json()) as { error: string; allowed: string[] };
    expect(json.error).toBe("method_not_allowed");
    expect(json.allowed).toEqual(["POST"]);
  });

  it("T-SCAN-2 POST → 200 with full ScannedInvoicePayload shape", async () => {
    const res = await POST();
    expect(res.status).toBe(200);
    const json = (await res.json()) as ScannedInvoicePayload;

    expect(typeof json.uuidCfdi).toBe("string");
    expect(typeof json.rfcEmisor).toBe("string");
    expect(typeof json.anchorBuyer).toBe("string");
    expect(typeof json.amountMXN).toBe("number");
    expect([30, 45, 60, 90]).toContain(json.paymentTermsDays);
    expect([
      "food retail",
      "apparel",
      "construction",
      "services",
      "retail",
    ]).toContain(json.sector);
    expect(typeof json.personaName).toBe("string");
    expect(typeof json.issueDate).toBe("string");
    expect(typeof json.dueDate).toBe("string");

    // Amount bounds: [15K, 200K] inclusive (rounded to nearest 100 MXN).
    expect(json.amountMXN).toBeGreaterThanOrEqual(15000);
    expect(json.amountMXN).toBeLessThanOrEqual(200000);

    // Persona pool membership.
    expect(ALL_PERSONAS).toContain(json.personaName);
  });

  it("T-SCAN-3 generated UUID is a valid v4-like string", async () => {
    const res = await POST();
    const json = (await res.json()) as ScannedInvoicePayload;
    expect(isValidUuidV4(json.uuidCfdi)).toBe(true);
    // crypto.randomUUID produces RFC 4122 v4 — check version nibble.
    expect(json.uuidCfdi[14]).toBe("4");
    expect(["8", "9", "a", "b"]).toContain(json.uuidCfdi[19].toLowerCase());
  });

  it("T-SCAN-4 100 consecutive invocations → 100 unique UUIDs (no collisions)", async () => {
    const seen = new Set<string>();
    for (let i = 0; i < 100; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      const res = await POST();
      // eslint-disable-next-line no-await-in-loop
      const json = (await res.json()) as ScannedInvoicePayload;
      seen.add(json.uuidCfdi);
    }
    expect(seen.size).toBe(100);
  });

  it("T-SCAN-5 persona-buyer pairing is semantically coherent (boutique never invoices Cemex)", async () => {
    // Run 80 scans so each persona is statistically hit; verify each emitted
    // anchorBuyer belongs to the persona's declared defaultBuyerPool.
    for (let i = 0; i < 80; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      const res = await POST();
      // eslint-disable-next-line no-await-in-loop
      const json = (await res.json()) as ScannedInvoicePayload;
      const persona = MOCK_PERSONAS.find(
        (p) => p.businessName === json.personaName,
      );
      expect(persona).toBeDefined();
      expect(persona!.defaultBuyerPool).toContain(json.anchorBuyer);
      // Targeted invariant from the brief: Boutique Elegancia should never
      // emit Cemex (different sector + buyer pool).
      if (json.personaName === "Boutique Elegancia") {
        expect(json.anchorBuyer).not.toBe("Cemex");
      }
      if (json.personaName === "Tortillería La Esperanza") {
        expect(json.anchorBuyer).not.toBe("Liverpool");
      }
    }
  });
});
