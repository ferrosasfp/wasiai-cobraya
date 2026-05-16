import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { loadDashboardStats } from '@/lib/dashboard/stats';

type ProfilePreview = {
  email: string | null;
  rfc: string | null;
  sector: string | null;
  created_at: string | null;
};

type RecentRow = {
  id: string;
  uuid_cfdi: string;
  amount_mxn: number | string;
  net_amount_usdc: number | string;
  lender_name: string;
  settled_at: string;
};

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // DD-O: cobraya_profiles
  const { data: profile } = await supabase
    .from('cobraya_profiles')
    .select('email, rfc, sector, created_at')
    .eq('id', user.id)
    .maybeSingle<ProfilePreview>();

  const stats = await loadDashboardStats(
    supabase,
    user.id,
    profile?.created_at ?? null,
  );

  // DD-O: cobraya_settled_invoices, CD-32 user_id filter
  const { data: recientes } = await supabase
    .from('cobraya_settled_invoices')
    .select(
      'id, uuid_cfdi, amount_mxn, net_amount_usdc, lender_name, settled_at',
    )
    .eq('user_id', user.id)
    .order('settled_at', { ascending: false })
    .limit(5) as { data: RecentRow[] | null };

  const nombre = user.email?.split('@')[0] ?? 'tú';

  return (
    <section className="max-w-3xl mx-auto p-4 space-y-6">
      <header>
        <h1 className="h1-serif text-luma-700">Hola, {nombre}</h1>
        <p className="text-sm text-luma-450 mt-1">
          Tu resumen hoy en Cobraya.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Facturas negociadas"
          value={String(stats.facturasNegociadas)}
        />
        <StatCard
          label="Total USDC"
          value={`$${stats.totalUsdc.toFixed(2)}`}
        />
        <StatCard
          label="Ahorros estimados (MXN)"
          value={`$${stats.ahorrosFee.toFixed(0)}`}
        />
        <StatCard
          label="Días con Cobraya"
          value={String(stats.diasConCobraya)}
        />
      </div>

      <ProfilePreview profile={profile} />
      <RecentesList items={recientes ?? []} />
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bb-card p-4">
      <p className="text-xs text-luma-450">{label}</p>
      <p className="text-2xl font-medium text-luma-700 mt-1">{value}</p>
    </div>
  );
}

function ProfilePreview({ profile }: { profile: ProfilePreview | null }) {
  return (
    <section className="bb-card">
      <h2 className="text-sm uppercase tracking-wide text-luma-450 mb-2">
        Tu perfil
      </h2>
      {profile ? (
        <dl className="grid grid-cols-2 gap-2 text-sm text-luma-700">
          <dt className="text-luma-450">Correo</dt>
          <dd>{profile.email ?? '—'}</dd>
          <dt className="text-luma-450">RFC</dt>
          <dd>{profile.rfc ?? '—'}</dd>
          <dt className="text-luma-450">Sector</dt>
          <dd>{profile.sector ?? '—'}</dd>
        </dl>
      ) : (
        <p className="text-sm text-luma-450">Perfil aún no configurado.</p>
      )}
      <Link
        href="/perfil"
        className="inline-block mt-3 text-sm text-luma-600 underline underline-offset-2"
      >
        Editar perfil
      </Link>
    </section>
  );
}

function RecentesList({ items }: { items: RecentRow[] }) {
  return (
    <section>
      <h2 className="text-sm uppercase tracking-wide text-luma-450 mb-2">
        Más recientes
      </h2>
      {items.length === 0 ? (
        <p className="text-sm text-luma-450">
          Aún no has negociado ninguna factura.
        </p>
      ) : (
        <ul className="space-y-3" aria-label="Facturas recientes">
          {items.map((r) => (
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
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
