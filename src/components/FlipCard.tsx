import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface FlipCardProps {
  front: ReactNode;
  back: ReactNode;
  flipped: boolean;
  onFlip: () => void;
  color: string;
}

/** 3D flip card. Click / Enter / Space flips it. */
export function FlipCard({ front, back, flipped, onFlip, color }: FlipCardProps) {
  const face =
    'absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-3xl p-6 text-center shadow-lift [backface-visibility:hidden]';
  return (
    <div className="h-72 w-full [perspective:1200px] sm:h-80">
      <motion.div
        role="button"
        tabIndex={0}
        aria-pressed={flipped}
        aria-label={flipped ? 'Mostrar frente / Show front' : 'Virar cartão / Flip card'}
        onClick={onFlip}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            onFlip();
          }
        }}
        className="relative h-full w-full cursor-pointer [transform-style:preserve-3d]"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0.2, 0.2, 1] }}
      >
        <div className={`${face} text-white`} style={{ backgroundColor: color }}>
          {front}
        </div>
        <div className={`${face} bg-white dark:bg-navy-light [transform:rotateY(180deg)]`} style={{ borderTop: `8px solid ${color}` }}>
          {back}
        </div>
      </motion.div>
    </div>
  );
}
