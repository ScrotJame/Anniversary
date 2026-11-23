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
