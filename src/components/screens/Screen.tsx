"use client";

import { motion, useReducedMotion } from "motion/react";

/** Shared wrapper: page transition + centered, phone-first layout. */
export function Screen({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  const offset = reduce ? 0 : 24;
  return (
    <motion.section
      initial={{ opacity: 0, y: offset }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -offset }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`relative mx-auto flex min-h-dvh w-full max-w-[960px] flex-col items-center justify-center px-4 py-20 ${className}`}
    >
      {children}
    </motion.section>
  );
}

export function ScriptTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <h1 className={`text-center font-script text-4xl text-cream drop-shadow-[0_2px_8px_rgb(0_0_0/0.35)] sm:text-5xl ${className}`}>
      {children}
    </h1>
  );
}

export function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="btn fixed top-4 left-4 z-40">
      <span aria-hidden>←</span> Quà
    </button>
  );
}

/** In-flow "Tiếp →" button placed at the bottom of a screen. z-40 keeps it above overlapping collage photos. */
export function NextButton({ onClick, className = "" }: { onClick: () => void; className?: string }) {
  return (
    <button type="button" onClick={onClick} className={`btn relative z-40 mt-10 ${className}`}>
      Tiếp <span aria-hidden>→</span>
    </button>
  );
}

export function Paragraphs({ items, className = "" }: { items: string[]; className?: string }) {
  if (items.length === 0) {
    return <p className={`italic opacity-60 ${className}`}>(Thêm nội dung thư vào public/content/letters/)</p>;
  }
  return (
    <div className={`space-y-4 ${className}`}>
      {items.map((p, i) => (
        <motion.p
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 + i * 0.25, duration: 0.6 }}
          className="whitespace-pre-line"
        >
          {p}
        </motion.p>
      ))}
    </div>
  );
}
