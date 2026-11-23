"use client";

import { motion } from "motion/react";
import { Photo, Tape } from "@/components/decor/Photo";
import { BackButton, Paragraphs, Screen, ScriptTitle } from "./Screen";

export default function MemoriesScreen({
  photos,
  letter,
  onBack,
}: {
  photos: string[];
  letter: string[];
  onBack: () => void;
}) {
  return (
    <Screen>
      <BackButton onClick={onBack} />
      <ScriptTitle>Memories Made With You</ScriptTitle>

      <div className="mt-10 grid w-full gap-8 md:grid-cols-[auto_1fr] md:items-start">
        {/* photobooth strip */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="overflow-x-auto [scrollbar-width:none] md:overflow-visible"
        >
          <div className="relative mx-auto flex w-max gap-2 bg-[#1c0a0c] p-2 shadow-2xl shadow-black/50 md:-rotate-2 md:flex-col">
            <Tape className="-top-3 left-1/2 -translate-x-1/2 rotate-2" />
            {photos.length === 0 && (
              <div className="grid h-28 w-36 place-items-center text-xs text-cream/50 italic">(content/memories/)</div>
            )}
            {photos.map((src) => (
              <Photo key={src} src={src} className="aspect-[4/3] w-36 sm:w-40" />
            ))}
          </div>
        </motion.div>

        {/* letter on paper */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
          className="relative rounded-sm bg-paper px-6 py-8 text-[15px] leading-relaxed text-wine-deep shadow-2xl shadow-black/40 sm:px-10"
        >
          <span className="absolute -top-4 right-6 text-3xl" aria-hidden>
            💌
          </span>
          <Paragraphs items={letter} />
        </motion.article>
      </div>
    </Screen>
  );
}
