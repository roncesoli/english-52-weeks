import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface ProgressRingProps {
  /** 0..100 */
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  trackColor?: string;
  /** Content rendered in the middle. Defaults to the rounded percentage. */
  children?: ReactNode;
  label?: string;
  className?: string;
}

/** Apple-Fitness-style animated ring. */
export function ProgressRing({
  value,
  size = 120,
  stroke = 12,
  color = '#3E7CB1',
  trackColor,
  children,
  label,
  className = '',
}: ProgressRingProps) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, value));
  return (
    <div
      className={`relative inline-flex shrink-0 items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={Math.round(v)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? `${Math.round(v)}%`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={trackColor ?? color}
          strokeOpacity={trackColor ? 1 : 0.15}
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (v / 100) * c }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-center">
        {children ?? <span className="font-extrabold" style={{ fontSize: size * 0.24 }}>{Math.round(v)}%</span>}
      </div>
    </div>
  );
}
