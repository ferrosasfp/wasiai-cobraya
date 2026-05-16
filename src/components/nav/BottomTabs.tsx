'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const HIDE_PREFIXES = ['/login', '/signup', '/auth', '/onboarding', '/~offline'];

const tabs = [
  { href: '/dashboard', label: 'Inicio' },
  { href: '/negociar', label: 'Negociar' },
  { href: '/historial', label: 'Historial' },
  { href: '/perfil', label: 'Perfil' },
];

export function BottomTabs() {
  const pathname = usePathname() ?? '';
  if (
    pathname === '/' ||
    HIDE_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'))
  ) {
    return null;
  }
  return (
    <nav
      aria-label="Navegación principal"
      className="md:hidden fixed bottom-0 left-0 right-0 bg-luma-50 border-t border-luma-200 z-40"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="flex justify-around items-center">
        {tabs.map((t) => {
          const active = pathname === t.href || pathname.startsWith(t.href + '/');
          return (
            <li key={t.href} className="flex-1">
              <Link
                href={t.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex flex-col items-center justify-center min-h-[48px] py-2 text-xs',
                  active ? 'text-luma-700 font-medium' : 'text-luma-450',
                )}
              >
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
