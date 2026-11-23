"use client";

import { useEffect, useRef, useState } from "react";
import { useAnimate, useReducedMotion } from "motion/react";
import { Heart } from "@/components/decor/Illustrations";
import { HeartBurst } from "@/components/decor/HeartBurst";

const RESUME_AFTER = 1000;
const RESET_AFTER = 2000; // ms without a tap before the tap count starts over

type Burst = { x: number; y: number; viewport: { width: number; height: number } };

/**
 * 2D stand-in when WebGL is unavailable: same rules as the 3D heart. Taps make it beat and pause,
 * nothing shows progress, slow taps start the count over, and the last tap bursts it into hearts.
 */
export default function HeartFallback({ hitsToBreak, onBroken }: { hitsToBreak: number; onBroken: () => void }) {
  const reduce = useReducedMotion() ?? false;
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const hits = useRef(0);
  const lastHit = useRef(0);
  const [paused, setPaused] = useState(false);
  const [burst, setBurst] = useState<Burst | null>(null);
  const resumeTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(resumeTimer.current), []);

  const hit = () => {
    if (burst) return;
    const now = performance.now();
    if (now - lastHit.current > RESET_AFTER) hits.current = 0;
    lastHit.current = now;
    hits.current += 1;
    window.clearTimeout(resumeTimer.current);
    if (hits.current >= hitsToBreak) {
      const r = scope.current.getBoundingClientRect();
      setBurst({
        x: r.left + r.width / 2,
        y: r.top + r.height / 2,
        viewport: { width: window.innerWidth, height: window.innerHeight },
      });
      onBroken();
      return;
    }
    setPaused(true);
    resumeTimer.current = window.setTimeout(() => setPaused(false), RESUME_AFTER);
    if (!reduce) animate(scope.current, { scale: [1, 1.07, 1] }, { duration: 0.18 });
  };

  return (
    <div
      className={`absolute inset-0 flex touch-manipulation items-center justify-center${burst ? " pointer-events-none" : ""}`}
      role="button"
      tabIndex={0}
      aria-label="Chạm để mở trái tim"
      onPointerDown={hit}
      onKeyDown={(e) => {
        if (e.key !== "Enter" && e.key !== " ") return;
        e.preventDefault();
        if (!e.repeat) hit();
      }}
    >
      {!burst && (
        <div ref={scope} className="size-56 [perspective:800px] sm:size-72">
          <div
            className="anim-spin-y size-full"
            style={{
              animationPlayState: paused ? "paused" : "running",
              filter: "drop-shadow(0 0 8px rgb(255 92 141 / 0.3))",
            }}
          >
            <Heart className="size-full" color="#d92648" />
          </div>
        </div>
      )}
      {burst && <HeartBurst {...burst} scale={2} count={64} />}
    </div>
  );
}
