/** Bilingual label: Portuguese first, English below (or next to it when `inline`). */
interface BiProps {
  pt: string;
  en: string;
  inline?: boolean;
  className?: string;
  enClassName?: string;
}

export function Bi({ pt, en, inline, className = '', enClassName = '' }: BiProps) {
  if (inline) {
    return (
      <span className={className}>
        {pt} <span className={`font-normal opacity-60 ${enClassName}`}>/ {en}</span>
      </span>
    );
  }
  return (
    <span className={`flex flex-col leading-tight ${className}`}>
      <span>{pt}</span>
      <span lang="en" className={`text-[0.75em] font-normal opacity-60 ${enClassName}`}>
        {en}
      </span>
    </span>
  );
}
