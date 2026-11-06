import { useNavigate } from 'react-router-dom';
import { weeks } from '../data/course';
import { quarterColor, withAlpha } from '../lib/theme';

interface HeatmapProps {
  percents: number[];
  currentWeek: number;
}

/** 52-cell grid (one per week). Color intensity = % completed. Click opens the week. */
export function Heatmap({ percents, currentWeek }: HeatmapProps) {
  const navigate = useNavigate();
  return (
    <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(13, minmax(0, 1fr))' }}>
      {weeks.map((w, i) => {
        const p = percents[i] ?? 0;
        const color = quarterColor(w.quarter);
        return (
          <button
            key={w.week}
            onClick={() => navigate(`/week/${w.week}`)}
            aria-label={`Semana ${w.week} / Week ${w.week}: ${Math.round(p)}%`}
            title={`Semana ${w.week} — ${Math.round(p)}%`}
            className={`aspect-square rounded-md text-[9px] font-bold transition hover:scale-110 focus-visible:scale-110 md:aspect-auto md:h-9 md:text-[11px] ${
              w.week === currentWeek ? 'ring-2 ring-accent-yellow ring-offset-1 dark:ring-offset-navy' : ''
            }`}
            style={{
              backgroundColor: p > 0 ? withAlpha(color, 0.2 + (p / 100) * 0.8) : withAlpha(color, 0.08),
              color: p > 55 ? '#fff' : color,
            }}
          >
            {w.week}
          </button>
        );
      })}
    </div>
  );
}
