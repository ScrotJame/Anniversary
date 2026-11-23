"use client";

import { useEffect, useRef, useState } from "react";
import { useAnimate, useReducedMotion } from "motion/react";
import { Heart } from "@/components/decor/Illustrations";
import { HeartBurst } from "@/components/decor/HeartBurst";

const RESUME_AFTER = 1000;

type Burst = { x: number; y: number; viewport: { width: number; height: number } };

/** 2D stand-in when WebGL is unavailable: same tap-to-pause, tap-to-crack, tap-to-break rules. */
export default function HeartFallback({ hitsToBreak, onBroken }: { hitsToBreak: number; onBroken: () => void }) {
  const reduce = useReducedMotion() ?? false;
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const [hits, setHits] = useState(0);
  const [paused, setPaused] = useState(false);
  const [burst, setBurst] = useState<Burst | null>(null);
  const resumeTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(resumeTimer.current), []);

  const hit = () => {
    if (burst) return;
    const next = hits + 1;
    setHits(next);
    window.clearTimeout(resumeTimer.current);
    if (next >= hitsToBreak) {
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
    const scale = 1 + (next / hitsToBreak) * 0.08;
    animate(scope.current, reduce ? { scale } : { x: [0, -8, 8, -4, 0], scale }, { duration: 0.15 });
  };

  const crack = hits / hitsToBreak;
  return (
    <div className="absolute inset-0 flex touch-manipulation items-center justify-center" onPointerDown={hit}>
      {!burst && (
        <div ref={scope} className="size-56 [perspective:800px] sm:size-72">
          <div
            className="anim-spin-y size-full"
            style={{
              animationPlayState: paused ? "paused" : "running",
              filter: `drop-shadow(0 0 ${8 + crack * 30}px rgb(255 92 141 / ${0.3 + crack * 0.6}))`,
            }}
          >
            <Heart className="size-full" color="#d92648" />
          </div>
        </div>
      )}
      {burst && <HeartBurst {...burst} scale={2} />}
    </div>
  );
}
