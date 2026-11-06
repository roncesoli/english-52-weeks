import {
  BarChart3,
  BookOpenCheck,
  CalendarDays,
  Home,
  Layers,
  type LucideIcon,
  Repeat,
  Settings as SettingsIcon,
  ListChecks,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

export interface NavItem {
  to: string;
  icon: LucideIcon;
  pt: string;
  en: string;
  /** Show on the mobile bottom bar. */
  mobile: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', icon: Home, pt: 'Início', en: 'Home', mobile: true },
  { to: '/weeks', icon: CalendarDays, pt: 'Semanas', en: 'Weeks', mobile: true },
  { to: '/flashcards', icon: Layers, pt: 'Cartões', en: 'Cards', mobile: true },
  { to: '/review', icon: Repeat, pt: 'Revisão', en: 'Review', mobile: true },
  { to: '/quiz', icon: ListChecks, pt: 'Quiz', en: 'Quiz', mobile: false },
  { to: '/progress', icon: BarChart3, pt: 'Evolução', en: 'Progress', mobile: true },
  { to: '/settings', icon: SettingsIcon, pt: 'Configurações', en: 'Settings', mobile: false },
];

function DueBadge({ count }: { count: number }) {
  if (!count) return null;
  return (
    <span
      className="absolute -right-2 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-red px-1 text-[10px] font-extrabold text-white"
      aria-label={`${count} para revisar / to review`}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}

/** Bottom tab bar (mobile). */
export function TabBar({ dueCount }: { dueCount: number }) {
  return (
    <nav
      aria-label="Navegação principal / Main navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur dark:border-navy-light dark:bg-navy/95 md:hidden"
    >
      <ul className="grid grid-cols-5">
        {NAV_ITEMS.filter((i) => i.mobile).map(({ to, icon: Icon, pt, en }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex min-h-[60px] flex-col items-center justify-center gap-0.5 text-[11px] font-bold transition ${
                  isActive ? 'text-q1 dark:text-accent-yellow' : 'text-slate-500 dark:text-slate-400'
                }`
              }
            >
              <span className="relative">
                <Icon className="h-6 w-6" aria-hidden />
                {to === '/review' && <DueBadge count={dueCount} />}
              </span>
              <span>{pt}</span>
              <span lang="en" className="text-[9px] font-normal opacity-70">{en}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Left sidebar (desktop). */
export function Sidebar({ dueCount }: { dueCount: number }) {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-navy p-4 text-white md:flex" aria-label="Menu">
      <div className="mb-6 flex items-center gap-3 px-2">
        <img src="./pwa-192x192.png" alt="" className="h-11 w-11 rounded-xl" />
        <div>
          <div className="text-lg font-extrabold leading-tight">English 52</div>
          <div className="text-xs opacity-70">Weeks</div>
        </div>
      </div>
      <nav aria-label="Navegação principal / Main navigation">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ to, icon: Icon, pt, en }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex min-h-touch items-center gap-3 rounded-xl px-3 py-2 font-bold transition ${
                    isActive ? 'bg-white/15 text-accent-yellow' : 'text-white/80 hover:bg-white/10'
                  }`
                }
              >
                <span className="relative">
                  <Icon className="h-5 w-5" aria-hidden />
                  {to === '/review' && <DueBadge count={dueCount} />}
                </span>
                <span className="flex flex-col leading-tight">
                  <span>{pt}</span>
                  <span lang="en" className="text-[11px] font-normal opacity-60">{en}</span>
                </span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-auto flex items-center gap-2 rounded-xl bg-white/10 p-3 text-xs">
        <BookOpenCheck className="h-4 w-4 text-accent-teal" aria-hidden />
        <span>Offline-first PWA</span>
      </div>
    </aside>
  );
}
