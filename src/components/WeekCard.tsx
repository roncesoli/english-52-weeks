import { motion } from 'framer-motion';
import { Lock, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Week } from '../types';
import { quarterColor } from '../lib/theme';
import { ProgressRing } from './ProgressRing';

interface WeekCardProps {
  week: Week;
  percent: number;
  locked: boolean;
  current: boolean;
  quizPassed?: boolean;
}

/** Week tile used on the Weeks screen. */
export function WeekCard({ week, percent, locked, current, quizPassed }: WeekCardProps) {
  const navigate = useNavigate();
  const color = quarterColor(week.quarter);
  return (
    <motion.button
      whileHover={locked ? undefined : { y: -3 }}
      whileTap={locked ? undefined : { scale: 0.97 }}
      onClick={() => !locked && navigate(`/week/${week.week}`)}
      aria-disabled={locked}
      aria-label={`Semana ${week.week} / Week ${week.week}, ${Math.round(percent)}%${locked ? ', bloqueada / locked' : ''}`}
      className={`card relative flex w-full items-center gap-3 p-3 text-left ${locked ? 'cursor-not-allowed opacity-60' : ''} ${
        current ? 'ring-2 ring-accent-yellow' : ''
      }`}
    >
      <ProgressRing value={percent} size={56} stroke={6} color={color}>
        {locked ? (
          <Lock className="h-5 w-5 text-slate-400" aria-hidden />
        ) : (
          <span className="text-xs font-extrabold">{Math.round(percent)}%</span>
        )}
      </ProgressRing>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1 text-base font-extrabold" style={{ color }}>
          Semana {week.week}
          {quizPassed && <Trophy className="h-4 w-4 text-accent-yellow" aria-label="Quiz ok" />}
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          {week.words.length} palavras / words
        </div>
        <div className="truncate text-xs text-slate-500 dark:text-slate-400" title={week.book.title}>
          📖 {week.book.title}
        </div>
      </div>
      {current && (
        <span className="absolute right-2 top-2 rounded-full bg-accent-yellow px-2 py-0.5 text-[10px] font-extrabold text-navy">
          Atual / Now
        </span>
      )}
    </motion.button>
  );
}
