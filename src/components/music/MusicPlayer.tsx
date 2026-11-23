"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Vinyl } from "@/components/decor/Illustrations";
import { useMusic } from "./MusicProvider";

export default function MusicPlayer() {
  const { songs, current, playing, started, toggle, next, prev, volume, setVolume, muted, toggleMute } = useMusic();
  const [collapsed, setCollapsed] = useState(false);
  const [volumeOpen, setVolumeOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const silent = muted || volume === 0;

  // close the volume popover on a tap outside the player or on Escape
  useEffect(() => {
    if (!volumeOpen) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setVolumeOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setVolumeOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [volumeOpen]);

  if (!started || songs.length === 0 || !current) return null;

  return (
    <motion.div
      ref={rootRef}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.5 }}
      className="fixed right-4 bottom-4 z-50 flex items-center gap-2 rounded-full border border-cream/25 bg-wine-deep/85 p-1.5 pr-2 text-cream shadow-xl shadow-black/40 backdrop-blur-md"
    >
      <AnimatePresence>
        {volumeOpen && !collapsed && (
          <motion.div
            key="volume"
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 bottom-full mb-2 flex origin-bottom-right items-center gap-2 rounded-full border border-cream/25 bg-wine-deep py-1.5 pr-4 pl-1.5 shadow-xl shadow-black/40 backdrop-blur-md"
          >
            <IconButton label={silent ? "Bật tiếng" : "Tắt tiếng"} onClick={toggleMute}>
              <SpeakerIcon silent={silent} level={volume} />
            </IconButton>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={Math.round((muted ? 0 : volume) * 100)}
              onChange={(e) => setVolume(Number(e.target.value) / 100)}
              aria-label="Âm lượng"
              className="h-1.5 w-32 cursor-pointer accent-cream sm:w-40"
            />
            <span className="w-8 text-right text-xs text-cream/70 [font-variant-numeric:lining-nums_tabular-nums]" aria-hidden>
              {Math.round((muted ? 0 : volume) * 100)}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

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
            <IconButton
              label="Âm lượng"
              onClick={() => setVolumeOpen((o) => !o)}
              expanded={volumeOpen}
              active={volumeOpen}
            >
              <SpeakerIcon silent={silent} level={volume} />
            </IconButton>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/** Speaker with 0–2 sound waves, or crossed out when silent. */
function SpeakerIcon({ silent, level }: { silent: boolean; level: number }) {
  return (
    <>
      <path d="M3 9v6h4l5 5V4L7 9H3z" />
      {silent ? (
        <path d="M16.5 8.5 22 14m0-5.5L16.5 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
      ) : (
        <>
          <path d="M16.5 12A4.5 4.5 0 0 0 14 7.97v8.05A4.5 4.5 0 0 0 16.5 12z" />
          {level > 0.5 && <path d="M14 3.23v2.06a7 7 0 0 1 0 13.42v2.06A9 9 0 0 0 14 3.23z" />}
        </>
      )}
    </>
  );
}

function IconButton({
  label,
  onClick,
  big,
  active,
  expanded,
  children,
}: {
  label: string;
  onClick: () => void;
  big?: boolean;
  active?: boolean;
  expanded?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-expanded={expanded}
      className={`grid shrink-0 place-items-center rounded-full transition hover:bg-cream/15 active:scale-90 ${
        big ? "size-9 bg-cream text-wine hover:bg-paper" : "size-8"
      } ${active ? "bg-cream/20" : ""}`}
    >
      <svg viewBox="0 0 24 24" className="size-4.5" fill="currentColor" aria-hidden>
        {children}
      </svg>
    </button>
  );
}
