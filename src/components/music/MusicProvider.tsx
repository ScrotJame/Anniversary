"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Song } from "@/lib/types";

type MusicState = {
  songs: Song[];
  current: Song | null;
  playing: boolean;
  /** True once the envelope was opened — the player UI only shows after that. */
  started: boolean;
  start: () => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
};

const MusicContext = createContext<MusicState | null>(null);

export function useMusic(): MusicState {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error("useMusic must be used inside <MusicProvider>");
  return ctx;
}

export function MusicProvider({ songs, children }: { songs: Song[]; children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const wantPlay = useRef(false);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const count = songs.length;

  const play = useCallback(() => {
    wantPlay.current = true;
    audioRef.current?.play().catch(() => setPlaying(false));
  }, []);

  // When the track changes, keep playing if we were playing.
  useEffect(() => {
    if (wantPlay.current) audioRef.current?.play().catch(() => setPlaying(false));
  }, [index]);

  const step = useCallback(
    (delta: number) => {
      if (count === 0) return;
      if (count === 1) {
        if (audioRef.current) audioRef.current.currentTime = 0;
        if (wantPlay.current) play();
        return;
      }
      setIndex((i) => (i + delta + count) % count);
    },
    [count, play],
  );

  const value = useMemo<MusicState>(
    () => ({
      songs,
      current: songs[index] ?? null,
      playing,
      started,
      start: () => {
        setStarted(true);
        if (count > 0) play();
      },
      toggle: () => {
        const audio = audioRef.current;
        if (!audio) return;
        if (audio.paused) play();
        else {
          wantPlay.current = false;
          audio.pause();
        }
      },
      next: () => step(1),
      prev: () => step(-1),
    }),
    [songs, index, playing, started, count, play, step],
  );

  return (
    <MusicContext.Provider value={value}>
      {count > 0 && (
        <audio
          ref={audioRef}
          src={songs[index].src}
          preload="auto"
          loop={count === 1}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => step(1)}
        />
      )}
      {children}
    </MusicContext.Provider>
  );
}
