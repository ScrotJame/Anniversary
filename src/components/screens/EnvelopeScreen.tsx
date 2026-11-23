"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { HEART_PATH } from "@/components/decor/Illustrations";
import { useMusic } from "@/components/music/MusicProvider";
import { Screen, ScriptTitle } from "./Screen";

export default function EnvelopeScreen({ title, onOpened }: { title: string; onOpened: () => void }) {
  const { start } = useMusic();
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    if (open) return;
    setOpen(true);
    start(); // the tap is the user gesture browsers require before audio can play
    window.setTimeout(onOpened, 1700);
  };

  return (
    <Screen>
      <ScriptTitle className="mb-14">{title}</ScriptTitle>

      <button
        type="button"
        onClick={handleOpen}
        aria-label="Mở phong thư"
        className={`relative aspect-[3/2] w-[min(82vw,340px)] [perspective:900px] ${open ? "" : "animate-breathe"}`}
      >
        {/* back */}
        <div className="absolute inset-0 rounded-md bg-[#8c1424] shadow-2xl shadow-black/50" />

        {/* letter */}
        <motion.div
          className="absolute inset-x-[7%] top-[6%] z-10 flex h-[86%] flex-col items-center justify-start rounded-sm bg-paper pt-4 shadow-md"
          animate={open ? { y: "-55%" } : { y: 0 }}
          transition={{ delay: 0.45, duration: 0.7, ease: "easeOut" }}
        >
          <span className="font-script text-2xl text-wine">For you ♡</span>
        </motion.div>

        {/* front pocket */}
        <div
          className="absolute inset-0 z-20 rounded-md bg-[#a51e30]"
          style={{ clipPath: "polygon(0 0, 50% 52%, 100% 0, 100% 100%, 0 100%)" }}
        />

        {/* flap */}
        <motion.div
          className="absolute inset-x-0 top-0 h-[58%] origin-top bg-[#b3243a]"
          style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)", zIndex: 30 }}
          animate={open ? { rotateX: 180, zIndex: 5 } : { rotateX: 0, zIndex: 30 }}
          transition={{ rotateX: { duration: 0.5 }, zIndex: { delay: 0.25, duration: 0 } }}
        />

        {/* wax seal */}
        <motion.div
          className="absolute top-[58%] left-1/2 z-40 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[#c9a227] shadow-md ring-2 ring-[#a8851c]"
          animate={open ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
          transition={{ duration: 0.25 }}
        >
          <svg viewBox="0 0 24 24" className="size-6" aria-hidden>
            <path d={HEART_PATH} fill="#7a5c0e" />
          </svg>
        </motion.div>
      </button>

      <p className="mt-10 font-serif text-sm text-cream/75 italic">
        {open ? "…" : "chạm vào phong thư để mở…"}
      </p>
    </Screen>
  );
}
