export type Song = {
  src: string;
  title: string;
  artist?: string;
};

export type Settings = {
  names: [string, string];
  /** ISO date (YYYY-MM-DD) the relationship started; null hides the day counter. */
  startDate: string | null;
  envelopeTitle: string;
  finaleTitle: string;
  /** Text written on the card shown after the envelope opens. */
  cardText: string;
  /**
   * ISO date-time the envelope unlocks, e.g. "2026-12-02T00:00:00+07:00". Until then the site plays
   * music but the envelope stays shut, and letters/photos are shipped time-lock encrypted (see seal.ts).
   * If env UNLOCK_PASS is set at build time, a password is needed on top of that.
   * null or a past date: no lock.
   */
  unlockAt: string | null;
};

export type Content = {
  settings: Settings;
  songs: Song[];
  photos: {
    polaroid: string[];
    memories: string[];
    collage: string[];
    finale: string[];
  };
  /** Each letter is a list of paragraphs. */
  letters: {
    polaroid: string[];
    memories: string[];
    flowers: string[];
  };
  /** Optional full-screen background per screen: public/content/<screen>/background.* */
  backgrounds: Partial<Record<ScreenId, string>>;
  /** Locked build: photos and letters are empty here and live encrypted in public/sealed/ (see seal.ts). */
  lock: Lock | null;
};

/** How a locked build is locked. */
export type Lock = {
  /** Still date-locked until this ISO date-time; null when the build was made after it. */
  unlockAt: string | null;
  /** The content key is wrapped with a password (env UNLOCK_PASS at build time). */
  password: boolean;
};

export type ScreenId =
  | "envelope"
  | "gifts"
  | "polaroid"
  | "collage"
  | "memories"
  | "flowers"
  | "finale";

export type GiftId = "letter" | "bear" | "flowers";
