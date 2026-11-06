import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, ChevronLeft, ChevronRight, ExternalLink, ListChecks, Lock, MessageSquareText, Sparkles, Trophy, Youtube } from 'lucide-react';
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Bi } from '../components/Bi';
import { CheckToggle } from '../components/CheckToggle';
import { Page } from '../components/Page';
import { ProgressRing } from '../components/ProgressRing';
import { SpeakButton } from '../components/SpeakButton';
import { WordCard } from '../components/WordCard';
import { bookWeeks, getWeek, phraseId, TOTAL_WEEKS, wordId } from '../data/course';
import { isUnlocked, weekBreakdown } from '../lib/progress';
import { quarterColor } from '../lib/theme';
import { useProgress } from '../store/useProgress';
import { useStats } from '../store/useStats';
import type { Week } from '../types';

type Tab = 'words' | 'phrases' | 'book' | 'video';
const TABS: { id: Tab; pt: string; en: string; icon: typeof Sparkles }[] = [
  { id: 'words', pt: 'Palavras', en: 'Words', icon: Sparkles },
  { id: 'phrases', pt: 'Frases', en: 'Phrases', icon: MessageSquareText },
  { id: 'book', pt: 'Livro', en: 'Book', icon: BookOpen },
  { id: 'video', pt: 'Vídeo', en: 'Video', icon: Youtube },
];

export default function WeekDetail() {
  const { n } = useParams();
  const num = Number(n);
  const week = getWeek(num);
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const tab = (TABS.some((t) => t.id === params.get('tab')) ? params.get('tab') : 'words') as Tab;

  const progress = useProgress();
  const { percents } = useStats();

  if (!week) return <Navigate to="/weeks" replace />;

  const color = quarterColor(week.quarter);
  const b = weekBreakdown(week, progress);
  const locked = !isUnlocked(week.week, percents, progress.settings.unlockAll);
  const quiz = progress.quizzes[week.week];

  if (locked) {
    return (
      <Page>
        <div className="card mx-auto flex max-w-md flex-col items-center gap-4 p-8 text-center">
          <Lock className="h-14 w-14 text-slate-400" aria-hidden />
          <Bi pt={`Semana ${week.week} bloqueada`} en={`Week ${week.week} is locked`} className="text-2xl font-extrabold" />
          <Bi
            pt={`Chegue a 70% na semana ${week.week - 1} para desbloquear.`}
            en={`Reach 70% in week ${week.week - 1} to unlock it.`}
            className="text-slate-500 dark:text-slate-400"
          />
          <div className="flex flex-wrap justify-center gap-2">
            <Link to={`/week/${week.week - 1}`} className="btn-primary">
              <Bi pt={`Ir para semana ${week.week - 1}`} en={`Go to week ${week.week - 1}`} />
            </Link>
            <button onClick={() => progress.updateSettings({ unlockAll: true })} className="btn bg-surface dark:bg-navy">
              <Bi pt="Desbloquear tudo" en="Unlock all" />
            </button>
          </div>
        </div>
      </Page>
    );
  }

  return (
    <Page>
      {/* Header */}
      <header className="card mb-4 overflow-hidden p-0">
        <div className="flex items-center gap-4 p-5 text-white" style={{ backgroundColor: color }}>
          <ProgressRing value={b.total} size={96} stroke={10} color="#fff" trackColor="rgba(255,255,255,0.25)" label={`Semana ${week.week}: ${Math.round(b.total)}%`}>
            <span className="text-xl font-extrabold">{Math.round(b.total)}%</span>
          </ProgressRing>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-wider opacity-80">
              {week.quarter}º trimestre / Quarter {week.quarter}
            </p>
            <h1 className="text-3xl font-extrabold">
              Semana {week.week} <span className="text-lg font-semibold opacity-80">/ Week {week.week}</span>
            </h1>
            <p className="truncate text-sm opacity-90">{week.quarterTheme}</p>
          </div>
          {quiz?.passed && (
            <span className="hidden items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-bold sm:flex" title="Quiz aprovado / Quiz passed">
              <Trophy className="h-4 w-4 text-accent-yellow" aria-hidden /> {quiz.best}%
            </span>
          )}
        </div>
        {/* Block mini bars */}
        <div className="grid grid-cols-4 gap-2 p-3 text-center text-[11px] font-bold">
          {TABS.map((t) => (
            <div key={t.id}>
              <div className="mb-1 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-navy">
                <motion.div className="h-full rounded-full" style={{ backgroundColor: color }} animate={{ width: `${b[t.id]}%` }} />
              </div>
              {Math.round(b[t.id])}%
            </div>
          ))}
        </div>
      </header>

      {/* Tabs */}
      <div role="tablist" aria-label="Seções da semana / Week sections" className="mb-4 grid grid-cols-4 gap-1 rounded-2xl bg-white p-1 shadow-soft dark:bg-navy-light">
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={active}
              aria-controls={`panel-${t.id}`}
              onClick={() => setParams({ tab: t.id }, { replace: true })}
              className={`relative flex min-h-[52px] flex-col items-center justify-center rounded-xl text-xs font-bold transition sm:flex-row sm:gap-2 sm:text-sm ${
                active ? 'text-white' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {active && <motion.span layoutId="week-tab" className="absolute inset-0 rounded-xl" style={{ backgroundColor: color }} />}
              <t.icon className="relative h-5 w-5" aria-hidden />
              <span className="relative flex flex-col leading-tight sm:items-start">
                <span>{t.pt}</span>
                <span lang="en" className="text-[10px] font-normal opacity-75">{t.en}</span>
              </span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.section
          key={tab}
          role="tabpanel"
          id={`panel-${tab}`}
          aria-labelledby={`tab-${tab}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {tab === 'words' && <WordsTab week={week} color={color} />}
          {tab === 'phrases' && <PhrasesTab week={week} color={color} />}
          {tab === 'book' && <BookTab week={week} color={color} />}
          {tab === 'video' && <VideoTab week={week} color={color} />}
        </motion.section>
      </AnimatePresence>

      {/* Footer actions */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <button
          disabled={week.week <= 1}
          onClick={() => navigate(`/week/${week.week - 1}`)}
          className="btn bg-white shadow-soft disabled:opacity-40 dark:bg-navy-light"
          aria-label="Semana anterior / Previous week"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden /> {week.week - 1 || ''}
        </button>
        <Link to={`/quiz/${week.week}`} className="btn-primary" style={{ backgroundColor: color }}>
          <ListChecks className="h-5 w-5" aria-hidden />
          <Bi pt="Fazer o quiz" en="Take the quiz" />
        </Link>
        <button
          disabled={week.week >= TOTAL_WEEKS}
          onClick={() => navigate(`/week/${week.week + 1}`)}
          className="btn bg-white shadow-soft disabled:opacity-40 dark:bg-navy-light"
          aria-label="Próxima semana / Next week"
        >
          {week.week < TOTAL_WEEKS ? week.week + 1 : ''} <ChevronRight className="h-5 w-5" aria-hidden />
        </button>
      </div>
    </Page>
  );
}

interface TabProps {
  week: Week;
  color: string;
}

function WordsTab({ week, color }: TabProps) {
  const learned = useProgress((s) => s.learnedWords);
  const toggleWord = useProgress((s) => s.toggleWord);
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {week.words.map((w, i) => {
        const id = wordId(week.week, i);
        return <WordCard key={id} word={w} learned={!!learned[id]} onToggle={() => toggleWord(id)} color={color} index={i} />;
      })}
    </div>
  );
}

function PhrasesTab({ week, color }: TabProps) {
  const practiced = useProgress((s) => s.practicedPhrases);
  const togglePhrase = useProgress((s) => s.togglePhrase);
  const sentence = useProgress((s) => s.mySentences[week.week] ?? '');
  const setSentence = useProgress((s) => s.setSentence);
  const logAction = useProgress((s) => s.logAction);
  return (
    <div className="flex flex-col gap-3">
      {week.phrases.map((p, i) => {
        const id = phraseId(week.week, i);
        return (
          <motion.article
            key={id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card flex flex-col gap-2 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p lang="en" className="text-2xl font-extrabold" style={{ color }}>{p.en}</p>
                <p className="mt-1 text-base text-slate-600 dark:text-slate-300">{p.pt}</p>
              </div>
              <SpeakButton text={p.en} color={color} />
            </div>
            <CheckToggle checked={!!practiced[id]} onChange={() => togglePhrase(id)} pt="Pratiquei em voz alta" en="Practiced aloud" color={color} className="self-start" />
          </motion.article>
        );
      })}

      <div className="card flex flex-col gap-2 p-4">
        <label htmlFor="my-sentence" className="font-extrabold">
          <Bi pt="Minha frase" en="My sentence" />
        </label>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Escreva uma frase sua usando as palavras da semana. / Write your own sentence using this week's words.
        </p>
        <div className="flex items-start gap-2">
          <textarea
            id="my-sentence"
            lang="en"
            rows={3}
            value={sentence}
            onChange={(e) => setSentence(week.week, e.target.value)}
            onBlur={() => sentence.trim() && logAction('sentence', String(week.week))}
            placeholder={week.words.map((w) => w.en).join(', ')}
            className="input flex-1"
          />
          {sentence.trim() && <SpeakButton text={sentence} color={color} />}
        </div>
        <span className="text-xs text-slate-400">Salvo automaticamente / Saved automatically</span>
      </div>
    </div>
  );
}

function BookTab({ week, color }: TabProps) {
  const read = useProgress((s) => !!s.booksRead[week.week]);
  const booksRead = useProgress((s) => s.booksRead);
  const toggleBook = useProgress((s) => s.toggleBook);
  const notes = useProgress((s) => s.bookNotes[week.week] ?? '');
  const setNotes = useProgress((s) => s.setNotes);
  const logAction = useProgress((s) => s.logAction);
  const parts = bookWeeks[week.book.title] ?? [];
  const finished = parts.every((w) => booksRead[w]);

  return (
    <div className="flex flex-col gap-3">
      <article className="card flex flex-col gap-4 p-5 sm:flex-row">
        {/* Stylised book cover */}
        <div
          className="flex h-44 w-32 shrink-0 flex-col justify-between self-center rounded-r-xl rounded-l-sm p-3 text-white shadow-lift"
          style={{ background: `linear-gradient(135deg, ${color}, #1D2D44)` }}
          aria-hidden
        >
          <BookOpen className="h-6 w-6 opacity-80" />
          <span className="text-sm font-extrabold leading-tight">{week.book.title}</span>
          <span className="text-[10px] opacity-80">{week.book.level}</span>
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <h2 lang="en" className="text-2xl font-extrabold" style={{ color }}>{week.book.title}</h2>
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
            <dt className="font-bold text-slate-500 dark:text-slate-400">Nível / Level</dt>
            <dd>{week.book.level}</dd>
            <dt className="font-bold text-slate-500 dark:text-slate-400">Ler / Read</dt>
            <dd>{week.book.part}</dd>
            <dt className="font-bold text-slate-500 dark:text-slate-400">Semanas / Weeks</dt>
            <dd>{parts.join(' + ')}</dd>
          </dl>
          <CheckToggle checked={read} onChange={() => toggleBook(week.week)} pt="Li esta parte" en="Read this part" color={color} className="self-start" />
          {finished && (
            <p className="flex items-center gap-2 text-sm font-bold text-q4">
              <Trophy className="h-4 w-4" aria-hidden /> Livro terminado! / Book finished!
            </p>
          )}
        </div>
      </article>
      <div className="card flex flex-col gap-2 p-4">
        <label htmlFor="book-notes" className="font-extrabold">
          <Bi pt="Anotações (opcional)" en="Notes (optional)" />
        </label>
        <textarea
          id="book-notes"
          rows={4}
          value={notes}
          onChange={(e) => setNotes(week.week, e.target.value)}
          onBlur={() => notes.trim() && logAction('note', String(week.week))}
          placeholder="Palavras novas, resumo, dúvidas… / New words, summary, questions…"
          className="input"
        />
      </div>
    </div>
  );
}

function VideoTab({ week, color }: TabProps) {
  const watched = useProgress((s) => !!s.videosWatched[week.week]);
  const toggleVideo = useProgress((s) => s.toggleVideo);
  return (
    <article className="card flex flex-col items-center gap-4 p-6 text-center">
      <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-accent-red text-white shadow-lift">
        <Youtube className="h-10 w-10" aria-hidden />
      </span>
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Canal / Channel</p>
        <h2 className="text-2xl font-extrabold" style={{ color }}>{week.video.channel}</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Busca / Search: <span className="font-semibold">“{week.video.search}”</span>
        </p>
      </div>
      <a href={week.video.url} target="_blank" rel="noopener noreferrer" className="btn min-h-[56px] bg-accent-red px-6 text-white shadow-lift">
        <ExternalLink className="h-5 w-5" aria-hidden />
        <Bi pt="Abrir vídeo" en="Open video" />
      </a>
      <CheckToggle checked={watched} onChange={() => toggleVideo(week.week)} pt="Assisti" en="Watched" color={color} />
    </article>
  );
}
