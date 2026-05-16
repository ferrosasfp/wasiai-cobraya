import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules/**", "contracts/**", ".next/**"],
    coverage: { reporter: ["text", "html"] },
  },
  esbuild: {
    jsx: "automatic",
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
});
