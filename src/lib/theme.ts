/** Visual constants shared across the UI. */
export const QUARTER_COLORS: Record<number, string> = {
  1: '#3E7CB1',
  2: '#8E44AD',
  3: '#D35400',
  4: '#2E8B57',
};

export const COLORS = {
  navy: '#1D2D44',
  red: '#E4572E',
  teal: '#17BEBB',
  yellow: '#FFC914',
  lime: '#76B041',
  bg: '#F2F4F7',
};

export const quarterColor = (q: number) => QUARTER_COLORS[q] ?? COLORS.navy;

/** Hex color with alpha (0..1) → rgba(). */
export function withAlpha(hex: string, alpha: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

/** Fisher–Yates shuffle (returns a new array). */
export function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
