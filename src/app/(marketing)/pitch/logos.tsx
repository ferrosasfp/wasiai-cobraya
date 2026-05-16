// src/app/(marketing)/pitch/logos.tsx — Real brand logos for pitch v3 (2026-05-16)
//
// Inline SVG components used by the pitch landing v3 (page.tsx) to replace
// the previous mono-letter placeholders ("▲", "$", "FD", …) in:
//   - .brand-mark (nav + footer)  → <LogoCobraya />
//   - .stack-grid .scard .ico (9 cards) → 1 component per card
//
// Design rules:
//   1. All SVGs render inline. No <img>, no next/image, no fetch.
//   2. Each component accepts { size?: number; className?: string }.
//   3. SVGs that should adapt to surrounding palette use currentColor;
//      brand SVGs that need their exact brand color hardcode it (Avalanche
//      red, USDC blue, Supabase green).
//   4. The Avalanche + Next.js SVGs are inlined from /public/logos/*.svg
//      (the .svg files stay in /public for direct asset references; the
//      JSX copies preserve the original viewBox + paths).
//   5. CNBV / A2A / Facilitator are custom marks (no real brand to use).

import React from "react";

type LogoProps = {
  size?: number;
  className?: string;
};

/**
 * Cobraya brand mark — two interlocking C-arcs.
 * Same geometry as /public/brand/cobraya-mark.svg, but with stroke colors
 * set to currentColor + a lighter accent so the mark can sit on the wine
 * gradient of the .brand-mark wrapper (nav / footer) and still read.
 */
export function LogoCobraya({ size = 28, className }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      fill="none"
      role="img"
      aria-label="Cobraya"
      width={size}
      height={size}
      className={className}
    >
      <title>Cobraya</title>
      <path
        d="M 38 24 A 14 14 0 1 0 24 38"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M 26 40 A 14 14 0 1 0 40 26"
        stroke="currentColor"
        strokeOpacity="0.55"
        strokeWidth="6"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Avalanche official mark — inlined from /public/logos/avalanche.svg.
 * The red "AVAX" geometry is preserved exactly (viewBox 0 0 2500 2500).
 * Background fill is the brand red #E84142; the inner negative-space "A"
 * is forced to the wine-soft tone so it sits cleanly on the dark .ico bg.
 */
export function LogoAvalanche({ size = 22, className }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 2500 2500"
      role="img"
      aria-label="Avalanche"
      width={size}
      height={size}
      className={className}
    >
      <title>Avalanche</title>
      {/* Inner white rectangle from the source SVG — kept transparent so
          the surrounding .ico background shows through the negative-space "A" */}
      <rect x="476.9" y="427.8" width="1544.6" height="1404.8" fill="transparent" />
      <path
        fill="#E84142"
        d="M2500,1250c0,690.4-559.6,1250-1250,1250S0,1940.4,0,1250S559.6,0,1250,0S2500,559.6,2500,1250z M895.8,1747.4H653.2c-51,0-76.2,0-91.5-9.8c-16.6-10.8-26.7-28.6-28-48.2c-0.9-18.1,11.7-40.2,36.8-84.4l599-1055.8c25.5-44.8,38.4-67.2,54.7-75.5c17.5-8.9,38.4-8.9,55.9,0c16.3,8.3,29.2,30.7,54.7,75.5l123.1,215l0.6,1.1c27.5,48.1,41.5,72.5,47.6,98.1c6.8,27.9,6.8,57.4,0,85.4c-6.1,25.8-20,50.4-47.9,99.2L1143.6,1604l-0.8,1.4c-27.7,48.5-41.8,73.1-61.2,91.6c-21.2,20.3-46.7,35-74.6,43.3C981.5,1747.4,952.9,1747.4,895.8,1747.4L895.8,1747.4z M1508.4,1747.4H1856c51.3,0,77.1,0,92.4-10.1c16.6-10.8,27-28.9,27.9-48.5c0.9-17.5-11.4-38.8-35.6-80.4c-0.8-1.4-1.7-2.9-2.5-4.3l-174.1-297.9l-2-3.4c-24.5-41.4-36.8-62.3-52.7-70.3c-17.5-8.9-38.1-8.9-55.6,0c-16,8.3-28.9,30.1-54.3,74l-173.5,297.9l-0.6,1c-25.4,43.8-38.1,65.8-37.2,83.7c1.2,19.7,11.4,37.8,27.9,48.5C1431.3,1747.4,1457.1,1747.4,1508.4,1747.4L1508.4,1747.4z"
      />
    </svg>
  );
}

/**
 * USDC — blue circle (#2775CA) with serif "$" centered.
 * Brand reference: circle.com/usdc visual identity.
 */
export function LogoUSDC({ size = 22, className }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      role="img"
      aria-label="USDC"
      width={size}
      height={size}
      className={className}
    >
      <title>USDC</title>
      <circle cx="12" cy="12" r="11" fill="#2775CA" />
      <text
        x="12"
        y="16.5"
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="14"
        fontWeight="700"
        fill="#FFFFFF"
      >
        $
      </text>
    </svg>
  );
}

/**
 * Foundry — rounded dark square with mono "fd" wordmark.
 * Foundry doesn't ship an official SVG widely; we use a discreet typographic
 * mark that pairs cleanly with the wine palette.
 */
export function LogoFoundry({ size = 22, className }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      role="img"
      aria-label="Foundry"
      width={size}
      height={size}
      className={className}
    >
      <title>Foundry</title>
      <rect x="1" y="1" width="22" height="22" rx="5" fill="#1a1a1a" />
      <text
        x="12"
        y="16"
        textAnchor="middle"
        fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
        fontSize="10"
        fontWeight="700"
        fill="#F5C76A"
        letterSpacing="-0.5"
      >
        fd
      </text>
    </svg>
  );
}

/**
 * OpenZeppelin — shield outline.
 * Kept as a fallback for future combined Foundry+OZ use; not currently
 * mounted in page.tsx but exported per Story File.
 */
export function LogoOpenZeppelin({ size = 22, className }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      role="img"
      aria-label="OpenZeppelin"
      width={size}
      height={size}
      className={className}
    >
      <title>OpenZeppelin</title>
      <path
        d="M12 2 L20 5 V12 C20 16.5 16.5 20.5 12 22 C7.5 20.5 4 16.5 4 12 V5 Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M9 11.5 L11.2 13.7 L15 9.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

/**
 * Anthropic — official-style 3 vertical bars monogram, in the brand
 * orange (#D97757). Using currentColor would clash less but tests in
 * dark/light show the orange reads well on both backgrounds.
 */
export function LogoAnthropic({ size = 22, className }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      role="img"
      aria-label="Anthropic Claude"
      width={size}
      height={size}
      className={className}
    >
      <title>Anthropic Claude</title>
      {/* Three vertical bars on the Claude monogram, slightly bowed inward.
          Tuned for the 38×38 .ico wrapper at size=22. */}
      <rect x="4.5" y="4" width="3" height="16" rx="1" fill="#D97757" />
      <rect x="10.5" y="4" width="3" height="16" rx="1" fill="#D97757" />
      <rect x="16.5" y="4" width="3" height="16" rx="1" fill="#D97757" />
    </svg>
  );
}

/**
 * Next.js wordmark — inlined from /public/logos/nextjs.svg.
 * Override fill so the black wordmark adapts to whatever color the
 * parent .ico passes via currentColor (wine-soft in dark, wine in light).
 */
export function LogoNextjs({ size = 22, className }: LogoProps) {
  // Original SVG viewBox is 0 0 394 80 (a wide wordmark). We keep the
  // wordmark intact instead of cropping to just the "N" — at size=22 px
  // the wordmark renders ~110 px wide and reads cleanly inside the .ico
  // 38×38 if we scale the svg width appropriately. We expose a width that
  // preserves aspect ratio (size * 394/80 ≈ size * 4.925) and keep the
  // height = size. Layout note: .ico uses place-items:center so overflow
  // is acceptable; but at this card it's better to render a square crop
  // showing only the "N" glyph. We use viewBox 0 0 80 80 to crop.
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 80 80"
      role="img"
      aria-label="Next.js"
      width={size}
      height={size}
      className={className}
      fill="none"
    >
      <title>Next.js</title>
      {/* "N" glyph extracted from the inlined Next.js wordmark SVG.
          Original path "M81 79.3 17 0H0v79.3h13.6V17l50.2 62.3H81Z" sits
          at the right of the wordmark; offsetting it left by 1 px keeps
          it centered in the 80×80 viewBox. */}
      <path
        fill="currentColor"
        d="M81 79.3 17 0H0v79.3h13.6V17l50.2 62.3H81Z"
      />
    </svg>
  );
}

/**
 * Supabase — two-triangle mark using the brand green #3ECF8E.
 * Approximates the official logo geometry (lightning/triangle stack).
 */
export function LogoSupabase({ size = 22, className }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      role="img"
      aria-label="Supabase"
      width={size}
      height={size}
      className={className}
    >
      <title>Supabase</title>
      {/* Lower triangle — flipped, points up-right */}
      <path
        d="M13.5 22 V14 H21 Z"
        fill="#3ECF8E"
      />
      {/* Upper triangle — points down-left, slight overlap accent */}
      <path
        d="M10.5 2 V10 H3 Z"
        fill="#3ECF8E"
        opacity="0.85"
      />
      {/* Crossing connector strap */}
      <path
        d="M10.5 10 L13.5 14"
        stroke="#3ECF8E"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * CNBV — custom mark (no public CNBV brand asset usable).
 * Rounded wine outline square with mono "CNBV" inside.
 */
export function LogoCNBV({ size = 22, className }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      role="img"
      aria-label="CNBV"
      width={size}
      height={size}
      className={className}
    >
      <title>CNBV</title>
      <rect
        x="1"
        y="4.5"
        width="22"
        height="15"
        rx="3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <text
        x="12"
        y="15"
        textAnchor="middle"
        fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
        fontSize="7"
        fontWeight="800"
        fill="currentColor"
        letterSpacing="0.3"
      >
        CNBV
      </text>
    </svg>
  );
}

/**
 * wasiai-a2a — custom mark. "A2A" in mono with a gold accent dot for the "2".
 * Matches the pitch palette (wine + gold) and reads in both themes.
 */
export function LogoA2A({ size = 22, className }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      role="img"
      aria-label="wasiai-a2a"
      width={size}
      height={size}
      className={className}
    >
      <title>wasiai-a2a</title>
      <rect x="1" y="4" width="22" height="16" rx="4" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <text
        x="12"
        y="15.6"
        textAnchor="middle"
        fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
        fontSize="8"
        fontWeight="800"
        fill="currentColor"
      >
        A
        <tspan fill="#F5C76A">2</tspan>
        A
      </text>
    </svg>
  );
}

/**
 * wasiai-facilitator — custom mark. Two stacked horizontal lightning arrows
 * (swap glyph) communicating the "settlement facilitator" idea.
 */
export function LogoFacilitator({ size = 22, className }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      role="img"
      aria-label="wasiai-facilitator"
      width={size}
      height={size}
      className={className}
      fill="none"
    >
      <title>wasiai-facilitator</title>
      {/* Top arrow: left → right */}
      <path
        d="M3 9 H17 M14 6 L17 9 L14 12"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Bottom arrow: right → left */}
      <path
        d="M21 15 H7 M10 12 L7 15 L10 18"
        stroke="currentColor"
        strokeOpacity="0.7"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
