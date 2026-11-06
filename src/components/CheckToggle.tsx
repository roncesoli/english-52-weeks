import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Bi } from './Bi';

interface CheckToggleProps {
  checked: boolean;
  onChange: () => void;
  pt: string;
  en: string;
  color?: string;
  className?: string;
}

/** Large, accessible checkbox-style toggle with bilingual label. */
export function CheckToggle({ checked, onChange, pt, en, color = '#2E8B57', className = '' }: CheckToggleProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onChange}
      className={`inline-flex min-h-touch items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-bold transition hover:bg-black/5 dark:hover:bg-white/10 ${className}`}
    >
      <motion.span
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2"
        style={{ borderColor: color, backgroundColor: checked ? color : 'transparent' }}
        animate={{ scale: checked ? [1, 1.25, 1] : 1 }}
        transition={{ duration: 0.25 }}
      >
        {checked && <Check className="h-5 w-5 text-white" strokeWidth={3} aria-hidden />}
      </motion.span>
      <Bi pt={pt} en={en} />
    </button>
  );
}
