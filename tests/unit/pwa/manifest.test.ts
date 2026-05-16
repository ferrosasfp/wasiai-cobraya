import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("PWA manifest", () => {
  // theme_color migrated to Guinda Vibrante palette (was burgundy #651332 in
  // W11; now #7A1232 = luma-600 in the new Cash-App-vibe ramp). AC-17 stays
  // valid as long as theme_color tracks the visible primary brand color.
  it("manifest.json parses + 3 icons + guinda theme + maskable purpose (T-PWA-1 + AC-17)", () => {
    const file = path.resolve(__dirname, "../../../public/manifest.json");
    const raw = fs.readFileSync(file, "utf8");
    const m = JSON.parse(raw) as {
      name: string;
      theme_color: string;
      background_color: string;
      icons: Array<{ src: string; sizes: string; purpose?: string }>;
    };
    expect(m.name).toBe("Cobraya");
    // AC-17: guinda vibrante primary (luma-600 in the new palette).
    expect(m.theme_color).toBe("#7A1232");
    // Background = deepest stop (luma-700 in the new palette).
    expect(m.background_color).toBe("#4F0820");
    expect(m.icons.length).toBe(3);
    const purposes = m.icons.map((i) => i.purpose ?? "any");
    expect(purposes).toContain("maskable");
  });
});
