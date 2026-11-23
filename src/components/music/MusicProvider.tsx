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
  /** 0–1, remembered between visits. */
  volume: number;
  setVolume: (v: number) => void;
  muted: boolean;
  toggleMute: () => void;
};

const VOLUME_KEY = "anniversary:volume";
const DEFAULT_VOLUME = 0.7;

function savedVolume(): number {
  try {
    const v = Number(window.localStorage.getItem(VOLUME_KEY));
    return window.localStorage.getItem(VOLUME_KEY) !== null && v >= 0 && v <= 1 ? v : DEFAULT_VOLUME;
  } catch {
    return DEFAULT_VOLUME;
  }
}

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
  // The player only renders after the envelope is opened, so reading storage here can't cause a hydration mismatch.
  const [volume, setVolumeState] = useState(() => (typeof window === "undefined" ? DEFAULT_VOLUME : savedVolume()));
  const [muted, setMuted] = useState(false);
  const gainRef = useRef<GainNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const count = songs.length;
  const level = muted ? 0 : volume;
  const levelRef = useRef(level);

  /**
   * iOS Safari ignores audio.volume, so the sound goes through a Web Audio gain node instead.
   * Built on the first play (a user gesture, which AudioContext needs); falls back to audio.volume.
   */
  const ensureGain = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!gainRef.current) {
      try {
        const Ctx =
          window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!Ctx) return;
        const ctx = new Ctx();
        const gain = ctx.createGain();
        gain.gain.value = levelRef.current;
        ctx.createMediaElementSource(audio).connect(gain).connect(ctx.destination);
        audio.volume = 1;
        audioCtxRef.current = ctx;
        gainRef.current = gain;
      } catch {
        return;
      }
    }
    if (audioCtxRef.current?.state === "suspended") void audioCtxRef.current.resume();
  }, []);

  const play = useCallback(() => {
    wantPlay.current = true;
    ensureGain();
    audioRef.current?.play().catch(() => setPlaying(false));
  }, [ensureGain]);

  useEffect(() => {
    levelRef.current = level;
    if (gainRef.current) gainRef.current.gain.value = level;
    else if (audioRef.current) audioRef.current.volume = level;
  }, [level]);

  useEffect(() => () => void audioCtxRef.current?.close(), []);

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
      volume,
      setVolume: (v: number) => {
        const clamped = Math.min(1, Math.max(0, v));
        setVolumeState(clamped);
        setMuted(false);
        try {
          window.localStorage.setItem(VOLUME_KEY, String(clamped));
        } catch {
          // private mode / storage blocked: the volume just isn't remembered
        }
      },
      muted,
      toggleMute: () => setMuted((m) => !m),
    }),
    [songs, index, playing, started, count, play, step, volume, muted],
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
