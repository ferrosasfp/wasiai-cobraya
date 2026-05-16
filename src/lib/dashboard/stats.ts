// WKH-COBRAYA-DAPP-SHELL W7 — dashboard stats (DD-H).
import type { SupabaseClient } from '@supabase/supabase-js';

export type DashboardStats = {
  facturasNegociadas: number;
  totalUsdc: number;
  ahorrosFee: number;
  diasConCobraya: number;
};

// Minimal shape needed from cobraya_settled_invoices for the math.
type SettledRow = { amount_mxn: number | string; net_amount_usdc: number | string };

// We type the client argument permissively — the public stats() boundary takes any
// client that exposes the same `.from(table).select(cols).eq(col,val)` shape. Tests
// inject a hand-rolled stub matching that contract; production calls it with the
// real SupabaseClient (which is structurally compatible).
type StatsClient = Pick<SupabaseClient, 'from'> | unknown;

export async function loadDashboardStats(
  supabase: StatsClient,
  userId: string,
  createdAt: string | null,
): Promise<DashboardStats> {
  // CD-32: app-layer .eq('user_id', userId) — defense in depth with RLS.
  // DD-O: cobraya_settled_invoices
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const builder = (supabase as any)
    .from('cobraya_settled_invoices')
    .select('amount_mxn, net_amount_usdc')
    .eq('user_id', userId);
  const { data, error } = (await builder) as {
    data: SettledRow[] | null;
    error: { code?: string } | null;
  };
  if (error || !data) {
    console.warn('[cobraya-dashboard] stats load failed', {
      errorCode: error?.code,
    });
    return {
      facturasNegociadas: 0,
      totalUsdc: 0,
      ahorrosFee: 0,
      diasConCobraya: 0,
    };
  }
  const facturasNegociadas = data.length;
  const totalUsdc = data.reduce((s, r) => s + Number(r.net_amount_usdc), 0);
  const ahorrosFee = data.reduce(
    (s, r) => s + Number(r.amount_mxn) * 0.02,
    0,
  );
  const diasConCobraya = createdAt
    ? Math.max(
        0,
        Math.floor((Date.now() - new Date(createdAt).getTime()) / 86400000),
      )
    : 0;
  return { facturasNegociadas, totalUsdc, ahorrosFee, diasConCobraya };
}
