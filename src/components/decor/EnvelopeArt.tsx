import type React from "react";

/*
 * Layered envelope built from public/love_letter.svg (the owner's artwork).
 *
 * The source draws a closed envelope as one picture; here it is split into
 * layers EnvelopeScreen can animate. Every layer keeps the source's absolute
 * coordinates, so paths are copied verbatim:
 *   envelope box  x 373.96 → 1073.82, y 358.5 → 871.77 (699.86 × 513.27)
 *   flap box      y 358.5 → 648 (289.5 tall, 56.4% of the envelope)
 *   wax seal      centred on (723.89, 646)
 * Additions not in the source: the side folds of the pocket (same colour as
 * the body, so the closed envelope looks identical), the inside of the
 * envelope, and the inner face of the flap.
 */

type LayerProps = { className?: string; style?: React.CSSProperties };

const BOX = "373.96 358.5 699.86 513.27";
const FLAP_BOX = "373.96 358.5 699.86 289.5";
const FLAP_PATH = "M373.96,358.5 H1073.82 V372 L736.5,642 C729,648 718.78,648 711.28,642 L373.96,372 Z";
const POCKET_SIDES = "M373.96,358.5 L723.89,640 L1073.82,358.5 V871.77 H373.96 Z";
const HEART =
  "M0,13.5 C0,13.5 -14.5,3.5 -14.5,-5.5 C-14.5,-10.5 -10.5,-14 -6,-14 C-2.8,-14 -0.8,-12 0,-10 C0.8,-12 2.8,-14 6,-14 C10.5,-14 14.5,-10.5 14.5,-5.5 C14.5,3.5 0,13.5 0,13.5 Z";

/** Each inline <svg> needs its own ids, so shared defs take a prefix. */
function EnvelopeClip({ id }: { id: string }) {
  return (
    <clipPath id={id}>
      <rect x="373.96" y="358.5" width="699.86" height="513.27" rx="16" ry="16" />
    </clipPath>
  );
}

function BodyGradient({ id }: { id: string }) {
  return (
    <linearGradient id={id} x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#9e192d" />
      <stop offset="50%" stopColor="#8c1426" />
      <stop offset="100%" stopColor="#7a1020" />
    </linearGradient>
  );
}

function GoldGradient({ id }: { id: string }) {
  return (
    <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#c99e48" />
      <stop offset="25%" stopColor="#f5d782" />
      <stop offset="50%" stopColor="#d4a74a" />
      <stop offset="75%" stopColor="#f7dc8b" />
      <stop offset="100%" stopColor="#b88c35" />
    </linearGradient>
  );
}

function PaperTexture({ id }: { id: string }) {
  return (
    <filter id={id} x="0%" y="0%" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" result="noise" />
      <feColorMatrix
        type="matrix"
        values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.06 0"
        in="noise"
        result="coloredNoise"
      />
      <feComposite operator="in" in2="SourceGraphic" />
      <feBlend mode="multiply" in2="SourceGraphic" />
    </filter>
  );
}

/** Inside of the envelope: the body, darkened so it reads as depth. */
export function EnvelopeBack({ className }: LayerProps) {
  return (
    <svg viewBox={BOX} className={className} aria-hidden>
      <defs>
        <EnvelopeClip id="ll-back-clip" />
        <BodyGradient id="ll-back-body" />
      </defs>
      <g clipPath="url(#ll-back-clip)">
        <rect x="373.96" y="358.5" width="699.86" height="513.27" fill="url(#ll-back-body)" />
        <rect x="373.96" y="358.5" width="699.86" height="513.27" fill="#2b0308" opacity="0.35" />
      </g>
    </svg>
  );
}

/** Front pocket: side folds + the source's bottom flap with its gold accents. */
export function EnvelopePocket({ className }: LayerProps) {
  return (
    <svg viewBox={BOX} className={className} aria-hidden>
      <defs>
        <EnvelopeClip id="ll-pocket-clip" />
        <clipPath id="ll-pocket-shape">
          <path d={POCKET_SIDES} />
        </clipPath>
        <BodyGradient id="ll-pocket-body" />
        <linearGradient id="ll-flap-bottom" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#a31c30" />
          <stop offset="100%" stopColor="#851223" />
        </linearGradient>
        <GoldGradient id="ll-pocket-gold" />
        <PaperTexture id="ll-pocket-paper" />
      </defs>
      <g clipPath="url(#ll-pocket-clip)">
        <path d={POCKET_SIDES} fill="url(#ll-pocket-body)" />
        <path d="M373.96,358.5 L723.89,640 L1073.82,358.5" fill="none" stroke="#fff" strokeOpacity="0.12" strokeWidth="2" />
        <g>
          <polygon points="373.96 871.77 723.89 625 1073.82 871.77" fill="#3d050d" opacity="0.35" transform="translate(0, -4)" />
          <polygon points="373.96 871.77 723.89 628 1073.82 871.77" fill="url(#ll-flap-bottom)" />
          <line x1="388" y1="842" x2="682" y2="638" stroke="url(#ll-pocket-gold)" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="1059.78" y1="842" x2="765.78" y2="638" stroke="url(#ll-pocket-gold)" strokeWidth="2.2" strokeLinecap="round" />
        </g>
        <rect
          x="373.96"
          y="358.5"
          width="699.86"
          height="513.27"
          fill="#ffffff"
          opacity="0.15"
          filter="url(#ll-pocket-paper)"
          clipPath="url(#ll-pocket-shape)"
        />
      </g>
    </svg>
  );
}

/** Outer face of the flap — the source's closed flap, shadow and top edge. */
export function EnvelopeFlapFront({ className, style }: LayerProps) {
  return (
    <svg viewBox={FLAP_BOX} overflow="visible" className={className} style={style} aria-hidden>
      <defs>
        <EnvelopeClip id="ll-flap-clip" />
        <clipPath id="ll-flap-shape">
          <path d={FLAP_PATH} />
        </clipPath>
        <linearGradient id="ll-flap-top" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#b82339" />
          <stop offset="100%" stopColor="#96172a" />
        </linearGradient>
        <GoldGradient id="ll-flap-gold" />
        <PaperTexture id="ll-flap-paper" />
        <filter id="ll-flap-shadow" x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#2b0308" floodOpacity="0.55" />
        </filter>
      </defs>
      <g clipPath="url(#ll-flap-clip)">
        <g filter="url(#ll-flap-shadow)">
          <path d={FLAP_PATH} fill="url(#ll-flap-top)" />
          <line x1="390" y1="382" x2="685" y2="618" stroke="url(#ll-flap-gold)" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="1057.78" y1="382" x2="762.78" y2="618" stroke="url(#ll-flap-gold)" strokeWidth="2.2" strokeLinecap="round" />
        </g>
        <rect
          x="373.96"
          y="358.5"
          width="699.86"
          height="289.5"
          fill="#ffffff"
          opacity="0.15"
          filter="url(#ll-flap-paper)"
          clipPath="url(#ll-flap-shape)"
        />
        <line x1="385" y1="359.5" x2="1062.78" y2="359.5" stroke="#d9485e" strokeWidth="1.5" opacity="0.7" />
      </g>
    </svg>
  );
}

/**
 * Inner face of the flap (seen once it has flipped open). Drawn upside down
 * (y' = 1006.5 − y mirrors the flap box onto itself) so that, after the face's
 * own rotateX(180deg) plus the flap's 180° flip, the base sits on the hinge.
 */
export function EnvelopeFlapLining({ className, style }: LayerProps) {
  return (
    <svg viewBox={FLAP_BOX} className={className} style={style} aria-hidden>
      <defs>
        <EnvelopeClip id="ll-lining-clip" />
        <linearGradient id="ll-lining" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#851223" />
          <stop offset="100%" stopColor="#6e0e1c" />
        </linearGradient>
        <GoldGradient id="ll-lining-gold" />
      </defs>
      <g transform="matrix(1 0 0 -1 0 1006.5)">
        <g clipPath="url(#ll-lining-clip)">
          <path d={FLAP_PATH} fill="url(#ll-lining)" />
          <path
            d="M400,372 L723.89,630 L1047.78,372"
            fill="none"
            stroke="url(#ll-lining-gold)"
            strokeWidth="1.6"
            strokeOpacity="0.55"
            strokeLinejoin="round"
          />
        </g>
      </g>
    </svg>
  );
}

/** The source's gold wax seal, centred on (0, 0). */
export function WaxSeal({ className }: LayerProps) {
  return (
    <svg viewBox="-56 -56 112 112" overflow="visible" className={className} aria-hidden>
      <defs>
        <radialGradient id="ll-wax-outer" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#f7dc81" />
          <stop offset="45%" stopColor="#d4ad42" />
          <stop offset="85%" stopColor="#a88222" />
          <stop offset="100%" stopColor="#876514" />
        </radialGradient>
        <linearGradient id="ll-wax-inner" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#b8902a" />
          <stop offset="50%" stopColor="#d9b34a" />
          <stop offset="100%" stopColor="#f5d87d" />
        </linearGradient>
        <linearGradient id="ll-heart" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#6e510d" />
          <stop offset="100%" stopColor="#997319" />
        </linearGradient>
        <filter id="ll-wax-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#240206" floodOpacity="0.6" />
        </filter>
      </defs>
      <g filter="url(#ll-wax-shadow)">
        <path
          d="M-38,-22 C-33,-38 -18,-44 -2,-43 C15,-45 32,-41 39,-25 C46,-11 52,3 48,19 C44,33 30,41 16,45 C2,50 -13,47 -26,39 C-39,31 -50,21 -48,5 C-47,-8 -43,-12 -38,-22 Z"
          fill="url(#ll-wax-outer)"
        />
        <path
          d="M-35,-20 C-30,-35 -16,-40 -2,-39 C14,-41 29,-37 36,-22"
          fill="none"
          stroke="#fff0b3"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.7"
        />
        <circle cx="0" cy="0" r="29" fill="url(#ll-wax-inner)" stroke="#f5d77f" strokeWidth="1.8" />
        <circle cx="0" cy="0" r="26.5" fill="none" stroke="#8f6b14" strokeWidth="1" opacity="0.6" />
        <g transform="translate(0, 2)">
          <path d={HEART} fill="#fae29c" transform="translate(0, 1.2)" />
          <path d={HEART} fill="url(#ll-heart)" />
        </g>
      </g>
    </svg>
  );
}
