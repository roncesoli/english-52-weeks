import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Badge } from '../components/Badge';
import { Bi } from '../components/Bi';
import { Page, PageHeader } from '../components/Page';
import { course, weeks } from '../data/course';
import { ACHIEVEMENTS } from '../lib/achievements';
import { cumulativeLearnedByWeek, dailyActivity, weekBreakdown } from '../lib/progress';
import { quarterColor } from '../lib/theme';
import { useProgress } from '../store/useProgress';
import { useStats } from '../store/useStats';

/** Charts card wrapper. */
function ChartCard({ pt, en, children }: { pt: string; en: string; children: React.ReactNode }) {
  return (
    <section className="card p-4">
      <h2 className="mb-3 text-lg font-extrabold">
        <Bi pt={pt} en={en} />
      </h2>
      <div className="h-64 w-full">{children}</div>
    </section>
  );
}

export default function Progress() {
  const progress = useProgress();
  const stats = useStats();
  const dark = progress.settings.darkMode;
  const axis = dark ? '#cbd5e1' : '#475569';
  const grid = dark ? '#2B3F5C' : '#e2e8f0';
  const tooltipStyle = {
    backgroundColor: dark ? '#1D2D44' : '#fff',
    border: 'none',
    borderRadius: 12,
    boxShadow: '0 4px 20px -4px rgba(0,0,0,.2)',
    color: dark ? '#fff' : '#1D2D44',
  };

  // Planned vs actual cumulative words (actual only up to the current week).
  const lineData = useMemo(() => {
    const actual = cumulativeLearnedByWeek(progress.learnedWords, progress.settings.startDate, stats.currentWeek);
    return weeks.map((w, i) => ({
      week: w.week,
      planejado: w.cumulativeWords,
      aprendidas: i < actual.length ? actual[i] : undefined,
    }));
  }, [progress.learnedWords, progress.settings.startDate, stats.currentWeek]);

  const barData = useMemo(
    () => weeks.map((w, i) => ({ week: w.week, pct: Math.round(stats.percents[i]), quarter: w.quarter })),
    [stats.percents],
  );

  // Completed blocks across the whole year, weighted equally by item count per block.
  const donutData = useMemo(() => {
    let words = 0, phrases = 0, book = 0, video = 0;
    weeks.forEach((w) => {
      const b = weekBreakdown(w, progress);
      words += b.wordsLearned;
      phrases += b.phrasesPracticed;
      book += b.book ? 1 : 0;
      video += b.video ? 1 : 0;
    });
    const totalWords = weeks.reduce((s, w) => s + w.words.length, 0);
    const totalPhrases = weeks.reduce((s, w) => s + w.phrases.length, 0);
    return [
      { name: 'Palavras / Words', value: words, total: totalWords, color: '#3E7CB1', weight: course.weights.words },
      { name: 'Frases / Phrases', value: phrases, total: totalPhrases, color: '#8E44AD', weight: course.weights.phrases },
      { name: 'Livro / Book', value: book, total: weeks.length, color: '#2E8B57', weight: course.weights.book },
      { name: 'Vídeo / Video', value: video, total: weeks.length, color: '#E4572E', weight: course.weights.video },
    ];
  }, [progress]);
  const donutHasData = donutData.some((d) => d.value > 0);

  const activityData = useMemo(() => dailyActivity(progress.activity, 30), [progress.activity]);

  return (
    <Page>
      <PageHeader pt="Evolução" en="Progress" />

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard pt="Palavras: aprendidas × planejado" en="Words: learned vs. planned">
          <ResponsiveContainer>
            <LineChart data={lineData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid stroke={grid} strokeDasharray="3 3" />
              <XAxis dataKey="week" stroke={axis} fontSize={11} />
              <YAxis stroke={axis} fontSize={11} />
              <Tooltip contentStyle={tooltipStyle} labelFormatter={(l) => `Semana / Week ${l}`} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="planejado" name="Planejado / Planned" stroke="#94a3b8" strokeDasharray="5 5" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="aprendidas" name="Aprendidas / Learned" stroke="#17BEBB" strokeWidth={3} dot={{ r: 3 }} connectNulls={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard pt="% por semana" en="% per week">
          <ResponsiveContainer>
            <BarChart data={barData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid stroke={grid} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="week" stroke={axis} fontSize={11} />
              <YAxis domain={[0, 100]} stroke={axis} fontSize={11} />
              <Tooltip contentStyle={tooltipStyle} labelFormatter={(l) => `Semana / Week ${l}`} formatter={(v) => [`${v}%`, 'Progresso / Progress']} />
              <Bar dataKey="pct" radius={[4, 4, 0, 0]}>
                {barData.map((d) => (
                  <Cell key={d.week} fill={quarterColor(d.quarter)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard pt="Blocos concluídos" en="Completed blocks">
          {donutHasData ? (
            <ResponsiveContainer>
              <PieChart>
                <Pie data={donutData} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="85%" paddingAngle={3}>
                  {donutData.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v, _n, item) => [`${v} / ${(item.payload as { total: number }).total}`, (item.payload as { name: string }).name]}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-center text-sm text-slate-500 dark:text-slate-400">
              <Bi pt="Comece a estudar para ver seus blocos aqui." en="Start studying to see your blocks here." />
            </div>
          )}
        </ChartCard>

        <ChartCard pt="Atividade (30 dias)" en="Activity (30 days)">
          <ResponsiveContainer>
            <BarChart data={activityData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid stroke={grid} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" stroke={axis} fontSize={10} interval={4} />
              <YAxis allowDecimals={false} stroke={axis} fontSize={11} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [v, 'Ações / Actions']} />
              <Bar dataKey="actions" fill="#FFC914" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <section className="mt-6" aria-labelledby="ach-title">
        <h2 id="ach-title" className="mb-3 text-2xl font-extrabold">
          <Bi pt={`Conquistas (${Object.keys(progress.achievements).length}/${ACHIEVEMENTS.length})`} en="Achievements" />
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {ACHIEVEMENTS.map((a, i) => (
            <Badge key={a.id} achievement={a} unlockedAt={progress.achievements[a.id]} index={i} />
          ))}
        </div>
      </section>
    </Page>
  );
}
