import { Volume2 } from 'lucide-react';
import { useState } from 'react';
import { speak, ttsSupported } from '../lib/tts';

interface SpeakButtonProps {
  text: string;
  color?: string;
  size?: 'md' | 'lg';
  className?: string;
}

/** Round button that reads an English text aloud (en-US, rate 0.85). */
export function SpeakButton({ text, color = '#3E7CB1', size = 'md', className = '' }: SpeakButtonProps) {
  const [speaking, setSpeaking] = useState(false);
  const dim = size === 'lg' ? 'h-14 w-14' : 'h-11 w-11';
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        setSpeaking(true);
        speak(text, () => setSpeaking(false));
        // Fallback in case onend never fires.
        setTimeout(() => setSpeaking(false), 4000);
      }}
      disabled={!ttsSupported()}
      aria-label={`Ouvir / Listen: ${text}`}
      title="Ouvir / Listen"
      className={`inline-flex ${dim} shrink-0 items-center justify-center rounded-full text-white shadow-soft transition active:scale-90 disabled:opacity-40 ${speaking ? 'animate-pulse' : ''} ${className}`}
      style={{ backgroundColor: color }}
    >
      <Volume2 className={size === 'lg' ? 'h-7 w-7' : 'h-5 w-5'} aria-hidden />
    </button>
  );
}
