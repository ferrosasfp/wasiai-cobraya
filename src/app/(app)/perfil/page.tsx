import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { signOut } from '@/actions/auth';
import { EditForm } from '@/components/profile/edit-form';
import type { ProfileRow } from '@/lib/onboarding/resume';

export const dynamic = 'force-dynamic';

export default async function PerfilPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // DD-O: cobraya_profiles
  const { data: profile } = await supabase
    .from('cobraya_profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle<ProfileRow>();

  return (
    <section className="max-w-md mx-auto p-4 space-y-6">
      <header>
        <h1 className="h1-serif text-luma-700">Perfil</h1>
        <p className="text-sm text-luma-450 mt-1">{user.email ?? ''}</p>
      </header>
      <EditForm defaults={profile} />
      <form action={signOut}>
        <button
          type="submit"
          className="pill-btn w-full min-h-[48px] text-luma-700"
        >
          Cerrar sesión
        </button>
      </form>
    </section>
  );
}
