// src/components/nav/BottomTabs.tsx
//
// Mobile bottom navigation — Apple Wallet / Spotify / Wise pattern:
// 4 equal-weight tabs (icon + label vertically stacked). NO raised FAB —
// the prior Cash-App FAB read "e-commerce app" rather than "institutional
// fintech with audit trails", which is the tone Cobraya wants for the
// CNBV / Bankaool / Arkangeles audience. The active tab gets a soft
// `bg-luma-100` pill behind the icon + a bold guinda label so it's
// unambiguous which tab is current; everything stays flat to the bar.
//
//   ┌──────────────────────────────────────────────────┐
//   │   ⌂        ✨        📄        👔            │
//   │ Inicio  Negociar  Historial  Perfil               │
//   │ ████                                              │
//   │ (active: bg-luma-100 pill + bold luma-700)        │
//   └──────────────────────────────────────────────────┘
//
// The pill is keyed to the icon+label stack (the whole tab item), not the
// underlying <Link> bounding box — so it reads as a contained chip even
// though the link itself fills the grid cell for ≥48px touch target.
'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { House, Receipt, User, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const HIDE_PREFIXES = ['/login', '/signup', '/auth', '/onboarding', '/~offline'];

type Tab = {
  href: string;
  label: string;
  Icon: typeof House;
};

const tabs: Tab[] = [
  { href: '/dashboard', label: 'Inicio', Icon: House },
  { href: '/negociar', label: 'Negociar', Icon: Sparkles },
  { href: '/historial', label: 'Historial', Icon: Receipt },
  { href: '/perfil', label: 'Perfil', Icon: User },
];

export function BottomTabs() {
  const pathname = usePathname() ?? '';
  if (
    pathname === '/' ||
    HIDE_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'))
  ) {
    return null;
  }
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/');

  return (
    <nav
      aria-label="Navegación principal"
      className="md:hidden fixed bottom-0 left-0 right-0 bg-luma-50/95 backdrop-blur-md border-t border-luma-200 z-40"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="grid grid-cols-4 items-stretch">
        {tabs.map((t) => (
          <li key={t.href}>
            <TabButton tab={t} active={isActive(t.href)} />
          </li>
        ))}
      </ul>
    </nav>
  );
}

function TabButton({ tab, active }: { tab: Tab; active: boolean }) {
  const { Icon } = tab;
  return (
    <Link
      href={tab.href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        // Link fills the grid cell + min-h-[48px] satisfies CD-23. The
        // inner span carries the actual visual chrome so the active pill
        // hugs the icon+label stack rather than the whole bar slot.
        'flex items-center justify-center min-h-[48px] py-2 transition-colors',
        active ? 'text-luma-700' : 'text-luma-450 hover:text-luma-600',
      )}
    >
      <span
        className={cn(
          'flex flex-col items-center gap-1 px-3 py-1 rounded-2xl transition-colors',
          active && 'bg-luma-100',
        )}
      >
        <Icon
          className={cn('w-5 h-5 transition-transform', active && 'scale-110')}
          strokeWidth={active ? 2.4 : 1.8}
          aria-hidden
          fill={active ? 'currentColor' : 'none'}
          fillOpacity={active ? 0.15 : undefined}
        />
        <span className={cn('text-[11px]', active && 'font-semibold')}>
          {tab.label}
        </span>
      </span>
    </Link>
  );
}
