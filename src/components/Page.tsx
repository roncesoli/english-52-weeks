import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

/** Wraps each page with a fade/slide transition. */
export function Page({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <motion.main
      id="main"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`mx-auto w-full max-w-5xl px-4 pb-28 pt-4 md:px-8 md:pb-10 md:pt-8 ${className}`}
    >
      {children}
    </motion.main>
  );
}

/** Page title with bilingual subtitle and optional right-side actions. */
export function PageHeader({ pt, en, right }: { pt: string; en: string; right?: ReactNode }) {
  return (
    <header className="mb-5 flex items-center justify-between gap-3">
      <h1 className="flex flex-col">
        <span className="text-3xl font-extrabold text-navy dark:text-white">{pt}</span>
        <span lang="en" className="text-base font-semibold text-slate-500 dark:text-slate-400">{en}</span>
      </h1>
      {right}
    </header>
  );
}
