import { motion } from 'framer-motion';
import { BookOpen, CalendarDays, Flame, ListChecks, Play, Repeat, Sparkles, Youtube } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Bi } from '../components/Bi';
import { Heatmap } from '../components/Heatmap';
import { Page } from '../components/Page';
import { ProgressRing } from '../components/ProgressRing';
import { StatCard } from '../components/StatCard';
import { course, getWeek, TOTAL_BOOKS, TOTAL_WEEKS, TOTAL_WORDS } from '../data/course';
import { quarterColor } from '../lib/theme';
import { useStats } from '../store/useStats';

/** Dashboard. */
export default function Home() {
  const navigate = useNavigate();
  const stats = useStats();
  const week = getWeek(stats.currentWeek)!;
  const color = quarterColor(week.quarter);
  const weekPct = stats.percents[week.week - 1] ?? 0;

  return (
    <Page>
      <header className="mb-5">
        <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
          Olá, {course.owner}! 👋 <span className="font-normal opacity-70">/ Hello!</span>
        </p>
        <h1 className="text-3xl font-extrabold text-navy dark:text-white">{course.title}</h1>
      </header>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        {/* Year ring */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card flex flex-col items-center gap-4 bg-navy p-6 text-white sm:flex-row"
        >
          <ProgressRing value={stats.year} size={180} stroke={18} color="#FFC914" trackColor="rgba(255,255,255,0.12)" label="Progresso do ano / Year progress">
            <div className="flex flex-col items-center">
              <span className="text-4xl font-extrabold">{Math.round(stats.year)}%</span>
              <span className="text-xs opacity-70">do ano / of the year</span>
            </div>
          </ProgressRing>
          <div className="flex flex-1 flex-col gap-3 text-center sm:text-left">
            <Bi pt={`Semana atual: ${week.week} de ${TOTAL_WEEKS}`} en={`Current week: ${week.week} of ${TOTAL_WEEKS}`} className="text-lg font-extrabold" />
            <span className="inline-flex items-center justify-center gap-2 self-center rounded-full px-3 py-1 text-xs font-bold sm:self-start" style={{ backgroundColor: color }}>
              Q{week.quarter} · {week.quarterTheme}
            </span>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate(`/week/${week.week}`)}
              className="btn min-h-[56px] bg-accent-yellow text-lg text-navy shadow-lift"
            >
              <Play className="h-6 w-6" aria-hidden />
              <Bi pt={`Continuar semana ${week.week}`} en={`Continue week ${week.week}`} />
            </motion.button>
          </div>
        </motion.div>

        {/* Current week card */}
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => navigate(`/week/${week.week}`)}
          className="card flex flex-col gap-3 p-5 text-left transition hover:shadow-lift"
          style={{ borderTop: `6px solid ${color}` }}
        >
          <div className="flex items-center justify-between">
            <Bi pt="Esta semana" en="This week" className="text-lg font-extrabold" />
            <ProgressRing value={weekPct} size={64} stroke={7} color={color} />
          </div>
          <div className="flex flex-wrap gap-2">
            {week.words.map((w) => (
              <span key={w.en} lang="en" className="rounded-full px-3 py-1 text-sm font-bold" style={{ backgroundColor: `${color}1f`, color }}>
                {w.en}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <BookOpen className="h-4 w-4 shrink-0" aria-hidden /> {week.book.title} — {week.book.part}
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <Youtube className="h-4 w-4 shrink-0" aria-hidden /> {week.video.channel}
          </div>
        </motion.button>
      </section>

      <section className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Estatísticas / Stats">
        <StatCard icon={Sparkles} pt="Palavras aprendidas" en="Words learned" value={`${stats.wordsLearned} / ${TOTAL_WORDS}`} color="#3E7CB1" onClick={() => navigate('/flashcards')} />
        <StatCard icon={BookOpen} pt="Livros terminados" en="Books finished" value={`${stats.books} / ${TOTAL_BOOKS}`} color="#2E8B57" />
        <StatCard icon={Youtube} pt="Vídeos assistidos" en="Videos watched" value={`${stats.videos} / ${TOTAL_WEEKS}`} color="#E4572E" />
        <StatCard
          icon={Flame}
          pt="Sequência de dias"
          en="Study streak"
          value={`${stats.streak.current} 🔥`}
          sub={`Recorde / Best: ${stats.streak.best}`}
          color="#D35400"
        />
      </section>

      <section className="mt-4 grid gap-3 sm:grid-cols-2">
        <button onClick={() => navigate('/review')} className="card flex min-h-touch items-center gap-3 p-4 text-left transition hover:shadow-lift">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-teal/15 text-accent-teal">
            <Repeat className="h-6 w-6" aria-hidden />
          </span>
          <Bi pt={`${stats.due.length} palavras para revisar hoje`} en={`${stats.due.length} words to review today`} className="font-extrabold" />
        </button>
        <button onClick={() => navigate(`/quiz/${week.week}`)} className="card flex min-h-touch items-center gap-3 p-4 text-left transition hover:shadow-lift">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-q2/15 text-q2">
            <ListChecks className="h-6 w-6" aria-hidden />
          </span>
          <Bi pt={`Quiz da semana ${week.week}`} en={`Week ${week.week} quiz`} className="font-extrabold" />
        </button>
      </section>

      <section className="card mt-4 p-5" aria-label="Mapa do ano / Year map">
        <div className="mb-3 flex items-center justify-between">
          <Bi pt="Mapa das 52 semanas" en="52-week map" className="text-lg font-extrabold" />
          <button onClick={() => navigate('/weeks')} className="btn-ghost text-sm">
            <CalendarDays className="h-4 w-4" aria-hidden /> <Bi pt="Ver todas" en="See all" inline />
          </button>
        </div>
        <Heatmap percents={stats.percents} currentWeek={stats.currentWeek} />
      </section>
    </Page>
  );
}
