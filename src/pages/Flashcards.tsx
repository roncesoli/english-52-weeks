import { Layers } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Bi } from '../components/Bi';
import { CardSession } from '../components/CardSession';
import { Page, PageHeader } from '../components/Page';
import { allWords, weeks, wordsById, type WordRef } from '../data/course';
import { dueIds } from '../lib/srs';
import { shuffle } from '../lib/theme';
import { useProgress } from '../store/useProgress';
import { useStats } from '../store/useStats';

type Mode = 'week' | 'learned' | 'due';
const MODES: { id: Mode; pt: string; en: string }[] = [
  { id: 'week', pt: 'Esta semana', en: 'This week' },
  { id: 'learned', pt: 'Todas aprendidas', en: 'All learned' },
  { id: 'due', pt: 'Revisão do dia', en: 'Review due' },
];

/** Builds a deck from the current store state (snapshot, so answering doesn't reshuffle mid-session). */
function buildDeck(mode: Mode, week: number): WordRef[] {
  const s = useProgress.getState();
  if (mode === 'week') return shuffle(allWords.filter((w) => w.week === week));
  if (mode === 'learned') return shuffle(allWords.filter((w) => s.learnedWords[w.id]));
  return dueIds(s.srs).map((id) => wordsById[id]).filter(Boolean);
}

export default function Flashcards() {
  const { currentWeek, due } = useStats();
  const learnedCount = useProgress((s) => Object.keys(s.learnedWords).length);
  const setWordLearned = useProgress((s) => s.setWordLearned);
  const reviewWord = useProgress((s) => s.reviewWord);
  const [mode, setMode] = useState<Mode>('week');
  const [week, setWeek] = useState(currentWeek);
  const [deck, setDeck] = useState<WordRef[]>(() => buildDeck('week', currentWeek));

  const restart = useCallback(() => setDeck(buildDeck(mode, week)), [mode, week]);
  useEffect(() => {
    restart();
  }, [restart]);

  const onKnow = useCallback(
    (c: WordRef) => {
      const learned = !!useProgress.getState().learnedWords[c.id];
      if (mode === 'due') reviewWord(c.id, true);
      else if (!learned) setWordLearned(c.id, true); // knowing a new word marks it as learned
    },
    [mode, reviewWord, setWordLearned],
  );
  const onReview = useCallback(
    (c: WordRef) => {
      // Forgotten learned words go back to box 1.
      if (useProgress.getState().learnedWords[c.id]) reviewWord(c.id, false);
    },
    [reviewWord],
  );

  const counts: Record<Mode, number> = {
    week: allWords.filter((w) => w.week === week).length,
    learned: learnedCount,
    due: due.length,
  };

  return (
    <Page>
      <PageHeader pt="Cartões" en="Flashcards" />

      <div role="radiogroup" aria-label="Modo / Mode" className="mb-4 grid grid-cols-3 gap-2">
        {MODES.map((m) => (
          <button
            key={m.id}
            role="radio"
            aria-checked={mode === m.id}
            onClick={() => setMode(m.id)}
            className={`card flex min-h-[64px] flex-col items-center justify-center p-2 text-center text-sm font-bold transition ${
              mode === m.id ? 'bg-navy text-white ring-2 ring-accent-yellow dark:bg-accent-yellow dark:text-navy' : ''
            }`}
          >
            <span>{m.pt}</span>
            <span lang="en" className="text-[11px] font-normal opacity-70">{m.en}</span>
            <span className="mt-0.5 rounded-full bg-black/10 px-2 text-[11px] dark:bg-white/10">{counts[m.id]}</span>
          </button>
        ))}
      </div>

      {mode === 'week' && (
        <label className="mb-4 flex items-center gap-3 text-sm font-bold">
          <Bi pt="Semana" en="Week" />
          <select value={week} onChange={(e) => setWeek(Number(e.target.value))} className="input w-auto min-h-touch">
            {weeks.map((w) => (
              <option key={w.week} value={w.week}>
                {w.week} — {w.words.map((x) => x.en).join(', ')}
              </option>
            ))}
          </select>
        </label>
      )}

      {deck.length ? (
        <CardSession cards={deck} onKnow={onKnow} onReview={onReview} onRestart={restart} />
      ) : (
        <div className="card flex flex-col items-center gap-3 p-10 text-center">
          <Layers className="h-12 w-12 text-slate-400" aria-hidden />
          {mode === 'learned' ? (
            <Bi pt="Você ainda não marcou palavras como aprendidas." en="You haven't marked any words as learned yet." className="font-bold" />
          ) : (
            <Bi pt="Nada para revisar agora. Volte amanhã!" en="Nothing to review now. Come back tomorrow!" className="font-bold" />
          )}
        </div>
      )}
    </Page>
  );
}
