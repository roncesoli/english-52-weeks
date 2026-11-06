/**
 * Global progress store (Zustand + persist → localStorage key "e52-progress").
 * Every user action is appended to `activity` with a timestamp.
 */
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { ActionType, ProgressData, Settings } from '../types';
import { answer, newCard } from '../lib/srs';
import { todayISO } from '../lib/progress';

const MAX_ACTIVITY = 20000;

export const initialData = (): ProgressData => ({
  learnedWords: {},
  practicedPhrases: {},
  booksRead: {},
  videosWatched: {},
  mySentences: {},
  bookNotes: {},
  quizzes: {},
  srs: {},
  activity: [],
  achievements: {},
  completedWeeks: {},
  settings: { startDate: todayISO(), reminderTime: '', darkMode: false, unlockAll: false },
});

export interface ProgressActions {
  setWordLearned: (id: string, learned: boolean) => void;
  toggleWord: (id: string) => void;
  togglePhrase: (id: string) => void;
  toggleBook: (week: number) => void;
  toggleVideo: (week: number) => void;
  setSentence: (week: number, text: string) => void;
  setNotes: (week: number, text: string) => void;
  /** Logs an arbitrary action (e.g. after editing a text field). */
  logAction: (a: ActionType, ref: string, v?: boolean | number) => void;
  recordQuiz: (week: number, scorePct: number) => void;
  /** Spaced-repetition answer: known → next box, otherwise back to box 1. */
  reviewWord: (id: string, known: boolean) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  unlockAchievements: (ids: string[]) => void;
  markWeeksCompleted: (weeks: number[]) => void;
  importData: (data: ProgressData) => void;
  reset: () => void;
}

export type ProgressState = ProgressData & ProgressActions;

/** Keys that make up the persisted/exported data (no functions). */
export const DATA_KEYS = Object.keys(initialData()) as (keyof ProgressData)[];

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => {
      /** Appends an entry to the activity log. */
      const log = (a: ActionType, ref: string, v?: boolean | number) => {
        const activity = [...get().activity, { t: Date.now(), a, ref, v }];
        return activity.length > MAX_ACTIVITY ? activity.slice(-MAX_ACTIVITY) : activity;
      };

      /** Toggles a key in a timestamp map. */
      const toggleIn = <K extends string | number>(map: Record<K, number>, key: K, on: boolean) => {
        const next = { ...map };
        if (on) next[key] = Date.now();
        else delete next[key];
        return next;
      };

      return {
        ...initialData(),

        setWordLearned: (id, learned) => {
          const s = get();
          if (!!s.learnedWords[id] === learned) return;
          const srs = { ...s.srs };
          if (learned) srs[id] = newCard();
          else delete srs[id];
          set({ learnedWords: toggleIn(s.learnedWords, id, learned), srs, activity: log('word', id, learned) });
        },
        toggleWord: (id) => get().setWordLearned(id, !get().learnedWords[id]),

        togglePhrase: (id) => {
          const on = !get().practicedPhrases[id];
          set({ practicedPhrases: toggleIn(get().practicedPhrases, id, on), activity: log('phrase', id, on) });
        },
        toggleBook: (week) => {
          const on = !get().booksRead[week];
          set({ booksRead: toggleIn(get().booksRead, week, on), activity: log('book', String(week), on) });
        },
        toggleVideo: (week) => {
          const on = !get().videosWatched[week];
          set({ videosWatched: toggleIn(get().videosWatched, week, on), activity: log('video', String(week), on) });
        },

        setSentence: (week, text) => set({ mySentences: { ...get().mySentences, [week]: text } }),
        setNotes: (week, text) => set({ bookNotes: { ...get().bookNotes, [week]: text } }),
        logAction: (a, ref, v) => set({ activity: log(a, ref, v) }),

        recordQuiz: (week, scorePct) => {
          const prev = get().quizzes[week];
          const best = Math.max(prev?.best ?? 0, scorePct);
          set({
            quizzes: {
              ...get().quizzes,
              [week]: { best, passed: best >= 80, perfect: best >= 100, attempts: (prev?.attempts ?? 0) + 1, at: Date.now() },
            },
            activity: log('quiz', String(week), scorePct),
          });
        },

        reviewWord: (id, known) => {
          const s = get();
          const card = s.srs[id] ?? newCard();
          set({ srs: { ...s.srs, [id]: answer(card, known) }, activity: log('review', id, known) });
        },

        updateSettings: (patch) => set({ settings: { ...get().settings, ...patch } }),

        unlockAchievements: (ids) => {
          const now = Date.now();
          const achievements = { ...get().achievements };
          ids.forEach((id) => (achievements[id] ||= now));
          set({ achievements });
        },
        markWeeksCompleted: (weeks) => {
          const now = Date.now();
          const completedWeeks = { ...get().completedWeeks };
          weeks.forEach((w) => (completedWeeks[w] ||= now));
          set({ completedWeeks });
        },

        importData: (data) => {
          const base = initialData();
          const merged = { ...base, ...data, settings: { ...base.settings, ...data.settings } };
          set(merged);
        },
        reset: () => set(initialData()),
      };
    },
    {
      name: 'e52-progress',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // Persist only data, never functions.
      partialize: (s) => Object.fromEntries(DATA_KEYS.map((k) => [k, s[k]])) as unknown as ProgressState,
    },
  ),
);

/** Snapshot of the persisted data (for export). */
export const exportData = (): ProgressData => {
  const s = useProgress.getState();
  return Object.fromEntries(DATA_KEYS.map((k) => [k, s[k]])) as unknown as ProgressData;
};

/** Minimal validation for imported backups. */
export function isProgressData(x: unknown): x is ProgressData {
  if (!x || typeof x !== 'object') return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.learnedWords === 'object' &&
    typeof o.settings === 'object' &&
    Array.isArray(o.activity)
  );
}
