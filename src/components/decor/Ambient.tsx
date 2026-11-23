import { Heart } from "./Illustrations";
import { between, seeded } from "./random";

/** Hearts drifting up from the bottom of the screen. */
export function FloatingHearts({ count = 12, seed = 7 }: { count?: number; seed?: number }) {
  const rand = seeded(seed);
  const hearts = Array.from({ length: count }, (_, i) => ({
    id: i,
    left: between(rand, 2, 96),
    size: between(rand, 12, 30),
    duration: between(rand, 9, 16),
    delay: between(rand, -16, 0),
    color: rand() > 0.5 ? "#e8485f" : "#f5b8c0",
  }));
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
      {hearts.map((h) => (
        <div
          key={h.id}
          className="anim-float absolute -bottom-10"
          style={{
            left: `${h.left}%`,
            width: h.size,
            height: h.size,
            animationDuration: `${h.duration}s`,
            animationDelay: `${h.delay}s`,
          }}
        >
          <Heart className="size-full" color={h.color} />
        </div>
      ))}
    </div>
  );
}

/** Rose petals falling with a gentle sway. */
export function FallingPetals({ count = 16, seed = 3 }: { count?: number; seed?: number }) {
  const rand = seeded(seed);
  const petals = Array.from({ length: count }, (_, i) => ({
    id: i,
    left: between(rand, 0, 100),
    size: between(rand, 10, 18),
    duration: between(rand, 8, 14),
    delay: between(rand, -14, 0),
    sway: between(rand, 2.5, 4.5),
    color: ["#c8102e", "#e8485f", "#a50d26", "#f08a98"][i % 4],
  }));
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
      {petals.map((p) => (
        <div
          key={p.id}
          className="anim-fall absolute top-0"
          style={{ left: `${p.left}%`, animationDuration: `${p.duration}s`, animationDelay: `${p.delay}s` }}
        >
          <div
            className="anim-sway rounded-[100%_0_100%_0]"
            style={{
              width: p.size,
              height: p.size * 1.3,
              background: p.color,
              animationDuration: `${p.sway}s`,
            }}
          />
        </div>
      ))}
    </div>
  );
}
