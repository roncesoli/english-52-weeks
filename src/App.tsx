import { AnimatePresence } from 'framer-motion';
import { ListChecks, Moon, Settings as SettingsIcon, Sun } from 'lucide-react';
import { lazy, Suspense, useEffect } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import { AchievementWatcher } from './components/AchievementWatcher';
import { ReminderWatcher } from './components/ReminderWatcher';
import { Sidebar, TabBar } from './components/TabBar';
import { useProgress } from './store/useProgress';
import { useStats } from './store/useStats';
import Home from './pages/Home';
import Weeks from './pages/Weeks';
import WeekDetail from './pages/WeekDetail';
import Flashcards from './pages/Flashcards';
import Quiz from './pages/Quiz';
import Review from './pages/Review';
import Settings from './pages/Settings';

// Code-split the Recharts-heavy screen. Its own Suspense boundary keeps page transitions smooth.
// All chunks are precached by the service worker, so it also works offline.
const Progress = lazy(() => import('./pages/Progress'));

/** Compact header shown on mobile only (desktop uses the sidebar). */
function MobileHeader() {
  const dark = useProgress((s) => s.settings.darkMode);
  const updateSettings = useProgress((s) => s.updateSettings);
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between bg-navy px-4 pb-2 pt-[calc(env(safe-area-inset-top)+0.5rem)] text-white md:hidden">
      <Link to="/" className="flex min-h-touch items-center gap-2 font-extrabold" aria-label="Início / Home">
        <img src="./pwa-192x192.png" alt="" className="h-8 w-8 rounded-lg" />
        English 52
      </Link>
      <div className="flex items-center gap-1">
        <Link to="/quiz" className="icon-btn" aria-label="Quiz">
          <ListChecks className="h-5 w-5" aria-hidden />
        </Link>
        <button className="icon-btn" onClick={() => updateSettings({ darkMode: !dark })} aria-label="Modo escuro / Dark mode" aria-pressed={dark}>
          {dark ? <Sun className="h-5 w-5" aria-hidden /> : <Moon className="h-5 w-5" aria-hidden />}
        </button>
        <Link to="/settings" className="icon-btn" aria-label="Configurações / Settings">
          <SettingsIcon className="h-5 w-5" aria-hidden />
        </Link>
      </div>
    </header>
  );
}

/** Desktop floating dark-mode toggle. */
function DesktopThemeToggle() {
  const dark = useProgress((s) => s.settings.darkMode);
  const updateSettings = useProgress((s) => s.updateSettings);
  return (
    <button
      onClick={() => updateSettings({ darkMode: !dark })}
      aria-label="Modo escuro / Dark mode"
      aria-pressed={dark}
      className="fixed right-6 top-6 z-30 hidden h-11 w-11 items-center justify-center rounded-full bg-white text-navy shadow-soft transition hover:shadow-lift dark:bg-navy-light dark:text-accent-yellow md:flex"
    >
      {dark ? <Sun className="h-5 w-5" aria-hidden /> : <Moon className="h-5 w-5" aria-hidden />}
    </button>
  );
}

function Loading() {
  return (
    <div className="flex h-64 items-center justify-center" role="status" aria-label="Carregando / Loading">
      <span className="h-10 w-10 animate-spin rounded-full border-4 border-q1 border-t-transparent" />
    </div>
  );
}

export default function App() {
  const location = useLocation();
  const dark = useProgress((s) => s.settings.darkMode);
  const { due } = useStats();

  // Apply dark mode to <html>.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#121C2B' : '#1D2D44');
  }, [dark]);

  // Scroll to top on navigation.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen bg-surface text-navy dark:bg-navy-dark dark:text-slate-100">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded-lg focus:bg-accent-yellow focus:px-3 focus:py-2 focus:text-navy">
        Pular para o conteúdo / Skip to content
      </a>
      <Sidebar dueCount={due.length} />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileHeader />
        <DesktopThemeToggle />
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/weeks" element={<Weeks />} />
            <Route path="/week/:n" element={<WeekDetail />} />
            <Route path="/flashcards" element={<Flashcards />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/quiz/:week" element={<Quiz />} />
            <Route path="/review" element={<Review />} />
            <Route
              path="/progress"
              element={
                <Suspense fallback={<Loading />}>
                  <Progress />
                </Suspense>
              }
            />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </AnimatePresence>
      </div>
      <TabBar dueCount={due.length} />
      <AchievementWatcher />
      <ReminderWatcher />
    </div>
  );
}
