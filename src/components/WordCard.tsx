import { motion } from 'framer-motion';
import type { Word } from '../types';
import { CheckToggle } from './CheckToggle';
import { SpeakButton } from './SpeakButton';

interface WordCardProps {
  word: Word;
  learned: boolean;
  onToggle: () => void;
  color: string;
  index?: number;
}

/** Vocabulary card: big English word, pronunciation, Portuguese, speak button and "learned" checkbox. */
export function WordCard({ word, learned, onToggle, color, index = 0 }: WordCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="card flex flex-col gap-2 border-l-8 p-4"
      style={{ borderLeftColor: learned ? color : 'transparent' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 lang="en" className="break-words text-3xl font-extrabold" style={{ color }}>
            {word.en}
          </h3>
          <p className="text-sm italic text-slate-500 dark:text-slate-400">/{word.pron}/</p>
          <p className="mt-1 text-lg font-semibold">{word.pt}</p>
        </div>
        <SpeakButton text={word.en} color={color} />
      </div>
      <CheckToggle checked={learned} onChange={onToggle} pt="Aprendi" en="Learned" color={color} className="self-start" />
    </motion.article>
  );
}
