"use client";

import { motion } from "motion/react";
import type { Settings } from "@/lib/types";
import { Photo } from "@/components/decor/Photo";
import { FloatingHearts } from "@/components/decor/Ambient";

function daysSince(iso: string | null): number | null {
  if (!iso) return null;
  const start = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(start.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((today.getTime() - start.getTime()) / 86_400_000));
}

export default function FinaleScreen({
  photo,
  settings,
  onRestart,
}: {
  photo: string | undefined;
  settings: Settings;
  onRestart: () => void;
}) {
  // Only ever rendered on the client after user interaction, so reading "today" here is safe.
  const days = daysSince(settings.startDate);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="fixed inset-0 overflow-hidden bg-black"
    >
      {photo && (
        <motion.div
          initial={{ scale: 1.12 }}
          animate={{ scale: 1 }}
          transition={{ duration: 8, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <Photo src={photo} className="size-full" />
        </motion.div>
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/80" />
      <FloatingHearts count={16} seed={21} />

      <div className="relative flex h-full flex-col items-center justify-end px-4 pb-28 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 30, letterSpacing: "0.6em" }}
          animate={{ opacity: 1, y: 0, letterSpacing: "0.18em" }}
          transition={{ delay: 0.8, duration: 1.6, ease: "easeOut" }}
          className="font-serif text-3xl text-cream drop-shadow-[0_4px_16px_rgb(0_0_0/0.6)] sm:text-6xl"
        >
          {settings.finaleTitle}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2, duration: 1 }}
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
          transition={{ delay: 3.2 }}
          className="btn mt-8"
        >
          ↺ Xem lại từ đầu
        </motion.button>
      </div>
    </motion.section>
  );
}
