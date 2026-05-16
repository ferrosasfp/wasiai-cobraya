#!/usr/bin/env node
// One-shot PWA asset generator for Cobraya — renders the "Cobraya Flow" mark
// (two interlocking C-arcs) as PNG assets for PWA / Apple install affordance.
// Manual run: `npm run assets:pwa`.
//
// Outputs:
//   public/icons/icon-{192,512}.png
//   public/icons/icon-maskable-512.png
//   public/icons/apple-touch-icon-{120,152,180}.png
//   public/splashes/splash-iphone-{1170x2532,1284x2778}.png
//   public/splashes/splash-ipad-1668x2388.png
//
// Implementation notes:
//   - No SVG renderer dependency — we rasterize manually with pngjs by
//     drawing each arc as a thick ring sector. Two filled circles per arc
//     (outer + inner) yield the stroke width; the "opening" of the C is
//     a rectangular cut-out of the appropriate quadrant.
//   - Palette pinned to Guinda Vibrante (mirror of globals.css / tailwind).
//     If those change, update the constants below.

import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';

const ROOT = resolve(fileURLToPath(import.meta.url), '../..');

// Palette pinned to Guinda Vibrante (Cobraya Flow brand system).
const GUINDA = { r: 0x7A, g: 0x12, b: 0x32 };  // #7A1232 — bg
const CREAM = { r: 0xFF, g: 0xF7, b: 0xF2 };   // #FFF7F2 — primary arc
const ROSE = { r: 0xFF, g: 0xC1, b: 0xCA };    // #FFC1CA — accent arc

function newCanvas(w, h, bg) {
  const png = new PNG({ width: w, height: h });
  for (let i = 0; i < w * h; i++) {
    const o = i * 4;
    png.data[o + 0] = bg.r;
    png.data[o + 1] = bg.g;
    png.data[o + 2] = bg.b;
    png.data[o + 3] = 255;
  }
  return png;
}

// Anti-aliased pixel write: blends `color` over the existing pixel by `alpha`.
function blendPixel(png, x, y, color, alpha) {
  if (x < 0 || y < 0 || x >= png.width || y >= png.height) return;
  const o = (y * png.width + x) * 4;
  const a = Math.max(0, Math.min(1, alpha));
  png.data[o + 0] = (color.r * a + png.data[o + 0] * (1 - a)) | 0;
  png.data[o + 1] = (color.g * a + png.data[o + 1] * (1 - a)) | 0;
  png.data[o + 2] = (color.b * a + png.data[o + 2] * (1 - a)) | 0;
  png.data[o + 3] = 255;
}

// Draw an open arc by visiting every pixel inside a thick ring and selectively
// keeping only those whose angle falls outside the "opening" gap. Anti-aliasing
// at the inner+outer edges of the stroke.
//
// cx, cy            — center
// radius            — center-line radius of the stroke
// strokeWidth       — stroke thickness (the visual band width)
// openingCenterDeg  — angle (degrees, 0° = +x, CCW positive) where the opening
//                     of the C is centered
// openingArcDeg     — angular size of the opening (degrees)
// color             — RGB color object
function drawArc(png, cx, cy, radius, strokeWidth, openingCenterDeg, openingArcDeg, color) {
  const outerR = radius + strokeWidth / 2;
  const innerR = radius - strokeWidth / 2;
  const outerR2 = outerR * outerR;
  const innerR2 = innerR * innerR;
  const openCenter = (openingCenterDeg * Math.PI) / 180;
  const openHalf = (openingArcDeg / 2) * Math.PI / 180;
  const xMin = Math.floor(cx - outerR) - 1;
  const xMax = Math.ceil(cx + outerR) + 1;
  const yMin = Math.floor(cy - outerR) - 1;
  const yMax = Math.ceil(cy + outerR) + 1;
  for (let y = yMin; y <= yMax; y++) {
    for (let x = xMin; x <= xMax; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const d2 = dx * dx + dy * dy;
      if (d2 > outerR2 + 2 || d2 < innerR2 - 2) continue;
      // Angle check — skip pixels inside the opening wedge.
      const ang = Math.atan2(-dy, dx); // -dy because y grows downward in image space
      let delta = ang - openCenter;
      while (delta > Math.PI) delta -= 2 * Math.PI;
      while (delta < -Math.PI) delta += 2 * Math.PI;
      if (Math.abs(delta) < openHalf) continue;
      // Alpha at the band edges for anti-alias.
      const d = Math.sqrt(d2);
      let alpha = 1;
      if (d > outerR - 1) alpha = Math.max(0, outerR - d);
      else if (d < innerR + 1) alpha = Math.max(0, d - innerR);
      blendPixel(png, x, y, color, alpha);
    }
  }
}

// Draw the "Cobraya Flow" mark (two interlocking C-arcs) inside an arbitrary
// circular safe area. `markScale` is the diameter of the conceptual bounding
// circle as a fraction of `size`.
//
//   - Upper-left arc: opens toward the lower-right corner (315°)
//   - Lower-right arc: mirror, opens toward the upper-left corner (135°)
function drawCobrayaFlow(png, cx, cy, markScale, size, primaryColor, accentColor) {
  // Geometry from the SVG (viewBox 64×64): two circles of radius 14 each,
  // centered at (24, 24) and (40, 40) respectively. The stroke is 6 px on
  // the 64-unit canvas → strokeWidth = 6/64 of size.
  const unit = (size * markScale) / 64;
  const strokeWidth = 6 * unit;
  const arcRadius = 14 * unit;
  // Upper-left arc center, mapped onto pixel space.
  const u1 = { x: cx - 8 * unit, y: cy - 8 * unit };
  // Lower-right arc center.
  const u2 = { x: cx + 8 * unit, y: cy + 8 * unit };
  drawArc(png, u1.x, u1.y, arcRadius, strokeWidth, 315, 90, primaryColor);
  drawArc(png, u2.x, u2.y, arcRadius, strokeWidth, 135, 90, accentColor);
}

function writePNG(png, outPath) {
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, PNG.sync.write(png));
  const { width, height } = png;
  console.log(`  ✓ ${outPath}  (${width}x${height})`);
}

// --- pipeline -------------------------------------------------------------
console.log('Generating Cobraya PWA assets (Cobraya Flow brand)...');

// 1. PWA icons (full-bleed mark on guinda background)
for (const size of [192, 512]) {
  const canvas = newCanvas(size, size, GUINDA);
  drawCobrayaFlow(canvas, size / 2, size / 2, 0.6, size, CREAM, ROSE);
  writePNG(canvas, resolve(ROOT, `public/icons/icon-${size}.png`));
}

// 2. Maskable 512 (smaller safe zone 80%)
{
  const canvas = newCanvas(512, 512, GUINDA);
  drawCobrayaFlow(canvas, 256, 256, 0.5, 512, CREAM, ROSE);
  writePNG(canvas, resolve(ROOT, 'public/icons/icon-maskable-512.png'));
}

// 3. Apple touch icons
for (const size of [120, 152, 180]) {
  const canvas = newCanvas(size, size, GUINDA);
  drawCobrayaFlow(canvas, size / 2, size / 2, 0.55, size, CREAM, ROSE);
  writePNG(canvas, resolve(ROOT, `public/icons/apple-touch-icon-${size}.png`));
}

// 4. iOS splash screens (mark roughly centered, smaller scale)
const splashes = [
  { w: 1170, h: 2532, file: 'splash-iphone-1170x2532.png' },
  { w: 1284, h: 2778, file: 'splash-iphone-1284x2778.png' },
  { w: 1668, h: 2388, file: 'splash-ipad-1668x2388.png' },
];
for (const { w, h, file } of splashes) {
  const canvas = newCanvas(w, h, GUINDA);
  const short = Math.min(w, h);
  drawCobrayaFlow(canvas, w / 2, h / 2, short / w * 0.32, w, CREAM, ROSE);
  writePNG(canvas, resolve(ROOT, `public/splashes/${file}`));
}

console.log('\nDone.');
