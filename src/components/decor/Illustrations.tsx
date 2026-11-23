type SvgProps = { className?: string };

export const HEART_PATH =
  "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z";

export function Heart({ className, color = "currentColor" }: SvgProps & { color?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d={HEART_PATH} fill={color} />
    </svg>
  );
}

export function Vinyl({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <circle cx="50" cy="50" r="49" fill="#141012" />
      {[44, 39, 34, 29, 24].map((r) => (
        <circle key={r} cx="50" cy="50" r={r} fill="none" stroke="#2c2528" strokeWidth="1" />
      ))}
      <path d="M22 30 A34 34 0 0 1 40 18" stroke="#ffffff22" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="50" cy="50" r="16" fill="#b3132b" />
      <circle cx="50" cy="50" r="10" fill="none" stroke="#f5e6d355" strokeWidth="0.8" />
      <circle cx="50" cy="50" r="2.4" fill="#141012" />
    </svg>
  );
}

export function GiftLetter({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden>
      <rect x="14" y="30" width="92" height="64" rx="6" fill="#f5e6d3" />
      <path d="M14 36 L60 70 L106 36" fill="none" stroke="#c9a49a" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M14 92 L48 62 M106 92 L72 62" stroke="#e2cbb9" strokeWidth="2" />
      <circle cx="60" cy="68" r="12" fill="#b3132b" />
      <path d={HEART_PATH} fill="#f5e6d3" transform="translate(53.5 61.5) scale(0.55)" />
    </svg>
  );
}

export function Teddy({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden>
      <ellipse cx="60" cy="96" rx="30" ry="21" fill="#a8693f" />
      <ellipse cx="60" cy="98" rx="17" ry="13" fill="#e2b48a" />
      <circle cx="34" cy="96" r="10" fill="#9a5f38" />
      <circle cx="86" cy="96" r="10" fill="#9a5f38" />
      <circle cx="36" cy="30" r="13" fill="#a8693f" />
      <circle cx="84" cy="30" r="13" fill="#a8693f" />
      <circle cx="36" cy="30" r="7" fill="#e2b48a" />
      <circle cx="84" cy="30" r="7" fill="#e2b48a" />
      <circle cx="60" cy="52" r="29" fill="#b47748" />
      <ellipse cx="60" cy="62" rx="12" ry="9" fill="#e9c29a" />
      <circle cx="49" cy="48" r="3.2" fill="#2b1810" />
      <circle cx="71" cy="48" r="3.2" fill="#2b1810" />
      <ellipse cx="60" cy="58" rx="4.5" ry="3.2" fill="#2b1810" />
      <path d="M55 65 Q60 69 65 65" fill="none" stroke="#2b1810" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="44" cy="58" r="4" fill="#e8838a" opacity="0.55" />
      <circle cx="76" cy="58" r="4" fill="#e8838a" opacity="0.55" />
      <path d={HEART_PATH} fill="#b3132b" transform="translate(52 90) scale(0.68)" />
    </svg>
  );
}

function Rose({ x, y, r = 11 }: { x: number; y: number; r?: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="#c8102e" />
      <circle cx={x} cy={y} r={r * 0.62} fill="#a50d26" />
      <path
        d={`M${x - r * 0.35} ${y} a${r * 0.35} ${r * 0.35} 0 1 1 ${r * 0.35} ${r * 0.35}`}
        fill="none"
        stroke="#e84a5f"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </g>
  );
}

export function Bouquet({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden>
      <g stroke="#4f7a3a" strokeWidth="2.5" strokeLinecap="round">
        <line x1="60" y1="96" x2="42" y2="48" />
        <line x1="60" y1="96" x2="60" y2="38" />
        <line x1="60" y1="96" x2="78" y2="48" />
      </g>
      <ellipse cx="34" cy="64" rx="11" ry="5" fill="#5f8f45" transform="rotate(-35 34 64)" />
      <ellipse cx="86" cy="64" rx="11" ry="5" fill="#5f8f45" transform="rotate(35 86 64)" />
      <ellipse cx="46" cy="76" rx="9" ry="4" fill="#6fa052" transform="rotate(-20 46 76)" />
      <Rose x={42} y={46} />
      <Rose x={78} y={46} />
      <Rose x={60} y={34} r={12} />
      <Rose x={51} y={60} r={10} />
      <Rose x={69} y={60} r={10} />
      <circle cx="30" cy="44" r="3" fill="#fdf8f0" />
      <circle cx="90" cy="40" r="3" fill="#fdf8f0" />
      <circle cx="62" cy="20" r="2.5" fill="#fdf8f0" />
      <path d="M38 72 L82 72 L68 114 L52 114 Z" fill="#f5e6d3" />
      <path d="M38 72 L60 80 L82 72" fill="none" stroke="#e2cbb9" strokeWidth="1.5" />
      <path d="M60 92 l-10 -6 v12 z M60 92 l10 -6 v12 z" fill="#b3132b" />
      <circle cx="60" cy="92" r="3" fill="#8e0f22" />
    </svg>
  );
}
