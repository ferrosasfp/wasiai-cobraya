import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0A0A0A",
        paper: "#FAFAF8",
        accent: "#E84142",
        muted: "#6B7280",
        line: "#E5E5E0",
        // "Guinda Vibrante" — Cobraya fintech moderna (Cash App / Mercado Pago vibe).
        // Namespace kept as `luma-*` for diff economy; only hex values changed.
        // Anchor stops user-picked: 50, 100, 200, 400, 500, 600, 700. Intermediate
        // 300, 450, 650 interpolated to keep the perceptual ramp smooth.
        luma: {
          50: "#FFF7F2", // cream cálido — backgrounds
          100: "#FFE5E8", // pink soft — cards bg
          200: "#FFC1CA", // pink mid — borders
          300: "#E89AAA", // (interp) — disabled bg / dividers
          400: "#D4567B", // rose accent — secondary text
          450: "#B73460", // (interp) — text muted on cream
          500: "#9B1B47", // guinda vivid — body text on cream
          600: "#7A1232", // primary buttons + brand
          650: "#650F27", // (interp) — pressed states
          700: "#4F0820", // deep wine — headings, dark surfaces
        },
        // Verde Cobraya — accent SOLO para success states onchain (factura
        // settled, tx confirmada). NO usar como chrome general — el chrome es
        // guinda. Si querés un button success ad-hoc: bg-cobraya-600.
        cobraya: {
          50: "#E6F7EF",
          100: "#C5EBD7",
          500: "#14A35A",
          600: "#0F8B4A",
          700: "#0A6E3A",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["'Instrument Serif'", "serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
