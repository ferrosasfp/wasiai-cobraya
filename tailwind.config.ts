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
        luma: {
          50: "#FCF7F3",
          100: "#F5E9DD",
          200: "#E8D2BB",
          300: "#D6B498",
          400: "#B8896F",
          450: "#9C6F58",
          500: "#7E523F",
          600: "#651332",
          650: "#5F0F2D",
          700: "#5B0426",
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
