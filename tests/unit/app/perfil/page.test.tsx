import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));
vi.mock("@/actions/auth", () => ({
  signOut: vi.fn(),
}));

import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { createClient } from "@/lib/supabase/server";
import PerfilPage from "@/app/(app)/perfil/page";

function buildSupabase(profile: unknown) {
  return {
    auth: {
      getUser: vi
        .fn()
        .mockResolvedValue({ data: { user: { id: "u1", email: "lupita@cobraya.mx" } } }),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: profile, error: null }),
    })),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("PerfilPage — WKH-COBRAYA-DAPP-SHELL W10", () => {
  it("renders heading, prefilled form, and Cerrar sesión button", async () => {
    (createClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      buildSupabase({
        id: "u1",
        email: "lupita@cobraya.mx",
        rfc: "AAAA010101AAA",
        sector: "Logística",
        anchor_buyers: ["Walmart"],
        monto_tipico_mxn: 48500,
        mayor_frustracion: "Pago tarda 60 días",
        onboarding_completed: true,
        created_at: "2026-01-01",
        updated_at: "2026-01-01",
      }),
    );
    const ui = await PerfilPage();
    render(ui);
    expect(
      screen.getByRole("heading", { level: 1, name: /perfil/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/^rfc/i)).toHaveValue("AAAA010101AAA");
    expect(
      screen.getByRole("button", { name: /cerrar sesión/i }),
    ).toBeInTheDocument();
  });

  it("redirects to /login if user is not authenticated", async () => {
    const stub = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
      from: vi.fn(),
    };
    (createClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue(stub);
    await expect(PerfilPage()).rejects.toThrow("REDIRECT:/login");
  });
});
