import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Bi } from './Bi';

interface StatCardProps {
  icon: LucideIcon;
  pt: string;
  en: string;
  value: ReactNode;
  sub?: ReactNode;
  color: string;
  onClick?: () => void;
}

/** Small dashboard card with icon, bilingual label and big value. */
export function StatCard({ icon: Icon, pt, en, value, sub, color, onClick }: StatCardProps) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      onClick={onClick}
      className="card flex w-full items-center gap-3 p-4 text-left transition hover:shadow-lift"
    >
      <span
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
        style={{ backgroundColor: `${color}22`, color }}
      >
        <Icon className="h-6 w-6" aria-hidden />
      </span>
      <div className="min-w-0">
        <Bi pt={pt} en={en} className="text-xs font-bold text-slate-500 dark:text-slate-400" />
        <div className="text-2xl font-extrabold leading-tight">{value}</div>
        {sub && <div className="text-xs text-slate-500 dark:text-slate-400">{sub}</div>}
      </div>
    </Tag>
  );
}
