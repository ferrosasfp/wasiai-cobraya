import { describe, it, expect } from "vitest";
import { firstIncompleteStep, type ProfileRow } from "@/lib/onboarding/resume";

function profile(overrides: Partial<ProfileRow> = {}): ProfileRow {
  return {
    id: "u1",
    email: "a@b.com",
    rfc: null,
    sector: null,
    anchor_buyers: null,
    monto_tipico_mxn: null,
    mayor_frustracion: null,
    onboarding_completed: false,
    created_at: "2026-01-01",
    updated_at: "2026-01-01",
    ...overrides,
  };
}

describe("firstIncompleteStep — WKH-COBRAYA-DAPP-SHELL W6 (DD-L)", () => {
  it("returns 1 when rfc is null", () => {
    expect(firstIncompleteStep(profile())).toBe(1);
  });

  it("returns 2 when sector is null", () => {
    expect(firstIncompleteStep(profile({ rfc: "AAAA010101AAA" }))).toBe(2);
  });

  it("returns 3 when anchor_buyers is empty array", () => {
    expect(
      firstIncompleteStep(
        profile({ rfc: "AAAA010101AAA", sector: "Logística", anchor_buyers: [] }),
      ),
    ).toBe(3);
  });

  it("returns 4 when monto is null", () => {
    expect(
      firstIncompleteStep(
        profile({
          rfc: "AAAA010101AAA",
          sector: "Logística",
          anchor_buyers: ["Walmart"],
        }),
      ),
    ).toBe(4);
  });

  it("returns 5 when monto is set (last unfilled is mayor_frustracion)", () => {
    expect(
      firstIncompleteStep(
        profile({
          rfc: "AAAA010101AAA",
          sector: "Logística",
          anchor_buyers: ["Walmart"],
          monto_tipico_mxn: 48500,
        }),
      ),
    ).toBe(5);
  });
});
