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
    // cropped to the envelope (+4 units margin) so its bottom edge is the box's bottom edge
    <svg viewBox="10 26 100 72" className={className} aria-hidden>
      <rect x="14" y="30" width="92" height="64" rx="6" fill="#f5e6d3" />
      <path d="M14 36 L60 70 L106 36" fill="none" stroke="#c9a49a" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M14 92 L48 62 M106 92 L72 62" stroke="#e2cbb9" strokeWidth="2" />
      <circle cx="60" cy="68" r="12" fill="#b3132b" />
      <path d={HEART_PATH} fill="#f5e6d3" transform="translate(53.5 61.5) scale(0.55)" />
    </svg>
  );
}

const asset = (file: string) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/${file}`;

/** Owner's artwork from public/teddy_bear.svg. */
export function Teddy({ className }: SvgProps) {
  // eslint-disable-next-line @next/next/no-img-element -- static export, see spec §2
  return <img src={asset("teddy_bear.svg")} alt="" aria-hidden className={`object-contain ${className ?? ""}`} />;
}

/** Owner's artwork from public/flower.svg. */
export function Bouquet({ className }: SvgProps) {
  // eslint-disable-next-line @next/next/no-img-element -- static export, see spec §2
  return <img src={asset("flower.svg")} alt="" aria-hidden className={`object-contain ${className ?? ""}`} />;
}
