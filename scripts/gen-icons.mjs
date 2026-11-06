// Generates the PWA icons in /public: navy background with yellow "E52".
// Letters are drawn as vector strokes so the output does not depend on installed fonts.
// Usage: npm run icons
import sharp from 'sharp';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');
mkdirSync(root, { recursive: true });

const NAVY = '#1D2D44';
const YELLOW = '#FFC914';

// Glyphs drawn in a 100x140 box.
const glyphs = [
  'M80,10 H20 V130 H80 M20,70 H68', // E
  'M80,10 H20 V65 H62 Q80,65 80,83 V112 Q80,130 62,130 H20', // 5
  'M20,28 Q20,10 38,10 H62 Q80,10 80,28 V50 Q80,66 64,72 L20,130 H80', // 2
];

/** Builds the icon SVG. `maskable` = full-bleed background with content inside the safe zone. */
function svg(size, { maskable = false, rounded = true } = {}) {
  const textWidth = 340; // 3 glyphs * 100 + 2 gaps * 20
  const scale = (size * (maskable ? 0.5 : 0.66)) / textWidth;
  const tx = (size - textWidth * scale) / 2;
  const ty = (size - 140 * scale) / 2 - size * 0.02;
  const r = maskable || !rounded ? 0 : size * 0.22;
  const paths = glyphs
    .map((d, i) => `<path d="${d}" transform="translate(${i * 120},0)"/>`)
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${r}" fill="${NAVY}"/>
  <g transform="translate(${tx},${ty}) scale(${scale})" fill="none" stroke="${YELLOW}" stroke-width="17" stroke-linecap="round" stroke-linejoin="round">${paths}</g>
  <rect x="${size * 0.3}" y="${size * (maskable ? 0.68 : 0.74)}" width="${size * 0.4}" height="${size * 0.03}" rx="${size * 0.015}" fill="#17BEBB"/>
</svg>`;
}

const out = [
  ['pwa-192x192.png', 192, {}],
  ['pwa-512x512.png', 512, {}],
  ['maskable-512x512.png', 512, { maskable: true }],
  ['apple-touch-icon.png', 180, { rounded: false }],
];

for (const [name, size, opts] of out) {
  await sharp(Buffer.from(svg(size, opts))).png().toFile(join(root, name));
  console.log('ok', name);
}
writeFileSync(join(root, 'favicon.svg'), svg(64));
console.log('ok favicon.svg');
