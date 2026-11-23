"use client";

import { AnimatePresence, motion } from "motion/react";
import { Photo } from "./Photo";

/**
 * Full-screen background photo behind every screen, crossfading when it changes.
 * No src → renders nothing and the body's CSS background shows through.
 */
export function Backdrop({ src }: { src?: string }) {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
      <AnimatePresence>
        {src && (
          <motion.div
            key={src}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Photo src={src} className="size-full" />
            <div className="absolute inset-0 bg-black/35" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
