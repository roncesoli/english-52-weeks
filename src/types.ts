/**
 * Types for the course content (src/data/weeks.json) and for the user's progress.
 */

/** A vocabulary item. */
export interface Word {
  en: string;
  /** Pronunciation hint written for Portuguese speakers. */
  pron: string;
  pt: string;
}

/** A practice sentence. */
export interface Phrase {
  en: string;
  pt: string;
}

/** The graded reader assigned to a week (each book spans two weeks). */
export interface Book {
  title: string;
  level: string;
  part: string;
}

/** The video lesson assigned to a week. */
export interface Video {
  channel: string;
  search: string;
  url: string;
}

export type Quarter = 1 | 2 | 3 | 4;

export interface Week {
  week: number;
  quarter: Quarter;
  quarterTheme: string;
  /** Planned total of words learned by the end of this week. */
  cumulativeWords: number;
  words: Word[];
  phrases: Phrase[];
  book: Book;
  video: Video;
}

/** Relative weight (percent) of each block in the week score. */
export interface Weights {
  words: number;
  phrases: number;
  book: number;
  video: number;
}

export interface Course {
  title: string;
  owner: string;
  weights: Weights;
  weeks: Week[];
}

/* ------------------------------------------------------------------ */
/* Progress                                                             */
/* ------------------------------------------------------------------ */

/** Kind of action stored in the activity log. */
export type ActionType = 'word' | 'phrase' | 'book' | 'video' | 'quiz' | 'review' | 'sentence' | 'note';

/** One entry of the activity log (every user action is timestamped). */
export interface ActivityEntry {
  /** Timestamp (ms since epoch). */
  t: number;
  a: ActionType;
  /** Reference: word/phrase id or week number. */
  ref: string;
  /** For toggles: new value. For quiz/review: score or "known". */
  v?: boolean | number;
}

/** Leitner spaced-repetition state of a learned word. */
export interface SrsCard {
  /** Box index 0..4 → intervals 1, 3, 7, 14, 30 days. */
  box: number;
  /** Next review time (ms). */
  due: number;
  last?: number;
}

export interface QuizResult {
  /** Best score in percent. */
  best: number;
  passed: boolean;
  perfect: boolean;
  attempts: number;
  at: number;
}

export interface Settings {
  /** Program start date, YYYY-MM-DD. */
  startDate: string;
  /** Daily reminder HH:MM, empty string = disabled. */
  reminderTime: string;
  darkMode: boolean;
  unlockAll: boolean;
}

/** Everything that is persisted in localStorage / exported as backup. */
export interface ProgressData {
  /** wordId → timestamp when marked as learned. */
  learnedWords: Record<string, number>;
  /** phraseId → timestamp when practiced aloud. */
  practicedPhrases: Record<string, number>;
  /** week → timestamp the book part was read. */
  booksRead: Record<number, number>;
  /** week → timestamp the video was watched. */
  videosWatched: Record<number, number>;
  mySentences: Record<number, string>;
  bookNotes: Record<number, string>;
  quizzes: Record<number, QuizResult>;
  srs: Record<string, SrsCard>;
  activity: ActivityEntry[];
  /** achievementId → unlock timestamp. */
  achievements: Record<string, number>;
  /** week → timestamp the week first reached 100 % (used for confetti). */
  completedWeeks: Record<number, number>;
  settings: Settings;
}
