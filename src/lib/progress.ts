/**
 * Pure functions that derive progress numbers from the stored data.
 * Week % = words% × w.words + phrases% × w.phrases + book × w.book + video × w.video (weights from weeks.json).
 * Year % = average of the 52 week percentages.
 */
import { bookWeeks, course, phraseId, TOTAL_WEEKS, weeks, wordId } from '../data/course';
import type { ProgressData, Week } from '../types';
import { startOfDay } from './srs';

const DAY = 24 * 60 * 60 * 1000;
/** A week unlocks when the previous one reaches this percentage. */
export const UNLOCK_THRESHOLD = 70;

export interface WeekBreakdown {
  words: number; // 0..100
  phrases: number; // 0..100
  book: number; // 0 | 100
  video: number; // 0 | 100
  total: number; // 0..100 weighted
  wordsLearned: number;
  phrasesPracticed: number;
}

type ProgressSlice = Pick<ProgressData, 'learnedWords' | 'practicedPhrases' | 'booksRead' | 'videosWatched'>;

export function weekBreakdown(week: Week, p: ProgressSlice): WeekBreakdown {
  const wordsLearned = week.words.filter((_, i) => p.learnedWords[wordId(week.week, i)]).length;
  const phrasesPracticed = week.phrases.filter((_, i) => p.practicedPhrases[phraseId(week.week, i)]).length;
  const words = week.words.length ? (wordsLearned / week.words.length) * 100 : 100;
  const phrases = week.phrases.length ? (phrasesPracticed / week.phrases.length) * 100 : 100;
  const book = p.booksRead[week.week] ? 100 : 0;
  const video = p.videosWatched[week.week] ? 100 : 0;
  const w = course.weights;
  const sumW = w.words + w.phrases + w.book + w.video || 1;
  const total = (words * w.words + phrases * w.phrases + book * w.book + video * w.video) / sumW;
  return { words, phrases, book, video, total, wordsLearned, phrasesPracticed };
}

/** Percentages of all weeks, index 0 = week 1. */
export function allWeekPercents(p: ProgressSlice): number[] {
  return weeks.map((w) => weekBreakdown(w, p).total);
}

export function yearPercent(p: ProgressSlice): number {
  const all = allWeekPercents(p);
  return all.reduce((a, b) => a + b, 0) / (all.length || 1);
}

/** Parses "YYYY-MM-DD" as a local date. */
export function parseDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Program week (1..52) for a given moment, based on the start date. */
export function programWeekAt(startDate: string, t = Date.now()): number {
  const start = parseDate(startDate).getTime();
  const diff = Math.floor((startOfDay(t) - start) / DAY);
  return Math.min(TOTAL_WEEKS, Math.max(1, Math.floor(diff / 7) + 1));
}

export function isUnlocked(weekNum: number, percents: number[], unlockAll: boolean): boolean {
  if (unlockAll || weekNum <= 1) return true;
  return (percents[weekNum - 2] ?? 0) >= UNLOCK_THRESHOLD;
}

/** Number of books whose every part (week) has been read. */
export function booksFinished(booksRead: Record<number, number>): number {
  return Object.values(bookWeeks).filter((ws) => ws.every((w) => booksRead[w])).length;
}

/** Local day key "YYYY-MM-DD" for a timestamp. */
export function dayKey(t: number): string {
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Streak = consecutive calendar days with at least one action.
 * If there is no action today yet, the streak ending yesterday is still "alive".
 */
export function computeStreak(activity: ProgressData['activity'], now = Date.now()): { current: number; best: number } {
  const days = new Set(activity.map((e) => dayKey(e.t)));
  if (!days.size) return { current: 0, best: 0 };

  let current = 0;
  let cursor = startOfDay(now);
  if (!days.has(dayKey(cursor))) cursor -= DAY;
  while (days.has(dayKey(cursor))) {
    current++;
    cursor -= DAY;
  }

  // Best streak over the whole history.
  const sorted = [...days].map((k) => parseDate(k).getTime()).sort((a, b) => a - b);
  let best = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    // Round to tolerate DST shifts.
    run = Math.round((sorted[i] - sorted[i - 1]) / DAY) === 1 ? run + 1 : 1;
    best = Math.max(best, run);
  }
  return { current, best: Math.max(best, current) };
}

/** Words learned (cumulative) at the end of each program week, up to the current week. */
export function cumulativeLearnedByWeek(
  learnedWords: Record<string, number>,
  startDate: string,
  upToWeek: number,
): number[] {
  const start = parseDate(startDate).getTime();
  const stamps = Object.values(learnedWords);
  return Array.from({ length: upToWeek }, (_, i) => {
    const end = start + (i + 1) * 7 * DAY;
    // Anything learned before the program start counts toward week 1.
    return stamps.filter((t) => t < end).length;
  });
}

/** Number of actions per day for the last `n` days (oldest first). */
export function dailyActivity(activity: ProgressData['activity'], n = 30, now = Date.now()) {
  const counts: Record<string, number> = {};
  activity.forEach((e) => {
    const k = dayKey(e.t);
    counts[k] = (counts[k] || 0) + 1;
  });
  const today = startOfDay(now);
  return Array.from({ length: n }, (_, i) => {
    const t = today - (n - 1 - i) * DAY;
    const d = new Date(t);
    return { day: `${d.getDate()}/${d.getMonth() + 1}`, actions: counts[dayKey(t)] || 0 };
  });
}

/** Ratio helper used by charts and stat cards. */
export const pct = (v: number) => `${Math.round(v)}%`;
