import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  saveStep1,
  saveStep5,
  updateProfile,
} from "@/actions/profile";

type Captured = {
  table: string;
  updatePayload?: Record<string, unknown>;
  upsertPayload?: Record<string, unknown>;
  eqArgs?: [string, unknown];
};

function buildSupabaseStub(opts: {
  user?: { id: string } | null;
  updateError?: { code: string } | null;
  upsertError?: { code: string } | null;
} = {}) {
  const captured: Captured = { table: "" };
  const stub = {
    auth: {
      getUser: vi
        .fn()
        .mockResolvedValue({ data: { user: opts.user ?? { id: "u1" } } }),
    },
    from: vi.fn((table: string) => {
      captured.table = table;
      const fromBuilder = {
        update(payload: Record<string, unknown>) {
          captured.updatePayload = payload;
          return {
            eq(col: string, val: unknown) {
              captured.eqArgs = [col, val];
              return Promise.resolve({ error: opts.updateError ?? null });
            },
          };
        },
        upsert(payload: Record<string, unknown>) {
          captured.upsertPayload = payload;
          return {
            eq(col: string, val: unknown) {
              captured.eqArgs = [col, val];
              return Promise.resolve({ error: opts.upsertError ?? null });
            },
          };
        },
      };
      return fromBuilder;
    }),
  };
  return { stub, captured };
}

function fd(obj: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(obj)) f.append(k, v);
  return f;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("saveStep1 — WKH-COBRAYA-DAPP-SHELL W6", () => {
  it("validates RFC length (Zod ES-MX message), no Supabase call", async () => {
    const { stub } = buildSupabaseStub();
    (createClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue(stub);
    const res = await saveStep1({}, fd({ rfc: "TOO" }));
    expect(res.fieldErrors?.rfc).toContain("entre 12 y 13");
    expect(stub.from).not.toHaveBeenCalled();
  });

  it("redirects /onboarding/step/2 and writes against cobraya_profiles with .eq('id', user.id) (DD-O)", async () => {
    const { stub, captured } = buildSupabaseStub();
    (createClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue(stub);
    await expect(saveStep1({}, fd({ rfc: "AAAA010101AAA" }))).rejects.toThrow(
      "REDIRECT:/onboarding/step/2",
    );
    expect(captured.table).toBe("cobraya_profiles");
    expect(captured.updatePayload).toEqual({ rfc: "AAAA010101AAA" });
    expect(captured.eqArgs).toEqual(["id", "u1"]);
    expect(redirect).toHaveBeenCalledWith("/onboarding/step/2");
  });
});

describe("saveStep5 — WKH-COBRAYA-DAPP-SHELL W6 (AC-6, DD-L)", () => {
  it("atomically sets onboarding_completed=true AND mayor_frustracion, redirects /dashboard", async () => {
    const { stub, captured } = buildSupabaseStub();
    (createClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue(stub);
    await expect(
      saveStep5(
        {},
        fd({ mayor_frustracion: "Cobranza tarda 60 días y siempre piden CFDI corregido." }),
      ),
    ).rejects.toThrow("REDIRECT:/dashboard");
    expect(captured.updatePayload).toMatchObject({
      mayor_frustracion: expect.stringContaining("Cobranza"),
      onboarding_completed: true,
    });
    expect(captured.table).toBe("cobraya_profiles");
  });
});

describe("updateProfile — WKH-COBRAYA-DAPP-SHELL W6 (AC-14 UPSERT)", () => {
  it("upserts on cobraya_profiles with .eq('id', user.id)", async () => {
    const { stub, captured } = buildSupabaseStub();
    (createClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue(stub);
    const res = await updateProfile(
      {},
      fd({
        rfc: "AAAA010101AAA",
        sector: "Logística",
        anchor_buyers: JSON.stringify(["Walmart"]),
        monto_tipico_mxn: "48500",
        mayor_frustracion: "Pago tarda 60 días",
      }),
    );
    expect(res).toEqual({});
    expect(captured.table).toBe("cobraya_profiles");
    expect(captured.upsertPayload).toMatchObject({
      id: "u1",
      rfc: "AAAA010101AAA",
      anchor_buyers: ["Walmart"],
    });
    expect(captured.eqArgs).toEqual(["id", "u1"]);
  });

  it("returns the first Zod error (ES-MX) when input is invalid (anchor_buyers empty)", async () => {
    const { stub } = buildSupabaseStub();
    (createClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue(stub);
    // anchor_buyers is wrapped in JSON; empty array → schema rejects
    const res = await updateProfile(
      {},
      fd({ anchor_buyers: JSON.stringify([]) }),
    );
    expect(res.error).toContain("comprador");
  });

  it("logs CD-31-safe console.warn on Supabase error", async () => {
    const { stub } = buildSupabaseStub({ upsertError: { code: "23503" } });
    (createClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue(stub);
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const res = await updateProfile({}, fd({ rfc: "AAAA010101AAA" }));
    expect(res.error).toBe("No se pudo actualizar.");
    expect(warn).toHaveBeenCalledWith("[cobraya-action]", {
      action: "updateProfile",
      errorCode: "23503",
    });
    warn.mockRestore();
  });
});
