import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { createClient } from "@/lib/supabase/server";
import DashboardPage from "@/app/(app)/dashboard/page";

function buildSupabase(
  profile: unknown,
  settled: unknown[] = [],
  recents: unknown[] = settled,
) {
  let callCount = 0;
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: "u1", email: "lupita@cobraya.mx" } },
      }),
    },
    from: vi.fn(() => {
      const idx = callCount++;
      // Call order in DashboardPage:
      //   1. cobraya_profiles  → .eq.maybeSingle
      //   2. cobraya_settled_invoices (loadDashboardStats) → .eq (thenable)
      //   3. cobraya_settled_invoices (recents) → .eq.order.limit
      const builder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockImplementation(() => {
          if (idx === 1) {
            // stats: thenable resolving with {data, error}
            return {
              then: (resolve: (v: { data: unknown[]; error: null }) => void) => {
                resolve({ data: settled, error: null });
              },
            };
          }
          return builder;
        }),
        maybeSingle: vi.fn().mockResolvedValue({ data: profile, error: null }),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: recents, error: null }),
      };
      return builder;
    }),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("DashboardPage (RSC) — WKH-COBRAYA-DAPP-SHELL W7 (AC-9)", () => {
  it("greets the user using email.split('@')[0]", async () => {
    (createClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      buildSupabase(
        {
          email: "lupita@cobraya.mx",
          rfc: "AAAA010101AAA",
          sector: "Logística",
          created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
        },
        [],
      ),
    );
    const ui = await DashboardPage();
    render(ui);
    expect(
      screen.getByRole("heading", { level: 1, name: /hola, lupita/i }),
    ).toBeInTheDocument();
  });

  it("renders all 4 stat cards with zeros when there are no settled invoices", async () => {
    (createClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      buildSupabase(
        { email: "x@y.com", rfc: "X", sector: "S", created_at: null },
        [],
      ),
    );
    const ui = await DashboardPage();
    render(ui);
    expect(screen.getByText(/facturas negociadas/i)).toBeInTheDocument();
    expect(screen.getByText(/total usdc/i)).toBeInTheDocument();
    expect(screen.getByText(/ahorros estimados/i)).toBeInTheDocument();
    expect(screen.getByText(/días con cobraya/i)).toBeInTheDocument();
  });

  it("shows the 'aún no has negociado' empty state when recents is empty", async () => {
    (createClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      buildSupabase(null, [], []),
    );
    const ui = await DashboardPage();
    render(ui);
    expect(
      screen.getByText(/aún no has negociado ninguna factura/i),
    ).toBeInTheDocument();
  });
});
