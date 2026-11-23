"use client";

import { motion } from "motion/react";
import { Bouquet, Vinyl } from "@/components/decor/Illustrations";
import { FallingPetals } from "@/components/decor/Ambient";
import { useMusic } from "@/components/music/MusicProvider";
import { NextButton, Paragraphs, Screen } from "./Screen";

export default function FlowerLetterScreen({ letter, onNext }: { letter: string[]; onNext: () => void }) {
  const { playing } = useMusic();

  return (
    <Screen>
      <FallingPetals />

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-2xl pb-16"
      >
        <div className="gingham h-16 rounded-t-sm shadow-lg sm:h-20" />
        <article className="relative rounded-b-sm bg-paper px-6 pt-8 pb-24 text-[15px] leading-relaxed text-wine-deep shadow-2xl shadow-black/40 sm:px-12">
          <p className="mb-5 font-script text-3xl text-rose">Gửi em,</p>
          <Paragraphs items={letter} />
        </article>

        <motion.div
          initial={{ opacity: 0, x: -30, rotate: -20 }}
          animate={{ opacity: 1, x: 0, rotate: -12 }}
          transition={{ delay: 0.5, type: "spring" }}
          className="absolute bottom-0 -left-2 sm:-left-12"
        >
          <Bouquet className="size-32 drop-shadow-[0_10px_14px_rgb(0_0_0/0.4)] sm:size-44" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="absolute -right-2 bottom-2 sm:-right-10"
        >
          <Vinyl
            className={`size-28 animate-spin-slow drop-shadow-[0_10px_14px_rgb(0_0_0/0.45)] sm:size-36 ${
              playing ? "" : "[animation-play-state:paused]"
            }`}
          />
        </motion.div>
      </motion.div>

      <NextButton onClick={onNext} />
    </Screen>
  );
}
