/**
 * Leitner-style spaced repetition.
 * Box 0..4 → the word comes back after 1, 3, 7, 14 and 30 days.
 * "Sei / I know" moves the word up one box; "Revisar / Review" sends it back to box 0 (1 day).
 */
import type { SrsCard } from '../types';

export const INTERVAL_DAYS = [1, 3, 7, 14, 30] as const;
export const MAX_BOX = INTERVAL_DAYS.length - 1;
const DAY = 24 * 60 * 60 * 1000;

/** Start of the local day for a timestamp. */
export function startOfDay(t: number): number {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Due time = start of the day `days` from now, so reviews are available all day. */
function dueIn(days: number, now: number): number {
  return startOfDay(now) + days * DAY;
}

/** New card for a word that was just learned. */
export function newCard(now = Date.now()): SrsCard {
  return { box: 0, due: dueIn(INTERVAL_DAYS[0], now) };
}

/** Applies an answer to a card and returns the updated card. */
export function answer(card: SrsCard, known: boolean, now = Date.now()): SrsCard {
  const box = known ? Math.min(card.box + 1, MAX_BOX) : 0;
  return { box, due: dueIn(INTERVAL_DAYS[box], now), last: now };
}

/** A card is due if its due time has passed (any time today counts). */
export function isDue(card: SrsCard, now = Date.now()): boolean {
  return card.due <= now;
}

/** Ids of cards due now. */
export function dueIds(srs: Record<string, SrsCard>, now = Date.now()): string[] {
  return Object.entries(srs)
    .filter(([, c]) => isDue(c, now))
    .sort((a, b) => a[1].due - b[1].due)
    .map(([id]) => id);
}

/** Number of cards in each box. */
export function boxCounts(srs: Record<string, SrsCard>): number[] {
  const counts = INTERVAL_DAYS.map(() => 0);
  Object.values(srs).forEach((c) => counts[Math.min(c.box, MAX_BOX)]++);
  return counts;
}
