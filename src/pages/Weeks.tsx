import { LayoutGrid, List, Unlock } from 'lucide-react';
import { useState } from 'react';
import { Bi } from '../components/Bi';
import { Page, PageHeader } from '../components/Page';
import { ProgressRing } from '../components/ProgressRing';
import { WeekCard } from '../components/WeekCard';
import { quarterThemes, weeks } from '../data/course';
import { isUnlocked, UNLOCK_THRESHOLD } from '../lib/progress';
import { quarterColor } from '../lib/theme';
import { useProgress } from '../store/useProgress';
import { useStats } from '../store/useStats';

/** All 52 weeks grouped by quarter. */
export default function Weeks() {
  const { percents, currentWeek } = useStats();
  const unlockAll = useProgress((s) => s.settings.unlockAll);
  const quizzes = useProgress((s) => s.quizzes);
  const updateSettings = useProgress((s) => s.updateSettings);
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');

  return (
    <Page>
      <PageHeader
        pt="Semanas"
        en="Weeks"
        right={
          <div className="flex gap-1 rounded-xl bg-white p-1 shadow-soft dark:bg-navy-light" role="group" aria-label="Layout">
            <button aria-label="Grade / Grid" aria-pressed={layout === 'grid'} onClick={() => setLayout('grid')} className={`icon-btn ${layout === 'grid' ? 'bg-surface dark:bg-navy' : ''}`}>
              <LayoutGrid className="h-5 w-5" aria-hidden />
            </button>
            <button aria-label="Lista / List" aria-pressed={layout === 'list'} onClick={() => setLayout('list')} className={`icon-btn ${layout === 'list' ? 'bg-surface dark:bg-navy' : ''}`}>
              <List className="h-5 w-5" aria-hidden />
            </button>
          </div>
        }
      />

      <div className="card mb-5 flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
        <Bi
          pt={`Uma semana desbloqueia quando a anterior chega a ${UNLOCK_THRESHOLD}%.`}
          en={`A week unlocks when the previous one reaches ${UNLOCK_THRESHOLD}%.`}
        />
        <button
          role="switch"
          aria-checked={unlockAll}
          onClick={() => updateSettings({ unlockAll: !unlockAll })}
          className={`btn text-sm ${unlockAll ? 'bg-accent-lime text-white' : 'bg-surface dark:bg-navy'}`}
        >
          <Unlock className="h-4 w-4" aria-hidden />
          <Bi pt="Desbloquear tudo" en="Unlock all" inline />
        </button>
      </div>

      {[1, 2, 3, 4].map((q) => {
        const qWeeks = weeks.filter((w) => w.quarter === q);
        const qPct = qWeeks.reduce((s, w) => s + (percents[w.week - 1] ?? 0), 0) / (qWeeks.length || 1);
        const color = quarterColor(q);
        return (
          <section key={q} className="mb-8" aria-labelledby={`q${q}-title`}>
            <div className="mb-3 flex items-center gap-3">
              <ProgressRing value={qPct} size={48} stroke={6} color={color}>
                <span className="text-[11px] font-extrabold">Q{q}</span>
              </ProgressRing>
              <div>
                <h2 id={`q${q}-title`} className="text-xl font-extrabold" style={{ color }}>
                  {q}º trimestre / Quarter {q}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {quarterThemes[q]} · {Math.round(qPct)}%
                </p>
              </div>
            </div>
            <div className={layout === 'grid' ? 'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3' : 'flex flex-col gap-2'}>
              {qWeeks.map((w) => (
                <WeekCard
                  key={w.week}
                  week={w}
                  percent={percents[w.week - 1] ?? 0}
                  locked={!isUnlocked(w.week, percents, unlockAll)}
                  current={w.week === currentWeek}
                  quizPassed={quizzes[w.week]?.passed}
                />
              ))}
            </div>
          </section>
        );
      })}
    </Page>
  );
}
