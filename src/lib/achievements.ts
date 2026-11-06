/**
 * Achievement (badge) definitions. Each badge has a predicate evaluated against derived stats.
 */
import type { LucideIcon } from 'lucide-react';
import {
  Award,
  BookMarked,
  BookOpen,
  Brain,
  CalendarCheck,
  Crown,
  Flame,
  GraduationCap,
  Library,
  Medal,
  Rocket,
  Sparkles,
  Star,
  Target,
  Trophy,
  Zap,
} from 'lucide-react';

export interface AchievementStats {
  weeksCompleted: number;
  wordsLearned: number;
  booksFinished: number;
  bestStreak: number;
  quizPassed: number;
  quizPerfect: number;
  /** Percent per quarter (average of its weeks), index 0 = Q1. */
  quartersComplete: boolean[];
  yearComplete: boolean;
}

export interface Achievement {
  id: string;
  pt: string;
  en: string;
  descPt: string;
  icon: LucideIcon;
  color: string;
  test: (s: AchievementStats) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'week-1', pt: 'Primeira semana', en: 'First week', descPt: 'Complete 1 semana (100%)', icon: Rocket, color: '#3E7CB1', test: (s) => s.weeksCompleted >= 1 },
  { id: 'weeks-10', pt: '10 semanas', en: '10 weeks', descPt: 'Complete 10 semanas', icon: CalendarCheck, color: '#8E44AD', test: (s) => s.weeksCompleted >= 10 },
  { id: 'weeks-26', pt: 'Meio caminho', en: 'Halfway', descPt: 'Complete 26 semanas', icon: Target, color: '#17BEBB', test: (s) => s.weeksCompleted >= 26 },
  { id: 'words-100', pt: '100 palavras', en: '100 words', descPt: 'Aprenda 100 palavras', icon: Sparkles, color: '#FFC914', test: (s) => s.wordsLearned >= 100 },
  { id: 'words-250', pt: '250 palavras', en: '250 words', descPt: 'Aprenda 250 palavras', icon: Zap, color: '#D35400', test: (s) => s.wordsLearned >= 250 },
  { id: 'words-368', pt: '368 palavras', en: '368 words', descPt: 'Aprenda todas as 368 palavras', icon: Brain, color: '#E4572E', test: (s) => s.wordsLearned >= 368 },
  { id: 'book-1', pt: '1º livro', en: 'First book', descPt: 'Termine seu primeiro livro', icon: BookOpen, color: '#2E8B57', test: (s) => s.booksFinished >= 1 },
  { id: 'books-10', pt: '10 livros', en: '10 books', descPt: 'Termine 10 livros', icon: BookMarked, color: '#76B041', test: (s) => s.booksFinished >= 10 },
  { id: 'books-26', pt: 'Biblioteca completa', en: 'Full library', descPt: 'Termine os 26 livros', icon: Library, color: '#1D2D44', test: (s) => s.booksFinished >= 26 },
  { id: 'streak-7', pt: 'Streak 7 dias', en: '7-day streak', descPt: 'Estude 7 dias seguidos', icon: Flame, color: '#E4572E', test: (s) => s.bestStreak >= 7 },
  { id: 'streak-30', pt: 'Streak 30 dias', en: '30-day streak', descPt: 'Estude 30 dias seguidos', icon: Flame, color: '#D35400', test: (s) => s.bestStreak >= 30 },
  { id: 'quiz-pass', pt: 'Primeiro quiz', en: 'First quiz', descPt: 'Passe em um quiz (≥ 80%)', icon: Medal, color: '#3E7CB1', test: (s) => s.quizPassed >= 1 },
  { id: 'quiz-perfect', pt: 'Quiz perfeito', en: 'Perfect quiz', descPt: 'Acerte 100% em um quiz', icon: Star, color: '#FFC914', test: (s) => s.quizPerfect >= 1 },
  { id: 'q1', pt: '1º trimestre completo', en: 'Q1 complete', descPt: 'Complete as semanas 1–13', icon: Award, color: '#3E7CB1', test: (s) => s.quartersComplete[0] },
  { id: 'q2', pt: '2º trimestre completo', en: 'Q2 complete', descPt: 'Complete as semanas 14–26', icon: Award, color: '#8E44AD', test: (s) => s.quartersComplete[1] },
  { id: 'q3', pt: '3º trimestre completo', en: 'Q3 complete', descPt: 'Complete as semanas 27–39', icon: Award, color: '#D35400', test: (s) => s.quartersComplete[2] },
  { id: 'q4', pt: '4º trimestre completo', en: 'Q4 complete', descPt: 'Complete as semanas 40–52', icon: Trophy, color: '#2E8B57', test: (s) => s.quartersComplete[3] },
  { id: 'year', pt: 'Ano completo', en: 'Year complete', descPt: 'Complete as 52 semanas', icon: Crown, color: '#FFC914', test: (s) => s.yearComplete },
  { id: 'graduate', pt: 'Fluente em construção', en: 'Fluency in progress', descPt: 'Passe em 26 quizzes', icon: GraduationCap, color: '#17BEBB', test: (s) => s.quizPassed >= 26 },
];

export const achievementById: Record<string, Achievement> = Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, a]));
