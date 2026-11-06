import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import type { Achievement } from '../lib/achievements';

interface BadgeProps {
  achievement: Achievement;
  unlockedAt?: number;
  index?: number;
}

/** Achievement badge. Unlocked badges pop in with a spring animation. */
export function Badge({ achievement: a, unlockedAt, index = 0 }: BadgeProps) {
  const unlocked = !!unlockedAt;
  const Icon = a.icon;
  return (
    <motion.div
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 18, delay: index * 0.03 }}
      className={`card flex flex-col items-center gap-2 p-4 text-center ${unlocked ? '' : 'opacity-50 grayscale'}`}
      aria-label={`${a.pt} / ${a.en}: ${unlocked ? 'conquistado / unlocked' : 'bloqueado / locked'}`}
    >
      <motion.span
        className="relative flex h-16 w-16 items-center justify-center rounded-full text-white shadow-soft"
        style={{ backgroundColor: unlocked ? a.color : '#94a3b8' }}
        whileHover={unlocked ? { rotate: [0, -10, 10, 0], scale: 1.1 } : undefined}
      >
        <Icon className="h-8 w-8" aria-hidden />
        {!unlocked && (
          <span className="absolute -bottom-1 -right-1 rounded-full bg-white p-1 text-slate-500 dark:bg-navy">
            <Lock className="h-3 w-3" aria-hidden />
          </span>
        )}
      </motion.span>
      <div className="text-sm font-extrabold leading-tight">{a.pt}</div>
      <div lang="en" className="text-xs text-slate-500 dark:text-slate-400">{a.en}</div>
      <div className="text-[11px] text-slate-500 dark:text-slate-400">
        {unlocked ? new Date(unlockedAt).toLocaleDateString('pt-BR') : a.descPt}
      </div>
    </motion.div>
  );
}
