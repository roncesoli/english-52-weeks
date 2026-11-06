import { AnimatePresence, motion } from 'framer-motion';
import { Bell, CalendarDays, Download, Moon, RotateCcw, Sun, Unlock, Upload } from 'lucide-react';
import { useRef, useState, type ReactNode } from 'react';
import { Bi } from '../components/Bi';
import { Page, PageHeader } from '../components/Page';
import { programWeekAt, todayISO } from '../lib/progress';
import { exportData, isProgressData, useProgress } from '../store/useProgress';

/** One settings row. */
function Row({ icon, pt, en, desc, children }: { icon: ReactNode; pt: string; en: string; desc?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-100 p-4 last:border-0 dark:border-navy sm:flex-row sm:items-center">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface text-navy dark:bg-navy dark:text-accent-yellow">{icon}</span>
      <div className="flex-1">
        <Bi pt={pt} en={en} className="font-extrabold" />
        {desc && <p className="text-xs text-slate-500 dark:text-slate-400">{desc}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

/** Accessible on/off switch. */
function Switch({ on, onChange, label }: { on: boolean; onChange: () => void; label: string }) {
  return (
    <button role="switch" aria-checked={on} aria-label={label} onClick={onChange} className={`relative h-8 w-14 rounded-full transition ${on ? 'bg-q4' : 'bg-slate-300 dark:bg-navy'}`}>
      <motion.span layout className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow ${on ? 'right-1' : 'left-1'}`} />
    </button>
  );
}

export default function Settings() {
  const settings = useProgress((s) => s.settings);
  const updateSettings = useProgress((s) => s.updateSettings);
  const importData = useProgress((s) => s.importData);
  const reset = useProgress((s) => s.reset);
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const notifSupported = 'Notification' in window;
  const [permission, setPermission] = useState(notifSupported ? Notification.permission : 'denied');

  const flash = (ok: boolean, text: string) => {
    setMessage({ ok, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const onReminder = async (time: string) => {
    updateSettings({ reminderTime: time });
    if (time && notifSupported && Notification.permission === 'default') {
      setPermission(await Notification.requestPermission());
    }
  };

  const onExport = () => {
    const blob = new Blob([JSON.stringify(exportData(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `english52-backup-${todayISO()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    flash(true, 'Backup exportado! / Backup exported!');
  };

  const onImport = async (file?: File) => {
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (!isProgressData(data)) throw new Error('invalid');
      if (!confirm('Substituir seu progresso atual por este backup? / Replace your current progress with this backup?')) return;
      importData(data);
      flash(true, 'Backup importado! / Backup imported!');
    } catch {
      flash(false, 'Arquivo inválido / Invalid file');
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <Page>
      <PageHeader pt="Configurações" en="Settings" />

      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            role="status"
            className={`mb-4 rounded-2xl p-3 text-sm font-bold text-white ${message.ok ? 'bg-q4' : 'bg-accent-red'}`}
          >
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      <section className="card mb-4 overflow-hidden p-0">
        <Row
          icon={<CalendarDays className="h-5 w-5" aria-hidden />}
          pt="Início do programa"
          en="Program start date"
          desc={`Semana atual / Current week: ${programWeekAt(settings.startDate)}`}
        >
          <input
            type="date"
            aria-label="Data de início / Start date"
            value={settings.startDate}
            onChange={(e) => e.target.value && updateSettings({ startDate: e.target.value })}
            className="input w-auto min-h-touch"
          />
        </Row>

        <Row
          icon={<Bell className="h-5 w-5" aria-hidden />}
          pt="Lembrete diário"
          en="Daily reminder"
          desc={
            !notifSupported
              ? 'Notificações não suportadas neste navegador / Notifications not supported'
              : permission === 'denied'
                ? 'Notificações bloqueadas no navegador / Notifications blocked'
                : 'Funciona com o app aberto ou instalado / Works while the app is open or installed'
          }
        >
          <input
            type="time"
            aria-label="Horário do lembrete / Reminder time"
            value={settings.reminderTime}
            onChange={(e) => onReminder(e.target.value)}
            className="input w-auto min-h-touch"
          />
          {settings.reminderTime && (
            <button onClick={() => onReminder('')} className="btn-ghost text-sm">
              Desligar / Off
            </button>
          )}
        </Row>

        <Row icon={settings.darkMode ? <Moon className="h-5 w-5" aria-hidden /> : <Sun className="h-5 w-5" aria-hidden />} pt="Modo escuro" en="Dark mode">
          <Switch on={settings.darkMode} onChange={() => updateSettings({ darkMode: !settings.darkMode })} label="Modo escuro / Dark mode" />
        </Row>

        <Row icon={<Unlock className="h-5 w-5" aria-hidden />} pt="Desbloquear tudo" en="Unlock all" desc="Acesse qualquer semana sem precisar de 70% na anterior / Access any week">
          <Switch on={settings.unlockAll} onChange={() => updateSettings({ unlockAll: !settings.unlockAll })} label="Desbloquear tudo / Unlock all" />
        </Row>
      </section>

      <section className="card mb-4 overflow-hidden p-0">
        <Row icon={<Download className="h-5 w-5" aria-hidden />} pt="Backup do progresso" en="Progress backup" desc="Exporte/importe um arquivo JSON / Export/import a JSON file">
          <button onClick={onExport} className="btn-primary text-sm">
            <Download className="h-4 w-4" aria-hidden /> Exportar / Export
          </button>
          <button onClick={() => fileRef.current?.click()} className="btn bg-surface text-sm dark:bg-navy">
            <Upload className="h-4 w-4" aria-hidden /> Importar / Import
          </button>
          <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => onImport(e.target.files?.[0])} aria-hidden tabIndex={-1} />
        </Row>

        <Row icon={<RotateCcw className="h-5 w-5 text-accent-red" aria-hidden />} pt="Apagar progresso" en="Reset progress" desc="Esta ação não pode ser desfeita / This cannot be undone">
          <button onClick={() => setConfirmReset(true)} className="btn bg-accent-red text-sm text-white">
            Apagar / Reset
          </button>
        </Row>
      </section>

      <p className="text-center text-xs text-slate-400">English 52 Weeks · v1.0 · Offline-first PWA</p>

      {/* Reset confirmation dialog */}
      <AnimatePresence>
        {confirmReset && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setConfirmReset(false)}
          >
            <motion.div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="reset-title"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="card w-full max-w-sm p-6 text-center"
            >
              <RotateCcw className="mx-auto mb-3 h-10 w-10 text-accent-red" aria-hidden />
              <h2 id="reset-title" className="mb-2 text-xl font-extrabold">
                <Bi pt="Apagar todo o progresso?" en="Reset all progress?" />
              </h2>
              <p className="mb-5 text-sm text-slate-500 dark:text-slate-400">
                Dica: exporte um backup antes. / Tip: export a backup first.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setConfirmReset(false)} className="btn bg-surface dark:bg-navy" autoFocus>
                  Cancelar / Cancel
                </button>
                <button
                  onClick={() => {
                    reset();
                    setConfirmReset(false);
                    flash(true, 'Progresso apagado / Progress reset');
                  }}
                  className="btn bg-accent-red text-white"
                >
                  Apagar / Reset
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Page>
  );
}
