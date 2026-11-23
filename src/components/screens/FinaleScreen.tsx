"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Settings } from "@/lib/types";
import HeartBreaker from "@/components/finale/HeartBreaker";
import LoveRain from "@/components/finale/LoveRain";

/** Seconds after the heart breaks before the text starts appearing. */
const TEXT_DELAY = 1.5;

function daysSince(iso: string | null): number | null {
  if (!iso) return null;
  const start = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(start.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((today.getTime() - start.getTime()) / 86_400_000));
}

export default function FinaleScreen({
  photos,
  settings,
  hasBackground,
  onRestart,
}: {
  /** finale/ photos (background.* excluded): they fall with the hearts. */
  photos: string[];
  settings: Settings;
  /** finale/background.* exists: the shared Backdrop shows it, so stay transparent. */
  hasBackground: boolean;
  onRestart: () => void;
}) {
  const [broken, setBroken] = useState(false);
  // Only ever rendered on the client after user interaction, so reading "today" here is safe.
  const days = daysSince(settings.startDate);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className={`fixed inset-0 overflow-hidden ${hasBackground ? "" : "bg-wine-deep"}`}
    >
      {broken && <LoveRain photos={photos} />}

      <HeartBreaker onBroken={() => setBroken(true)} />

      <AnimatePresence>
        {!broken && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
            transition={{ delay: 1, duration: 0.8 }}
            className="pointer-events-none absolute inset-x-0 bottom-24 px-4 text-center font-script text-2xl text-cream/90 drop-shadow-[0_2px_8px_rgb(0_0_0/0.5)]"
          >
            Chạm liên tục để mở trái tim 💗
          </motion.p>
        )}
      </AnimatePresence>

      {broken && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: TEXT_DELAY, duration: 1 }}
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/70"
          />
          <div className="pointer-events-none relative flex h-full flex-col items-center justify-end px-4 pb-28 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 30, letterSpacing: "0.6em" }}
              animate={{ opacity: 1, y: 0, letterSpacing: "0.18em" }}
              transition={{ delay: TEXT_DELAY, duration: 1.6, ease: "easeOut" }}
              className="font-serif text-3xl text-cream drop-shadow-[0_4px_16px_rgb(0_0_0/0.6)] sm:text-6xl"
            >
              {settings.finaleTitle}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: TEXT_DELAY + 1.1, duration: 1 }}
              className="mt-4 font-script text-2xl text-cream/90 sm:text-3xl"
            >
              {settings.names[0]} & {settings.names[1]}
              {days !== null && <> · {days.toLocaleString("vi-VN")} ngày bên nhau</>}
            </motion.p>
            <motion.button
              type="button"
              onClick={onRestart}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: TEXT_DELAY + 2 }}
              className="btn pointer-events-auto mt-8"
            >
              ↺ Xem lại từ đầu
            </motion.button>
          </div>
        </>
      )}
    </motion.section>
  );
}
