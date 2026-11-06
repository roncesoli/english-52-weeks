import { AnimatePresence, motion, type PanInfo } from 'framer-motion';
import { Check, RotateCcw, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import type { WordRef } from '../data/course';
import { quarterColor } from '../lib/theme';
import { Bi } from './Bi';
import { FlipCard } from './FlipCard';
import { SpeakButton } from './SpeakButton';
import { ProgressRing } from './ProgressRing';

interface CardSessionProps {
  cards: WordRef[];
  onKnow: (card: WordRef) => void;
  onReview: (card: WordRef) => void;
  onRestart?: () => void;
}

const SWIPE = 100;

/**
 * Runs a flashcard session over `cards`.
 * Swipe right / → = "Sei / I know", swipe left / ← = "Revisar / Review", Space = flip.
 */
export function CardSession({ cards, onKnow, onReview, onRestart }: CardSessionProps) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);
  const [exitX, setExitX] = useState(0);

  // Restart when the deck changes.
  useEffect(() => {
    setIndex(0);
    setFlipped(false);
    setKnown(0);
  }, [cards]);

  const card = cards[index];
  const done = index >= cards.length;

  const next = useCallback(
    (isKnown: boolean) => {
      if (!card) return;
      setExitX(isKnown ? 400 : -400);
      if (isKnown) {
        onKnow(card);
        setKnown((k) => k + 1);
      } else onReview(card);
      setFlipped(false);
      setIndex((i) => i + 1);
    },
    [card, onKnow, onReview],
  );

  // Keyboard shortcuts.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (done || (e.target as HTMLElement)?.tagName === 'INPUT') return;
      if (e.key === 'ArrowRight') next(true);
      else if (e.key === 'ArrowLeft') next(false);
      else if (e.key === ' ') {
        e.preventDefault();
        setFlipped((f) => !f);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, done]);

  if (!cards.length) return null;

  if (done) {
    const pctKnown = (known / cards.length) * 100;
    return (
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card flex flex-col items-center gap-4 p-8 text-center">
        <ProgressRing value={pctKnown} size={140} color="#2E8B57" />
        <Bi pt="Sessão concluída!" en="Session complete!" className="text-2xl font-extrabold" />
        <p className="text-slate-500 dark:text-slate-400">
          {known} / {cards.length} — Sei / I know
        </p>
        {onRestart && (
          <button onClick={onRestart} className="btn-primary">
            <RefreshCw className="h-5 w-5" aria-hidden />
            <Bi pt="Recomeçar" en="Restart" inline />
          </button>
        )}
      </motion.div>
    );
  }

  const color = quarterColor(card.quarter);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x > SWIPE) next(true);
    else if (info.offset.x < -SWIPE) next(false);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex w-full items-center justify-between text-sm font-bold text-slate-500 dark:text-slate-400">
        <span>
          {index + 1} / {cards.length}
        </span>
        <span>Semana / Week {card.week}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-navy-light">
        <motion.div className="h-full rounded-full" style={{ backgroundColor: color }} animate={{ width: `${(index / cards.length) * 100}%` }} />
      </div>

      <div className="relative w-full max-w-md">
        <AnimatePresence mode="popLayout" custom={exitX}>
          <motion.div
            key={card.id}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.8}
            onDragEnd={onDragEnd}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, x: exitX, rotate: exitX / 20 }}
            transition={{ duration: 0.3 }}
            whileDrag={{ rotate: 0 }}
            className="touch-pan-y"
          >
            <FlipCard
              color={color}
              flipped={flipped}
              onFlip={() => setFlipped((f) => !f)}
              front={
                <>
                  <span className="text-xs font-bold uppercase tracking-widest opacity-80">English</span>
                  <span lang="en" className="break-words text-5xl font-extrabold">{card.en}</span>
                  <span className="text-xs opacity-80">Toque para virar / Tap to flip</span>
                </>
              }
              back={
                <>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Português</span>
                  <span className="text-4xl font-extrabold" style={{ color }}>{card.pt}</span>
                  <span className="text-lg italic text-slate-500 dark:text-slate-300">/{card.pron}/</span>
                  <span lang="en" className="text-base font-bold">{card.en}</span>
                </>
              }
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <SpeakButton text={card.en} color={color} size="lg" />

      <div className="grid w-full max-w-md grid-cols-2 gap-3">
        <button onClick={() => next(false)} className="btn min-h-[56px] bg-accent-red text-white" aria-label="Revisar / Review (←)">
          <RotateCcw className="h-5 w-5" aria-hidden />
          <Bi pt="Revisar" en="Review" />
        </button>
        <button onClick={() => next(true)} className="btn min-h-[56px] bg-q4 text-white" aria-label="Sei / I know (→)">
          <Check className="h-5 w-5" aria-hidden />
          <Bi pt="Sei" en="I know" />
        </button>
      </div>
      <p className="text-center text-xs text-slate-500 dark:text-slate-400">
        Deslize ← → ou use as setas do teclado · Swipe or use arrow keys
      </p>
    </div>
  );
}
