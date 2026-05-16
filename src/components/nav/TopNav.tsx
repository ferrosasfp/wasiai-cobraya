'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { BrandMark, Wordmark } from '@/components/BrandIcon';

const desktopTabs = [
  { href: '/dashboard', label: 'Inicio' },
  { href: '/negociar', label: 'Negociar' },
  { href: '/historial', label: 'Historial' },
  { href: '/perfil', label: 'Perfil' },
];

// AR-BLQ-BAJO-1: TopNav must self-hide on auth/onboarding routes (and the
// splash `/`) so the navigation doesn't render where it cannot be used. Nested
// layouts don't replace ancestor layouts in Next.js, so the parent `(app)`
// layout's <TopNav /> renders inside `(app)/onboarding/*` too. This prefix
// list mirrors `BottomTabs.tsx` and matches the DD-D / Story §10 wireframe
// ("no TopNav, no BottomTabs" on onboarding screens).
const HIDE_PREFIXES = ['/login', '/signup', '/auth', '/onboarding', '/~offline'];

export function TopNav() {
  const pathname = usePathname() ?? '';
  if (pathname === '/' || HIDE_PREFIXES.some((p) => pathname.startsWith(p))) {
    return null;
  }
  return (
    <header
      className="w-full text-luma-50"
      style={{ background: 'var(--luma-nav-gradient)' }}
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-luma-50"
          aria-label="Cobraya · inicio"
        >
          <BrandMark className="w-7 h-7" />
          <Wordmark className="text-2xl text-luma-50" />
        </Link>
        <nav
          aria-label="Navegación de escritorio"
          className="hidden md:flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-2 py-1"
        >
          {desktopTabs.map((t) => {
            const active =
              pathname === t.href || pathname.startsWith(t.href + '/');
            return (
              <Link
                key={t.href}
                href={t.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'px-4 py-2 rounded-full text-sm min-h-[40px] inline-flex items-center',
                  active
                    ? 'bg-white/30 text-luma-50 font-medium'
                    : 'text-luma-50/85 hover:bg-white/15',
                )}
              >
                {t.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
