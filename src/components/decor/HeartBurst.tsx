"use client";

import { createPortal } from "react-dom";
import { motion } from "motion/react";
import { Heart } from "./Illustrations";
import { between, seeded } from "./random";

const COLORS = ["#ff5c77", "#d92648", "#f08a98", "#e8485f", "#c9a227", "#fdf8f0"];

/**
 * One-shot burst of hearts from a point: they arc up and out to the left and
 * right, then fall past the bottom of the screen.
 * Portalled to <body> as a fixed, clipped layer: flying hearts never cause page
 * scroll, and a transformed ancestor (Screen) cannot re-anchor "fixed". Client-only:
 * mount it after a user interaction, never during SSR.
 */
export function HeartBurst({
  x,
  y,
  viewport,
  scale = 1,
  count = 48,
  seed = 11,
}: {
  x: number;
  y: number;
  /** Viewport size at launch: sets how wide the hearts spread and how far they fall. */
  viewport: { width: number; height: number };
  /** Grows heart size and launch height with the envelope. */
  scale?: number;
  count?: number;
  seed?: number;
}) {
  const rand = seeded(seed);
  // far enough to reach (and leave) the bottom edge from the launch point
  const toBottom = viewport.height - y + 60;
  const hearts = Array.from({ length: count }, (_, i) => {
    const side = i % 2 === 0 ? -1 : 1;
    return {
      id: i,
      // spread from near the centre out past the screen edges
      dx: side * between(rand, 0.08, 0.62) * viewport.width,
      peak: between(rand, 70, 220) * scale,
      fall: toBottom + between(rand, 0, 120),
      size: between(rand, 22, 40) * Math.sqrt(scale),
      spin: side * between(rand, 20, 120),
      delay: between(rand, 0, 0.5),
      duration: between(rand, 2.2, 3.2),
      color: COLORS[i % COLORS.length],
    };
  });

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden>
      {hearts.map((h) => {
        const t = { delay: h.delay, duration: h.duration };
        return (
          <motion.div
            key={h.id}
            className="absolute drop-shadow-[0_2px_4px_rgb(0_0_0/0.3)]"
            style={{ left: x - h.size / 2, top: y - h.size / 2, width: h.size, height: h.size }}
            initial={{ x: 0, y: 0, scale: 0, opacity: 0, rotate: 0 }}
            animate={{
              x: h.dx,
              y: [0, -h.peak, h.fall],
              scale: [0, 1.15, 1],
              opacity: [0, 1, 1, 0.85],
              rotate: h.spin,
            }}
            transition={{
              // x eases out while y shoots up then drops like gravity: an arc that
              // ends below the bottom edge
              x: { ...t, ease: [0.15, 0.55, 0.4, 1] },
              y: { ...t, times: [0, 0.28, 1], ease: ["easeOut", [0.45, 0, 0.9, 0.6]] },
              scale: { ...t, times: [0, 0.15, 1] },
              opacity: { ...t, times: [0, 0.06, 0.85, 1] },
              rotate: { ...t, ease: "linear" },
            }}
          >
            <Heart className="size-full" color={h.color} />
          </motion.div>
        );
      })}
    </div>,
    document.body,
  );
}
