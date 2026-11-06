/**
 * Typed access to the static course content.
 * The JSON is imported at build time so it is bundled and available offline.
 */
import raw from './weeks.json';
import type { Course, Phrase, Week, Word } from '../types';

export const course = raw as Course;
export const weeks: Week[] = course.weeks;
export const TOTAL_WEEKS = weeks.length;
export const TOTAL_WORDS = weeks.reduce((sum, w) => sum + w.words.length, 0);
/** Each book is read across two consecutive weeks. */
export const TOTAL_BOOKS = new Set(weeks.map((w) => w.book.title)).size;

/** Stable id of a word: "w<week>-<index>". */
export const wordId = (week: number, index: number) => `w${week}-${index}`;
/** Stable id of a phrase: "p<week>-<index>". */
export const phraseId = (week: number, index: number) => `p${week}-${index}`;

export interface WordRef extends Word {
  id: string;
  week: number;
  quarter: number;
}

export interface PhraseRef extends Phrase {
  id: string;
  week: number;
}

/** Flat list of all words with their ids. */
export const allWords: WordRef[] = weeks.flatMap((w) =>
  w.words.map((word, i) => ({ ...word, id: wordId(w.week, i), week: w.week, quarter: w.quarter })),
);
export const wordsById: Record<string, WordRef> = Object.fromEntries(allWords.map((w) => [w.id, w]));

export const allPhrases: PhraseRef[] = weeks.flatMap((w) =>
  w.phrases.map((p, i) => ({ ...p, id: phraseId(w.week, i), week: w.week })),
);

export const getWeek = (n: number): Week | undefined => weeks.find((w) => w.week === n);

/** Weeks grouped by book title, in reading order (used for "books finished"). */
export const bookWeeks: Record<string, number[]> = weeks.reduce<Record<string, number[]>>((acc, w) => {
  (acc[w.book.title] ||= []).push(w.week);
  return acc;
}, {});

export const quarterThemes: Record<number, string> = Object.fromEntries(
  weeks.map((w) => [w.quarter, w.quarterTheme]),
);
