/* eslint-disable @next/next/no-img-element -- static export: images are served as-is from public/content */

type PhotoProps = {
  src: string;
  alt?: string;
  className?: string;
};

export function Photo({ src, alt = "", className = "" }: PhotoProps) {
  return <img src={src} alt={alt} loading="lazy" decoding="async" className={`object-cover ${className}`} />;
}

/** Washi tape strip. */
export function Tape({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`absolute h-6 w-16 bg-[#f3d9a4]/75 shadow-sm [mask-image:linear-gradient(90deg,transparent_0,#000_6%,#000_94%,transparent_100%)] ${className}`}
    />
  );
}

export function Polaroid({
  src,
  rotate = 0,
  className = "",
}: {
  src: string;
  rotate?: number;
  className?: string;
}) {
  return (
    <figure
      className={`relative bg-paper p-2.5 pb-10 shadow-xl shadow-black/40 ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <Tape className="-top-3 left-1/2 -translate-x-1/2 -rotate-3" />
      <Photo src={src} className="aspect-square w-full bg-cream" />
    </figure>
  );
}
