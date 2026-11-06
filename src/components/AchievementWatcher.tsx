import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { achievementById } from '../lib/achievements';
import { celebrate } from '../lib/confetti';
import { useProgress } from '../store/useProgress';
import { useStats } from '../store/useStats';

/**
 * Background watcher:
 *  - records newly earned achievements and shows an animated toast;
 *  - fires confetti when a week reaches 100 % for the first time.
 */
export function AchievementWatcher() {
  const { earned, percents } = useStats();
  const stored = useProgress((s) => s.achievements);
  const completed = useProgress((s) => s.completedWeeks);
  const unlockAchievements = useProgress((s) => s.unlockAchievements);
  const markWeeksCompleted = useProgress((s) => s.markWeeksCompleted);
  const [toast, setToast] = useState<string[]>([]);
  const firstRun = useRef(true);

  useEffect(() => {
    const fresh = earned.filter((id) => !stored[id]);
    const newWeeks = percents
      .map((p, i) => (p >= 99.999 && !completed[i + 1] ? i + 1 : 0))
      .filter(Boolean);

    if (fresh.length) {
      unlockAchievements(fresh);
      // Don't celebrate on first load (e.g. after importing a backup).
      if (!firstRun.current) setToast((t) => [...t, ...fresh]);
    }
    if (newWeeks.length) {
      markWeeksCompleted(newWeeks);
      if (!firstRun.current) celebrate();
    }
    firstRun.current = false;
  }, [earned, percents, stored, completed, unlockAchievements, markWeeksCompleted]);

  // Auto-dismiss toasts.
  useEffect(() => {
    if (!toast.length) return;
    const id = setTimeout(() => setToast((t) => t.slice(1)), 3500);
    return () => clearTimeout(id);
  }, [toast]);

  const current = toast[0] ? achievementById[toast[0]] : undefined;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4" aria-live="polite">
      <AnimatePresence>
        {current && (
          <motion.div
            key={current.id}
            initial={{ y: -80, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="pointer-events-auto flex items-center gap-3 rounded-2xl bg-navy px-4 py-3 text-white shadow-lift"
          >
            <motion.span
              className="flex h-12 w-12 items-center justify-center rounded-full"
              style={{ backgroundColor: current.color }}
              animate={{ rotate: [0, -15, 15, -10, 10, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 0.8 }}
            >
              <current.icon className="h-6 w-6" aria-hidden />
            </motion.span>
            <div>
              <div className="text-xs font-bold text-accent-yellow">Nova conquista! / New badge!</div>
              <div className="font-extrabold">{current.pt}</div>
              <div lang="en" className="text-xs opacity-70">{current.en}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
