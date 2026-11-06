import { useEffect } from 'react';
import { dayKey } from '../lib/progress';
import { useProgress } from '../store/useProgress';

const LAST_KEY = 'e52-last-reminder';

/**
 * Daily study reminder using the browser Notification API.
 * Checks every 30 s while the app is open; fires once per day at/after the chosen time
 * if no action has been recorded today.
 */
export function ReminderWatcher() {
  const reminderTime = useProgress((s) => s.settings.reminderTime);

  useEffect(() => {
    if (!reminderTime || !('Notification' in window)) return;

    const check = async () => {
      if (Notification.permission !== 'granted') return;
      const now = new Date();
      const [h, m] = reminderTime.split(':').map(Number);
      const target = new Date();
      target.setHours(h, m, 0, 0);
      const today = dayKey(now.getTime());
      if (now < target || localStorage.getItem(LAST_KEY) === today) return;

      const studiedToday = useProgress.getState().activity.some((e) => dayKey(e.t) === today);
      localStorage.setItem(LAST_KEY, today);
      if (studiedToday) return;

      const title = 'English 52 Weeks';
      const options: NotificationOptions = {
        body: 'Hora de estudar! / Time to study! 📚',
        icon: './pwa-192x192.png',
        badge: './pwa-192x192.png',
        tag: 'e52-daily',
      };
      // Prefer the service worker (required on Android).
      const reg = await navigator.serviceWorker?.getRegistration();
      if (reg) reg.showNotification(title, options);
      else new Notification(title, options);
    };

    check();
    const id = setInterval(check, 30_000);
    return () => clearInterval(id);
  }, [reminderTime]);

  return null;
}
