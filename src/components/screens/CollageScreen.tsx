"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Photo } from "@/components/decor/Photo";
import { between, seeded } from "@/components/decor/random";
import { NextButton, Screen, ScriptTitle } from "./Screen";

/** Spread photos over a jittered grid so they overlap a little but never pile up. */
function layout(count: number) {
  const rand = seeded(42);
  const cols = Math.max(2, Math.ceil(Math.sqrt(count * 1.2)));
  const rows = Math.max(1, Math.ceil(count / cols));
  return Array.from({ length: count }, (_, i) => {
    const c = i % cols;
    const r = Math.floor(i / cols);
    return {
      left: Math.min(86, Math.max(14, ((c + 0.5) / cols) * 100 + between(rand, -7, 7))),
      top: Math.min(88, Math.max(12, ((r + 0.5) / rows) * 100 + between(rand, -6, 6))),
      rotate: between(rand, -14, 14),
    };
  });
}

export default function CollageScreen({ photos, onNext }: { photos: string[]; onNext: () => void }) {
  const [selected, setSelected] = useState<number | null>(null);
  const spots = useMemo(() => layout(photos.length), [photos.length]);

  return (
    <Screen className="max-w-none bg-wine-deep/60">
      <ScriptTitle>Our little moments</ScriptTitle>
      <p className="mt-2 text-sm text-cream/60 italic">chạm vào một tấm ảnh để xem rõ hơn</p>

      <div className="relative mt-8 h-[70dvh] w-full max-w-[900px]">
        {photos.length === 0 && (
          <p className="absolute inset-0 grid place-items-center text-cream/60 italic">(public/content/collage/)</p>
        )}
        {photos.map((src, i) =>
          selected === i ? null : (
            <div
              key={src}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${spots[i].left}%`, top: `${spots[i].top}%`, zIndex: i }}
            >
              <motion.button
                type="button"
                layoutId={`collage-${src}`}
                onClick={() => setSelected(i)}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1, rotate: spots[i].rotate }}
                transition={{ delay: 0.1 + i * 0.08, type: "spring", stiffness: 140, damping: 16 }}
                whileHover={{ scale: 1.06, zIndex: 50 }}
                className="block w-[30vw] max-w-44 bg-paper p-1.5 pb-5 shadow-xl shadow-black/60"
                aria-label={`Xem ảnh ${i + 1}`}
              >
                <Photo src={src} className="aspect-[4/5] w-full" />
              </motion.button>
            </div>
          ),
        )}
      </div>

      <NextButton onClick={onNext} className="mt-14" />

      <AnimatePresence>
        {selected !== null && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            className="fixed inset-0 z-[60] grid place-items-center bg-black/75 p-6"
          >
            <motion.button
              type="button"
              layoutId={`collage-${photos[selected]}`}
              className="block w-[min(88vw,520px)] bg-paper p-3 pb-10 shadow-2xl"
              aria-label="Đóng ảnh"
            >
              <Photo src={photos[selected]} className="aspect-[4/5] w-full" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </Screen>
  );
}
