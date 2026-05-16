import { describe, it, expect, vi } from "vitest";
import { loadDashboardStats } from "@/lib/dashboard/stats";

function supabaseWith(rows: unknown[] | null, error: unknown = null) {
  const captured = {
    table: "",
    cols: "",
    eqArgs: [] as [string, unknown][],
  };
  const builder = {
    select(cols: string) {
      captured.cols = cols;
      return this;
    },
    eq(col: string, val: unknown) {
      captured.eqArgs.push([col, val]);
      return this;
    },
    // PostgREST builder is thenable.
    then(resolve: (v: { data: unknown[] | null; error: unknown }) => void) {
      resolve({ data: rows, error });
    },
  };
  const stub = {
    from(table: string) {
      captured.table = table;
      return builder;
    },
  };
  return { stub, captured };
}

describe("loadDashboardStats — WKH-COBRAYA-DAPP-SHELL W7 (DD-H)", () => {
  it("returns zeros when there are no settled invoices", async () => {
    const { stub } = supabaseWith([]);
    const stats = await loadDashboardStats(stub, "u1", null);
    expect(stats).toEqual({
      facturasNegociadas: 0,
      totalUsdc: 0,
      ahorrosFee: 0,
      diasConCobraya: 0,
    });
  });

  it("queries cobraya_settled_invoices with .eq('user_id', userId) (CD-32 + DD-O)", async () => {
    const { stub, captured } = supabaseWith([]);
    await loadDashboardStats(stub, "u1", null);
    expect(captured.table).toBe("cobraya_settled_invoices");
    expect(captured.eqArgs).toContainEqual(["user_id", "u1"]);
  });

  it("sums totalUsdc + ahorrosFee with the 2% fee formula", async () => {
    const { stub } = supabaseWith([
      { amount_mxn: "10000", net_amount_usdc: "470" },
      { amount_mxn: "5000", net_amount_usdc: "235" },
      { amount_mxn: "20000", net_amount_usdc: "940" },
    ]);
    const stats = await loadDashboardStats(stub, "u1", null);
    expect(stats.facturasNegociadas).toBe(3);
    expect(stats.totalUsdc).toBeCloseTo(1645, 4);
    // (10000 + 5000 + 20000) * 0.02 = 700
    expect(stats.ahorrosFee).toBeCloseTo(700, 4);
  });

  it("computes diasConCobraya from createdAt (floor of millis diff)", async () => {
    const { stub } = supabaseWith([]);
    const past = new Date(Date.now() - 5 * 86400000).toISOString();
    const stats = await loadDashboardStats(stub, "u1", past);
    expect(stats.diasConCobraya).toBeGreaterThanOrEqual(4);
    expect(stats.diasConCobraya).toBeLessThanOrEqual(5);
  });

  it("returns zeros and logs console.warn on Supabase error", async () => {
    const { stub } = supabaseWith(null, { code: "500" });
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const stats = await loadDashboardStats(stub, "u1", null);
    expect(stats.facturasNegociadas).toBe(0);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});
