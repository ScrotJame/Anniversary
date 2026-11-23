"use client";

import { AnimatePresence, motion } from "motion/react";
import type { GiftId } from "@/lib/types";
import { Bouquet, GiftLetter, Teddy } from "@/components/decor/Illustrations";
import { FloatingHearts } from "@/components/decor/Ambient";
import { Screen, ScriptTitle } from "./Screen";

const GIFTS: { id: GiftId; label: string; Icon: (p: { className?: string }) => React.ReactNode }[] = [
  { id: "letter", label: "Thư tay", Icon: GiftLetter },
  { id: "bear", label: "Gấu bông", Icon: Teddy },
  { id: "flowers", label: "Bó hoa", Icon: Bouquet },
];

export default function GiftsScreen({
  opened,
  onOpenGift,
  onFinale,
}: {
  opened: ReadonlySet<GiftId>;
  onOpenGift: (gift: GiftId) => void;
  onFinale: () => void;
}) {
  const allOpened = GIFTS.every((g) => opened.has(g.id));

  return (
    <Screen>
      {allOpened && <FloatingHearts count={14} />}
      <ScriptTitle>Gifts for you</ScriptTitle>
      <p className="mt-3 text-center text-sm text-cream/70 italic">
        {allOpened ? "Còn một món quà cuối cùng nữa…" : `Chạm vào từng món quà nhé ♡ · ${opened.size}/3`}
      </p>

      <div className="mt-12 grid w-full max-w-2xl grid-cols-3 gap-3 sm:gap-8">
        {GIFTS.map(({ id, label, Icon }, i) => {
          const isOpened = opened.has(id);
          return (
            <motion.button
              key={id}
              type="button"
              onClick={() => onOpenGift(id)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.15 }}
              whileHover={{ rotate: [0, -6, 6, -3, 0], transition: { duration: 0.6 } }}
              whileTap={{ scale: 0.92 }}
              className="group relative flex flex-col items-center gap-3 rounded-2xl p-2 focus-visible:outline-2 focus-visible:outline-cream"
            >
              <span className={`relative transition ${isOpened ? "opacity-60 saturate-75" : ""}`}>
                <Icon className="size-24 drop-shadow-[0_8px_12px_rgb(0_0_0/0.35)] sm:size-32" />
              </span>
              <span className="font-serif text-sm text-cream sm:text-base">{label}</span>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {allOpened && (
          <motion.button
            type="button"
            onClick={onFinale}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", delay: 0.3 }}
            className="btn-solid mt-14"
          >
            Mở món quà cuối 💝
          </motion.button>
        )}
      </AnimatePresence>
    </Screen>
  );
}
