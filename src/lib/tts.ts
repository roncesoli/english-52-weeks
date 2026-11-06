/**
 * Text-to-speech helpers built on the Web Speech API.
 * Uses an en-US voice at rate 0.85 (slightly slower for learners).
 */

let cachedVoice: SpeechSynthesisVoice | null = null;

export const ttsSupported = (): boolean =>
  typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;

function pickVoice(): SpeechSynthesisVoice | null {
  if (!ttsSupported()) return null;
  if (cachedVoice) return cachedVoice;
  const voices = window.speechSynthesis.getVoices();
  cachedVoice =
    voices.find((v) => v.lang === 'en-US' && /google|natural|samantha|aria|jenny/i.test(v.name)) ||
    voices.find((v) => v.lang === 'en-US') ||
    voices.find((v) => v.lang.replace('_', '-').startsWith('en-US')) ||
    voices.find((v) => v.lang.startsWith('en')) ||
    null;
  return cachedVoice;
}

// Voices load asynchronously in most browsers.
if (ttsSupported()) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoice = null;
    pickVoice();
  };
}

/** Speaks an English text. Cancels anything currently being spoken. */
export function speak(text: string, onEnd?: () => void): void {
  if (!ttsSupported()) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US';
  u.rate = 0.85;
  const voice = pickVoice();
  if (voice) u.voice = voice;
  if (onEnd) u.onend = onEnd;
  synth.speak(u);
}

export function stopSpeaking(): void {
  if (ttsSupported()) window.speechSynthesis.cancel();
}
