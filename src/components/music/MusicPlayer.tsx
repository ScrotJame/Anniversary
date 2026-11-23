"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Vinyl } from "@/components/decor/Illustrations";
import { useMusic } from "./MusicProvider";

export default function MusicPlayer() {
  const { songs, current, playing, started, toggle, next, prev } = useMusic();
  const [collapsed, setCollapsed] = useState(false);

  if (!started || songs.length === 0 || !current) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.5 }}
      className="fixed right-4 bottom-4 z-50 flex items-center gap-2 rounded-full border border-cream/25 bg-wine-deep/85 p-1.5 pr-2 text-cream shadow-xl shadow-black/40 backdrop-blur-md"
    >
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        aria-label={collapsed ? "Mở trình phát nhạc" : "Thu gọn trình phát nhạc"}
        className="size-10 shrink-0 rounded-full"
      >
        <Vinyl className={`size-10 animate-spin-slow ${playing ? "" : "[animation-play-state:paused]"}`} />
      </button>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            key="controls"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "auto", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="flex items-center gap-1 overflow-hidden"
          >
            <div className="w-28 min-w-0 px-1 leading-tight sm:w-40">
              <p className="truncate text-sm" title={current.title}>
                {current.title}
              </p>
              {current.artist && <p className="truncate text-xs text-cream/60">{current.artist}</p>}
            </div>
            <IconButton label="Bài trước" onClick={prev}>
              <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
            </IconButton>
            <IconButton label={playing ? "Tạm dừng" : "Phát"} onClick={toggle} big>
              {playing ? <path d="M6 5h4v14H6zm8 0h4v14h-4z" /> : <path d="M8 5v14l11-7z" />}
            </IconButton>
            <IconButton label="Bài tiếp" onClick={next}>
              <path d="M16 6h2v12h-2zM6 18l8.5-6L6 6z" />
            </IconButton>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function IconButton({
  label,
  onClick,
  big,
  children,
}: {
  label: string;
  onClick: () => void;
  big?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`grid shrink-0 place-items-center rounded-full transition hover:bg-cream/15 active:scale-90 ${
        big ? "size-9 bg-cream text-wine hover:bg-paper" : "size-8"
      }`}
    >
      <svg viewBox="0 0 24 24" className="size-4.5" fill="currentColor" aria-hidden>
        {children}
      </svg>
    </button>
  );
}
