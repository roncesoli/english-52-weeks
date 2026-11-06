/**
 * Derived statistics hook: memoizes all expensive progress computations.
 */
import { useMemo } from 'react';
import { useProgress } from '../store/useProgress';
import {
  allWeekPercents,
  booksFinished,
  computeStreak,
  programWeekAt,
  yearPercent,
} from '../lib/progress';
import { dueIds } from '../lib/srs';
import { ACHIEVEMENTS, type AchievementStats } from '../lib/achievements';
import { TOTAL_WEEKS } from '../data/course';
import { useShallow } from 'zustand/react/shallow';

export function useStats() {
  const s = useProgress(
    useShallow((st) => ({
      learnedWords: st.learnedWords,
      practicedPhrases: st.practicedPhrases,
      booksRead: st.booksRead,
      videosWatched: st.videosWatched,
      activity: st.activity,
      quizzes: st.quizzes,
      srs: st.srs,
      startDate: st.settings.startDate,
    })),
  );

  return useMemo(() => {
    const percents = allWeekPercents(s);
    const year = yearPercent(s);
    const currentWeek = programWeekAt(s.startDate);
    const streak = computeStreak(s.activity);
    const wordsLearned = Object.keys(s.learnedWords).length;
    const books = booksFinished(s.booksRead);
    const videos = Object.keys(s.videosWatched).length;
    const weeksCompleted = percents.filter((p) => p >= 99.999).length;
    const quizList = Object.values(s.quizzes);
    const due = dueIds(s.srs);
    const quartersComplete = [0, 1, 2, 3].map((q) =>
      percents.slice(q * 13, q * 13 + 13).every((p) => p >= 99.999),
    );
    const achievementStats: AchievementStats = {
      weeksCompleted,
      wordsLearned,
      booksFinished: books,
      bestStreak: streak.best,
      quizPassed: quizList.filter((q) => q.passed).length,
      quizPerfect: quizList.filter((q) => q.perfect).length,
      quartersComplete,
      yearComplete: weeksCompleted === TOTAL_WEEKS,
    };
    const earned = ACHIEVEMENTS.filter((a) => a.test(achievementStats)).map((a) => a.id);
    return { percents, year, currentWeek, streak, wordsLearned, books, videos, weeksCompleted, due, earned };
  }, [s]);
}
