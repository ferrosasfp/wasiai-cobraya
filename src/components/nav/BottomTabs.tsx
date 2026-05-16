// src/components/nav/BottomTabs.tsx
//
// Mobile bottom navigation — Cash App / Mercado Pago pattern:
// 3 surrounding tabs + a raised FAB ("Negociar") that floats above the bar.
// The FAB is the primary action (factoring a new invoice) — its elevation
// communicates "this is what you do here" without needing copy.
//
// Layout (4-col grid, FAB occupies the 3rd column visually but is absolutely
// positioned so it lifts above the bar via translateY):
//
//   ┌──────────────────────────────────────────────────────┐
//   │ [Inicio]   [Historial]    [⊕]      [Perfil]          │
//   │                          FAB ↑ -translate-y-1/2      │
//   └──────────────────────────────────────────────────────┘
//
// The FAB uses bg-luma-600 (guinda primary) + ring-luma-50 (cream outer ring
// to lift it off the bar visually) + shadow-2xl.
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

const leftTabs: Tab[] = [
  { href: '/dashboard', label: 'Inicio', Icon: House },
  { href: '/historial', label: 'Historial', Icon: Receipt },
];

const rightTabs: Tab[] = [
  { href: '/perfil', label: 'Perfil', Icon: User },
];

const FAB: Tab = { href: '/negociar', label: 'Negociar', Icon: Sparkles };

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
      <div className="relative grid grid-cols-4 items-center px-2 pt-2 pb-1">
        {leftTabs.map((t) => (
          <TabButton key={t.href} tab={t} active={isActive(t.href)} />
        ))}

        {/* Spacer column where the FAB visually centers above the bar. */}
        <div aria-hidden className="h-12" />

        {rightTabs.map((t) => (
          <TabButton key={t.href} tab={t} active={isActive(t.href)} />
        ))}

        {/* FAB — absolutely positioned over column 3, lifted via translateY. */}
        <FloatingActionButton tab={FAB} active={isActive(FAB.href)} />
      </div>
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
        'flex flex-col items-center justify-center gap-1 min-h-[48px] py-2 text-[11px] transition-colors',
        active ? 'text-luma-700 font-semibold' : 'text-luma-450 hover:text-luma-600',
      )}
    >
      <Icon
        className={cn(
          'w-5 h-5 transition-transform',
          active && 'scale-110',
        )}
        strokeWidth={active ? 2.4 : 1.8}
        aria-hidden
      />
      <span>{tab.label}</span>
    </Link>
  );
}

function FloatingActionButton({ tab, active }: { tab: Tab; active: boolean }) {
  const { Icon } = tab;
  return (
    <Link
      href={tab.href}
      aria-current={active ? 'page' : undefined}
      aria-label={`${tab.label} — acción principal`}
      className={cn(
        'absolute left-1/2 -translate-x-1/2 -translate-y-1/2 top-0',
        'flex flex-col items-center',
      )}
    >
      <div
        className={cn(
          'flex items-center justify-center w-14 h-14 rounded-full',
          'bg-luma-600 text-luma-50 ring-4 ring-luma-50',
          'shadow-[0_8px_24px_-4px_rgba(79,8,32,0.5)]',
          'transition-transform hover:scale-105 active:scale-95',
          active && 'bg-luma-700',
        )}
      >
        <Icon className="w-6 h-6" strokeWidth={2.2} aria-hidden />
      </div>
      <span
        className={cn(
          'mt-1 text-[11px] transition-colors',
          active ? 'text-luma-700 font-semibold' : 'text-luma-600',
        )}
      >
        {tab.label}
      </span>
    </Link>
  );
}
