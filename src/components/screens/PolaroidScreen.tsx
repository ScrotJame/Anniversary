"use client";

import { motion } from "motion/react";
import { Polaroid } from "@/components/decor/Photo";
import { FloatingHearts } from "@/components/decor/Ambient";
import { Heart } from "@/components/decor/Illustrations";
import { BackButton, NextButton, Paragraphs, Screen, ScriptTitle } from "./Screen";

const TILTS = [-6, 4, -2, 7, -4, 3];

export default function PolaroidScreen({
  photos,
  letter,
  onNext,
  onBack,
}: {
  photos: string[];
  letter: string[];
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <Screen>
      <BackButton onClick={onBack} />
      <FloatingHearts count={10} seed={11} />

      <div className="relative w-full overflow-x-auto pt-6 pb-8 [scrollbar-width:none]">
        <div className="mx-auto flex w-max snap-x gap-5 px-4 sm:gap-8">
          {photos.length === 0 && (
            <div className="grid h-56 w-48 place-items-center bg-paper/10 text-sm text-cream/60 italic">
              (public/content/polaroid/)
            </div>
          )}
          {photos.map((src, i) => (
            <motion.div
              key={src}
              initial={{ opacity: 0, y: -60, rotate: 0 }}
              animate={{ opacity: 1, y: i % 2 ? 18 : 0, rotate: TILTS[i % TILTS.length] }}
              transition={{ delay: 0.2 + i * 0.2, type: "spring", stiffness: 120, damping: 14 }}
              className="w-44 shrink-0 snap-center sm:w-56"
            >
              <Polaroid src={src} />
            </motion.div>
          ))}
        </div>
        <Heart className="absolute top-2 right-[12%] size-10 rotate-12 text-[#e8485f] drop-shadow" />
        <Heart className="absolute bottom-6 left-[10%] size-7 -rotate-12 text-[#f5b8c0]" />
      </div>

      <ScriptTitle className="mt-4 text-3xl sm:text-4xl">Happy Monthsary, Love ♡</ScriptTitle>
      <Paragraphs items={letter} className="mt-6 max-w-xl text-center text-[15px] leading-relaxed text-cream/90" />

      <NextButton onClick={onNext} />
    </Screen>
  );
}
