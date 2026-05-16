import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

type Row = {
  id: string;
  uuid_cfdi: string;
  amount_mxn: number | string;
  net_amount_usdc: number | string;
  lender_name: string;
  tx_hash: string;
  snowtrace_url: string | null;
  settled_at: string;
};

export const dynamic = 'force-dynamic';

export default async function HistorialPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // DD-O cobraya_settled_invoices + CD-32 app-layer user_id filter (RLS too).
  const { data: rows } = (await supabase
    .from('cobraya_settled_invoices')
    .select(
      'id, uuid_cfdi, amount_mxn, net_amount_usdc, lender_name, tx_hash, snowtrace_url, settled_at',
    )
    .eq('user_id', user.id)
    .order('settled_at', { ascending: false })) as { data: Row[] | null };

  return (
    <section className="max-w-3xl mx-auto p-4">
      <h1 className="h1-serif text-luma-700 mb-4">Tus facturas vendidas</h1>
      {!rows || rows.length === 0 ? (
        <p className="text-luma-450">
          Todavía no has vendido ninguna factura. Andá a la pestaña Negociar
          para empezar.
        </p>
      ) : (
        <ul className="space-y-3" aria-label="Tus facturas vendidas">
          {rows.map((r) => (
            <li key={r.id} className="bb-card p-4">
              <div className="flex justify-between items-baseline">
                <span className="text-luma-700 font-medium">{r.lender_name}</span>
                <span className="text-sm text-luma-450">
                  {new Date(r.settled_at).toLocaleDateString('es-MX')}
                </span>
              </div>
              <p className="text-sm text-luma-450 mt-1">
                ${Number(r.amount_mxn).toFixed(2)} MXN → $
                {Number(r.net_amount_usdc).toFixed(2)} USDC
              </p>
              {r.snowtrace_url && (
                <a
                  href={r.snowtrace_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-luma-600 underline mt-1 inline-block"
                >
                  Ver comprobante en blockchain
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
