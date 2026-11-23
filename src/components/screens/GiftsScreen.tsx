"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { GiftId } from "@/lib/types";
import { Bouquet, GiftLetter, Teddy } from "@/components/decor/Illustrations";
import { FloatingHearts } from "@/components/decor/Ambient";
import { Photo } from "@/components/decor/Photo";

const SHOP_SRC = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/inside_shop_bg.svg`;
/** public/inside_shop_bg.svg is 1672 × 941. */
const SHOP_ASPECT = 1672 / 941;

type ShelfGift = {
  id: GiftId;
  label: string;
  Icon: (p: { className?: string }) => React.ReactNode;
  /** Horizontal centre, % of the picture's width. */
  x: number;
  /** Top of the shelf the gift stands on, % of the picture's height. */
  shelf: number;
  /** Gift height, % of the picture's height. */
  height: number;
  /** Artwork width / height. */
  aspect: number;
  /** Empty space under the artwork inside its box, as a fraction of the box height. */
  foot?: number;
  tilt?: number;
};

/**
 * Spots on the middle bookcase of inside_shop_bg.svg (its empty centre column), measured on the
 * picture itself. That column is also what stays on screen when a phone crops the picture.
 */
const GIFTS: ShelfGift[] = [
  { id: "bear", label: "Gấu bông", Icon: Teddy, x: 47.4, shelf: 50.2, height: 14.5, aspect: 1, foot: 0.03 },
  { id: "flowers", label: "Bó hoa", Icon: Bouquet, x: 55.6, shelf: 50.2, height: 15.5, aspect: 0.8 },
  { id: "letter", label: "Thư tay", Icon: GiftLetter, x: 50.6, shelf: 69.2, height: 9.5, aspect: 100 / 72, tilt: -4 },
];

export default function GiftsScreen({
  opened,
  onOpenGift,
  onFinale,
}: {
  opened: ReadonlySet<GiftId>;
  onOpenGift: (gift: GiftId) => void;
  onFinale: () => void;
}) {
  const reduce = useReducedMotion();
  const allOpened = GIFTS.every((g) => opened.has(g.id));

  return (
    // Own full-screen layer (no Screen wrapper): Screen's slide transform would re-anchor `fixed`.
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed inset-0 overflow-hidden bg-wine-deep"
      style={{ containerType: "size" }}
    >
      {/* The picture always covers the screen (like object-cover) and gifts are placed in its
          coordinates, so they stay on their shelves at any screen size. */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: `max(100cqw, ${SHOP_ASPECT * 100}cqh)`,
          aspectRatio: `${SHOP_ASPECT}`,
          containerType: "size",
        }}
      >
        <Photo src={SHOP_SRC} className="absolute inset-0 size-full" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgb(0_0_0/0.35))]" />

        {GIFTS.map(({ id, label, Icon, x, shelf, height, aspect, foot = 0, tilt = 0 }, i) => {
          const isOpened = opened.has(id);
          return (
            <motion.button
              key={id}
              type="button"
              onClick={() => onOpenGift(id)}
              aria-label={isOpened ? `${label} (đã mở)` : label}
              className="group absolute origin-bottom focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cream"
              style={{
                left: `${x}%`,
                bottom: `${100 - shelf}%`,
                height: `${height}cqh`,
                width: `${height * aspect}cqh`,
                marginLeft: `${(-height * aspect) / 2}cqh`,
                marginBottom: `${-foot * height}cqh`,
              }}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: "-40%" }}
              animate={{ opacity: 1, y: 0, rotate: tilt }}
              transition={{ delay: 0.4 + i * 0.18, type: "spring", stiffness: 260, damping: 16 }}
              whileHover={reduce ? undefined : { rotate: [tilt, tilt - 6, tilt + 6, tilt - 3, tilt], transition: { duration: 0.6 } }}
              whileTap={{ scale: 0.92 }}
            >
              <span
                className={`block size-full transition ${isOpened ? "opacity-60 saturate-50" : "animate-glow"}`}
              >
                <Icon className="size-full drop-shadow-[0_0.6cqh_0.6cqh_rgb(0_0_0/0.45)]" />
              </span>
              {/* price-tag label hanging from the shelf edge */}
              <span
                className="absolute top-full left-1/2 -translate-x-1/2 rounded-full bg-wine-deep/85 px-[1.1cqh] py-[0.25cqh] font-serif text-[1.7cqh] whitespace-nowrap text-cream shadow-md shadow-black/30"
                style={{ marginTop: `${0.9 - foot * height}cqh`, rotate: `${-tilt}deg` }}
              >
                {isOpened ? "✓ " : ""}
                {label}
              </span>
            </motion.button>
          );
        })}
      </div>

      {allOpened && <FloatingHearts count={14} />}

      <h1 className="pointer-events-none absolute inset-x-0 top-4 text-center font-script text-3xl text-cream drop-shadow-[0_2px_8px_rgb(0_0_0/0.7)] sm:top-6 sm:text-4xl">
        Gifts for you
      </h1>

      <div className="absolute inset-x-0 bottom-20 flex flex-col items-center gap-4 px-4 sm:bottom-10">
        <p className="rounded-full bg-black/45 px-4 py-1.5 text-center text-sm text-cream italic backdrop-blur-sm">
          {allOpened ? "Còn một món quà cuối cùng nữa…" : `Chạm vào từng món quà trên kệ nhé ♡ · ${opened.size}/3`}
        </p>
        <AnimatePresence>
          {allOpened && (
            <motion.button
              type="button"
              onClick={onFinale}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", delay: 0.3 }}
              className="btn-solid"
            >
              Mở món quà cuối 💝
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}
