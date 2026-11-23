"use client";

import { Heart } from "@/components/decor/Illustrations";
import { Photo } from "@/components/decor/Photo";
import { between, seeded } from "@/components/decor/random";

/** Pink, red, yellow, blue, orange, purple. */
const COLORS = ["#ff7aa2", "#e11d48", "#facc15", "#3b82f6", "#fb923c", "#a855f7"];
const HEART_COUNT = 28;
const PHOTO_COUNT = 8;

/**
 * Endless rain of multicoloured hearts with small polaroid photos mixed in.
 * Everything starts above the top edge right after mount (positive delays +
 * fill-mode "backwards"), so it reads as bursting out of the broken heart.
 */
export default function LoveRain({ photos }: { photos: string[] }) {
  const rand = seeded(42);

  const hearts = Array.from({ length: HEART_COUNT }, (_, i) => ({
    id: i,
    left: between(rand, 0, 96),
    size: between(rand, 18, 42),
    duration: between(rand, 6, 11),
    delay: between(rand, 0, 2),
    sway: between(rand, 2.5, 4.5),
    color: COLORS[i % COLORS.length],
  }));

  const lane = 100 / PHOTO_COUNT;
  const cards =
    photos.length === 0
      ? []
      : Array.from({ length: PHOTO_COUNT }, (_, i) => ({
          id: i,
          src: photos[i % photos.length],
          // one lane per card so cards never stack; lanes start in a shuffled order
          left: i * lane + between(rand, 0, lane * 0.3),
          width: between(rand, 72, 110),
          duration: between(rand, 10, 16),
          delay: between(rand, 0.6, 1.2) + ((i * 5) % PHOTO_COUNT) * 1.2,
          tumble: between(rand, 3.5, 6.5),
          reverse: i % 2 === 1,
        }));

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {cards.map((c) => (
        <div
          key={`photo-${c.id}`}
          className="anim-fall-tilt absolute top-0"
          style={{
            // keep the whole card on screen at every lane
            left: `calc(${c.left}% - ${(c.left / 100) * c.width}px)`,
            width: c.width,
            animationDuration: `${c.duration}s`,
            animationDelay: `${c.delay}s`,
            animationFillMode: "backwards",
            perspective: 700,
          }}
        >
          {/* 3D tumble: polaroid front, paper back with a heart */}
          <div
            className="anim-tumble relative"
            style={{ animationDuration: `${c.tumble}s`, animationDirection: c.reverse ? "reverse" : "normal" }}
          >
            <div className="bg-paper p-1.5 pb-5 shadow-lg shadow-black/40 [backface-visibility:hidden]">
              <Photo src={c.src} className="aspect-square w-full bg-cream" />
            </div>
            <div className="absolute inset-0 grid place-items-center bg-[#f3e7d6] shadow-lg shadow-black/40 [backface-visibility:hidden] [transform:rotateY(180deg)]">
              <Heart className="w-1/3" color="#e8485f" />
            </div>
          </div>
        </div>
      ))}
      {hearts.map((h) => (
        <div
          key={`heart-${h.id}`}
          className="anim-fall absolute top-0"
          style={{
            left: `${h.left}%`,
            animationDuration: `${h.duration}s`,
            animationDelay: `${h.delay}s`,
            animationFillMode: "backwards",
          }}
        >
          <div
            className="anim-sway drop-shadow-[0_2px_4px_rgb(0_0_0/0.3)]"
            style={{ width: h.size, height: h.size, animationDuration: `${h.sway}s` }}
          >
            <Heart className="size-full" color={h.color} />
          </div>
        </div>
      ))}
    </div>
  );
}
