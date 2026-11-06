import { CalendarClock, Play, Repeat } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Bi } from '../components/Bi';
import { CardSession } from '../components/CardSession';
import { Page, PageHeader } from '../components/Page';
import { wordsById, type WordRef } from '../data/course';
import { boxCounts, dueIds, INTERVAL_DAYS } from '../lib/srs';
import { useProgress } from '../store/useProgress';

const BOX_COLORS = ['#E4572E', '#D35400', '#FFC914', '#17BEBB', '#2E8B57'];

/** Leitner spaced-repetition review. */
export default function Review() {
  const srs = useProgress((s) => s.srs);
  const reviewWord = useProgress((s) => s.reviewWord);
  const [deck, setDeck] = useState<WordRef[] | null>(null);

  const due = useMemo(() => dueIds(srs), [srs]);
  const counts = useMemo(() => boxCounts(srs), [srs]);
  const total = Object.keys(srs).length;

  // Upcoming reviews for the next 7 days.
  const upcoming = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }, (_, i) => {
      const from = start.getTime() + i * 86400000;
      const to = from + 86400000;
      const n = Object.values(srs).filter((c) => (i === 0 ? c.due < to : c.due >= from && c.due < to)).length;
      const d = new Date(from);
      return { label: i === 0 ? 'Hoje' : d.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric' }), n };
    });
  }, [srs]);
  const maxUpcoming = Math.max(1, ...upcoming.map((u) => u.n));

  const start = () => setDeck(due.map((id) => wordsById[id]).filter(Boolean));
  const onKnow = useCallback((c: WordRef) => reviewWord(c.id, true), [reviewWord]);
  const onReview = useCallback((c: WordRef) => reviewWord(c.id, false), [reviewWord]);

  if (deck) {
    return (
      <Page>
        <PageHeader pt="Revisão" en="Review" right={<button onClick={() => setDeck(null)} className="btn-ghost">Sair / Exit</button>} />
        <CardSession cards={deck} onKnow={onKnow} onReview={onReview} onRestart={() => setDeck(null)} />
      </Page>
    );
  }

  return (
    <Page>
      <PageHeader pt="Revisão" en="Review" />

      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card mb-4 flex flex-col items-center gap-4 bg-navy p-6 text-center text-white sm:flex-row sm:text-left">
        <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-accent-teal">
          <Repeat className="h-10 w-10" aria-hidden />
        </span>
        <div className="flex-1">
          <div className="text-5xl font-extrabold">{due.length}</div>
          <Bi pt="palavras para revisar hoje" en="words to review today" className="font-bold" />
        </div>
        <button onClick={start} disabled={!due.length} className="btn min-h-[56px] bg-accent-yellow px-6 text-lg text-navy disabled:opacity-40">
          <Play className="h-6 w-6" aria-hidden /> <Bi pt="Começar" en="Start" />
        </button>
      </motion.section>

      <section className="card mb-4 p-5" aria-labelledby="boxes-title">
        <h2 id="boxes-title" className="mb-1 text-lg font-extrabold">
          <Bi pt="Caixas de Leitner" en="Leitner boxes" />
        </h2>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          “Sei” sobe uma caixa; “Revisar” volta para a caixa 1. / “I know” moves up a box; “Review” sends it back to box 1.
        </p>
        <div className="grid grid-cols-5 gap-2">
          {INTERVAL_DAYS.map((d, i) => (
            <div key={d} className="flex flex-col items-center gap-2">
              <div className="relative flex h-32 w-full items-end overflow-hidden rounded-xl bg-surface dark:bg-navy">
                <motion.div
                  className="w-full rounded-xl"
                  style={{ backgroundColor: BOX_COLORS[i] }}
                  initial={{ height: 0 }}
                  animate={{ height: `${total ? Math.max(4, (counts[i] / total) * 100) : 4}%` }}
                  transition={{ duration: 0.8, delay: i * 0.08 }}
                />
                <span className="absolute inset-x-0 top-2 text-center text-lg font-extrabold">{counts[i]}</span>
              </div>
              <div className="text-center text-xs font-bold">
                Caixa {i + 1}
                <div className="font-normal text-slate-500 dark:text-slate-400">
                  {d} {d === 1 ? 'dia' : 'dias'} / {d}d
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card p-5" aria-labelledby="upcoming-title">
        <h2 id="upcoming-title" className="mb-3 flex items-center gap-2 text-lg font-extrabold">
          <CalendarClock className="h-5 w-5" aria-hidden /> <Bi pt="Próximos 7 dias" en="Next 7 days" />
        </h2>
        <ul className="flex flex-col gap-2">
          {upcoming.map((u) => (
            <li key={u.label} className="flex items-center gap-3 text-sm">
              <span className="w-20 shrink-0 font-bold capitalize">{u.label}</span>
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-surface dark:bg-navy">
                <motion.div className="h-full rounded-full bg-accent-teal" initial={{ width: 0 }} animate={{ width: `${(u.n / maxUpcoming) * 100}%` }} />
              </div>
              <span className="w-8 text-right font-bold">{u.n}</span>
            </li>
          ))}
        </ul>
        {!total && (
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Marque palavras como “Aprendi” para começar a revisar. / Mark words as “Learned” to start reviewing.
          </p>
        )}
      </section>
    </Page>
  );
}
