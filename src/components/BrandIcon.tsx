// src/components/BrandIcon.tsx
//
// Cobraya Flow brand system — three reusable building blocks for the
// brand identity across the app, splashes, and the PWA app-icon variants.
//
//   <BrandMark />     — symbol only (two interlocking C-arcs)
//   <Wordmark />      — type-only "cobraya" in Instrument Serif italic
//   <BrandLockup />   — mark + wordmark, horizontal
//   <BrandAppIcon />  — square with bg, used by /splash, /icon-512 PNG export
//
// Design intent ("Cobraya Flow"):
//   - Two interlocking C-arcs (one guinda primary, one rose accent) that
//     overlap visually at the center, forming an abstract "CY" lockup +
//     a generic "flow" symbol — communicates the factura→USDC transformation
//     without resorting to literal coin/snake imagery.
//   - Each arc is ~270° of a circle, drawn with a stroke-linecap=round +
//     a wedge of negative space where the C "opens" — so the mark reads
//     cleanly at 16 px (favicon) without breaking down.
//   - Currency-agnostic, regulator-safe (no coin/dollar imagery), works in
//     mono for SMS / dark UI / printed materials.
//
// Color tokens come from `var(--luma-*)` so the mark inherits whatever
// palette is active at render time (Guinda Vibrante today, swappable later).
import { cn } from '@/lib/utils';

type SizeProp = { className?: string; title?: string };

/**
 * Cobraya Flow symbol — two interlocking C-arcs.
 * Renders at any size via className (`w-8 h-8`, `w-24 h-24`, etc.).
 * `currentColor` is inherited; the accent arc uses a fixed rose tone so the
 * mark stays recognizable even when placed on guinda backgrounds.
 */
export function BrandMark({ className, title }: SizeProp) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      fill="none"
      aria-label={title ?? undefined}
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      className={cn('w-10 h-10', className)}
    >
      {title ? <title>{title}</title> : null}
      {/*
        Upper-left C-arc — opens to the lower-right corner.
        From (38,24) counter-clockwise the long way to (24,38), radius 14.
        Primary tone (currentColor, guinda when placed on cream).
      */}
      <path
        d="M 38 24 A 14 14 0 1 0 24 38"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
      />
      {/*
        Lower-right C-arc — mirror, opens to the upper-left corner.
        Rose accent at 70% so it harmonizes when the mark is mono-stroked
        on a colored background (auth hero, splash) but still differentiates
        the two arcs when on cream.
      */}
      <path
        d="M 26 40 A 14 14 0 1 0 40 26"
        stroke="currentColor"
        strokeOpacity="0.5"
        strokeWidth="6"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Cobraya wordmark — type-only, lowercase, Instrument Serif italic.
 * Uses the existing `.serif` global class so it inherits the Google Fonts
 * load without needing a separate font dependency.
 */
export function Wordmark({ className }: SizeProp) {
  return (
    <span
      className={cn(
        'serif italic tracking-tight leading-none lowercase',
        className,
      )}
    >
      cobraya
    </span>
  );
}

/**
 * Mark + wordmark side-by-side. Default size pairs with the TopNav row
 * (mark 28 px high, wordmark 1.5 rem) but is fully sizable via `className`.
 */
export function BrandLockup({
  className,
  markClassName,
  wordmarkClassName,
}: {
  className?: string;
  markClassName?: string;
  wordmarkClassName?: string;
}) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <BrandMark className={cn('w-7 h-7', markClassName)} />
      <Wordmark className={cn('text-2xl', wordmarkClassName)} />
    </span>
  );
}

/**
 * Square app-icon variant — guinda background + cream mark inside. Used by:
 *   - dashboard splash circle
 *   - auth pages logo
 *   - source for PNG export (generate-pwa-assets.mjs reads viewBox geometry)
 */
export function BrandAppIcon({ className }: SizeProp) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className={cn('w-14 h-14', className)}
    >
      <rect width="64" height="64" rx="14" fill="var(--luma-600, #7A1232)" />
      <path
        d="M 38 24 A 14 14 0 1 0 24 38"
        stroke="var(--luma-50, #FFF7F2)"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M 26 40 A 14 14 0 1 0 40 26"
        stroke="var(--luma-200, #FFC1CA)"
        strokeWidth="6"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Legacy export — kept so existing imports (`import { BrandIcon }`) keep
// compiling. Defaults to the app-icon variant, which is what the old call
// sites rendered (dark square + cream interior).
export const BrandIcon = BrandAppIcon;
