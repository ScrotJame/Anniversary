"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  EnvelopeBack,
  EnvelopeFlapFront,
  EnvelopeFlapLining,
  EnvelopePocket,
  WaxSeal,
} from "@/components/decor/EnvelopeArt";
import { HeartBurst } from "@/components/decor/HeartBurst";
import { useMusic } from "@/components/music/MusicProvider";
import { Screen, ScriptTitle } from "./Screen";

const faceStyle = { backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" } as const;
const CARD_SRC = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/letter.svg`;

/** Timeline after the tap, in ms. */
const BURST_AT = 550; // flap is mostly open, letter is rising
const CARD_AT = 1600; // envelope gives way to the card
const LEAVE_AT = 4600; // card has been readable for ~2.5s → next screen (Screen fades out)

type Stage = "closed" | "opening" | "card";

export default function EnvelopeScreen({
  title,
  cardText,
  onOpened,
}: {
  title: string;
  cardText: string;
  onOpened: () => void;
}) {
  const { start } = useMusic();
  const reduce = useReducedMotion();
  const [stage, setStage] = useState<Stage>("closed");
  const [burst, setBurst] = useState<{
    x: number;
    y: number;
    scale: number;
    viewport: { width: number; height: number };
  } | null>(null);
  const envelopeRef = useRef<HTMLButtonElement>(null);
  const timers = useRef<number[]>([]);
  const left = useRef(false);
  const open = stage !== "closed";

  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  const leave = () => {
    if (left.current) return;
    left.current = true;
    onOpened();
  };

  const handleOpen = () => {
    if (open) return;
    setStage("opening");
    start(); // the tap is the user gesture browsers require before audio can play

    const rect = envelopeRef.current?.getBoundingClientRect();
    const at = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));
    if (rect && !reduce) {
      // hearts leave from just above the pocket, where the letter comes out
      const origin = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height * 0.3,
        scale: rect.width / 340, // bigger envelope → bigger hearts, higher launch
        viewport: { width: window.innerWidth, height: window.innerHeight },
      };
      at(BURST_AT, () => setBurst(origin));
    }
    at(CARD_AT, () => setStage("card"));
    at(LEAVE_AT, leave);
  };

  return (
    <Screen>
      <ScriptTitle className="mb-14 lg:text-6xl">{title}</ScriptTitle>

      <div className="relative grid place-items-center">
        <motion.div
          animate={stage === "card" ? { opacity: 0, scale: 0.9 } : { opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <button
            ref={envelopeRef}
            type="button"
            onClick={handleOpen}
            disabled={open}
            aria-label="Mở phong thư"
            className={`relative block aspect-[699.86/513.27] w-[min(86vw,360px)] sm:w-[min(460px,72vh)] lg:w-[min(540px,72vh)] [perspective:900px] ${open ? "" : "animate-breathe"}`}
          >
            {/* inside of the envelope */}
            <EnvelopeBack className="absolute inset-0 size-full drop-shadow-[0_18px_28px_rgb(0_0_0/0.5)]" />

            {/* letter */}
            <motion.div
              className="absolute inset-x-[7%] top-[6%] z-10 h-[86%] rounded-sm bg-paper shadow-md"
              animate={open ? { y: "-55%" } : { y: 0 }}
              transition={{ delay: 0.45, duration: 0.7, ease: "easeOut" }}
            />

            {/* front pocket */}
            <EnvelopePocket className="absolute inset-0 z-20 size-full" />

            {/* flap: outer face while closed, inner face once flipped open */}
            <motion.div
              className="absolute inset-x-0 top-0 h-[56.4%] origin-top"
              style={{ transformStyle: "preserve-3d", zIndex: 30 }}
              animate={open ? { rotateX: 180, zIndex: 5 } : { rotateX: 0, zIndex: 30 }}
              transition={{ rotateX: { duration: 0.5 }, zIndex: { delay: 0.25, duration: 0 } }}
            >
              <EnvelopeFlapFront className="absolute inset-0 size-full" style={faceStyle} />
              <EnvelopeFlapLining className="absolute inset-0 size-full [transform:rotateX(180deg)]" style={faceStyle} />
            </motion.div>

            {/* wax seal */}
            <motion.div
              className="absolute top-[56%] left-1/2 z-40 aspect-square w-[16%] -translate-x-1/2 -translate-y-1/2"
              animate={open ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
              transition={{ duration: 0.25 }}
            >
              <WaxSeal className="size-full" />
            </motion.div>
          </button>
        </motion.div>

        {/* anniversary card (tap to skip ahead) */}
        {stage === "card" && (
          <motion.button
            type="button"
            onClick={leave}
            aria-label={`${cardText} — chạm để tiếp tục`}
            className="@container absolute w-[min(92vw,400px)] sm:w-[min(520px,80vh)] lg:w-[min(620px,80vh)]"
            initial={{ opacity: 0, scale: 0.8, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- static export, see spec §2 */}
            <img src={CARD_SRC} alt="" className="block w-full drop-shadow-[0_16px_24px_rgb(0_0_0/0.45)]" />
            <motion.span
              className="absolute inset-x-[15%] inset-y-[27%] grid place-items-center rounded-xl bg-paper/95 px-3 text-center font-script text-[8.5cqw] leading-tight font-bold text-balance text-black"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              {cardText}
            </motion.span>
          </motion.button>
        )}
      </div>

      <p className="mt-10 font-serif text-sm text-cream/75 italic sm:text-base">
        {open ? "…" : "chạm vào phong thư để mở…"}
      </p>

      {burst && <HeartBurst x={burst.x} y={burst.y} scale={burst.scale} viewport={burst.viewport} />}
    </Screen>
  );
}
