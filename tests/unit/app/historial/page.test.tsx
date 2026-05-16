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
import HistorialPage from "@/app/(app)/historial/page";

function buildSupabase(rows: unknown[] | null) {
  let lastEqArgs: [string, unknown] | null = null;
  return {
    captured: {
      get eqArgs() {
        return lastEqArgs;
      },
    },
    stub: {
      auth: {
        getUser: vi
          .fn()
          .mockResolvedValue({ data: { user: { id: "u1", email: "x@y" } } }),
      },
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockImplementation((col: string, val: unknown) => {
          lastEqArgs = [col, val];
          return {
            order: vi.fn().mockReturnValue(Promise.resolve({ data: rows, error: null })),
          };
        }),
      })),
    },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("HistorialPage — WKH-COBRAYA-DAPP-SHELL W9 (AC-12, AC-13)", () => {
  it("shows empty state when no settled invoices", async () => {
    const { stub } = buildSupabase([]);
    (createClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue(stub);
    const ui = await HistorialPage();
    render(ui);
    expect(
      screen.getByText(/aún no has negociado ninguna factura/i),
    ).toBeInTheDocument();
  });

  it("filters by user_id (CD-32 / AC-13 app-layer)", async () => {
    const { stub, captured } = buildSupabase([]);
    (createClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue(stub);
    await HistorialPage();
    expect(captured.eqArgs).toEqual(["user_id", "u1"]);
  });

  it("renders rows desc + Snowtrace link when snowtrace_url is present", async () => {
    const { stub } = buildSupabase([
      {
        id: "row-1",
        uuid_cfdi: "CFDI-2",
        amount_mxn: "20000",
        net_amount_usdc: "940",
        lender_name: "Lender B",
        tx_hash: "0xb",
        snowtrace_url: "https://testnet.snowtrace.io/tx/0xb",
        settled_at: "2026-05-10T10:00:00Z",
      },
      {
        id: "row-2",
        uuid_cfdi: "CFDI-1",
        amount_mxn: "10000",
        net_amount_usdc: "470",
        lender_name: "Lender A",
        tx_hash: "0xa",
        snowtrace_url: null,
        settled_at: "2026-05-09T10:00:00Z",
      },
    ]);
    (createClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue(stub);
    const ui = await HistorialPage();
    render(ui);
    expect(screen.getByText("Lender B")).toBeInTheDocument();
    expect(screen.getByText("Lender A")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /ver en snowtrace/i }),
    ).toHaveAttribute("href", "https://testnet.snowtrace.io/tx/0xb");
  });
});
