// src/components/BrandIcon.tsx — Cobraya brand icon (DD-K, W8 rewrite).
// Uses CSS custom properties so it follows the burgundy palette and degrades
// gracefully when the icon is rasterised in a context where the variables
// aren't resolved (favicons, splash screens) — hex fallbacks cover that.
export function BrandIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 56 56"
      fill="none"
      aria-hidden="true"
      className="w-10 h-10"
    >
      <rect width="56" height="56" rx="13" fill="var(--luma-700, #5B0426)" />
      <path
        d="M40 18 Q28 12 19 21 Q12 28 19 38 Q28 47 40 41 L40 35 Q32 39 25 34 Q21 28 25 23 Q32 17 40 23 Z"
        fill="var(--luma-50, #FCF7F3)"
      />
    </svg>
  );
}
