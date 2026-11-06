/** Confetti celebration (canvas-confetti), respecting reduced-motion preferences. */
import confetti from 'canvas-confetti';

export function celebrate(colors = ['#3E7CB1', '#8E44AD', '#D35400', '#2E8B57', '#FFC914', '#17BEBB']) {
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
  const end = Date.now() + 1200;
  const frame = () => {
    confetti({ particleCount: 5, angle: 60, spread: 70, origin: { x: 0, y: 0.7 }, colors });
    confetti({ particleCount: 5, angle: 120, spread: 70, origin: { x: 1, y: 0.7 }, colors });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  confetti({ particleCount: 120, spread: 100, origin: { y: 0.6 }, colors });
  frame();
}
