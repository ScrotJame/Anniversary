"use client";

import { useState } from "react";
import HeartScene from "./HeartScene";
import HeartFallback from "./HeartFallback";

/**
 * Tap surface for the Finale: a spinning heart that pauses on each tap, cracks a little more,
 * and breaks on tap number `hitsToBreak`. 3D when WebGL works, SVG otherwise.
 */
export default function HeartBreaker({ hitsToBreak = 10, onBroken }: { hitsToBreak?: number; onBroken: () => void }) {
  const [webgl, setWebgl] = useState(true);
  if (!webgl) return <HeartFallback hitsToBreak={hitsToBreak} onBroken={onBroken} />;
  return <HeartScene hitsToBreak={hitsToBreak} onBroken={onBroken} onUnsupported={() => setWebgl(false)} />;
}
