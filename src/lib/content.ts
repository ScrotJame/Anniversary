import fs from "node:fs";
import path from "node:path";
import type { Content, Settings, Song } from "./types";

/**
 * Reads everything under public/content/ at build time (and on every request in dev).
 * Add or remove files there — no code changes needed.
 */

const CONTENT_DIR = path.join(process.cwd(), "public", "content");
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".svg"]);
const AUDIO_EXT = new Set([".mp3", ".m4a", ".ogg", ".wav"]);

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });

const DEFAULT_SETTINGS: Settings = {
  names: ["Anh", "Em"],
  startDate: null,
  envelopeTitle: "Happy Anniversary, Love!",
  finaleTitle: "HAPPY ANNIVERSARY",
  cardText: "Kỉ niệm 1 năm của chúng ta",
};

function warn(message: string) {
  console.warn(`[content] ${message}`);
}

function listFiles(folder: string, exts: Set<string>): string[] {
  const dir = path.join(CONTENT_DIR, folder);
  if (!fs.existsSync(dir)) {
    warn(`missing folder public/content/${folder}/`);
    return [];
  }
  const files = fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isFile() && !d.name.startsWith("."))
    .map((d) => d.name)
    .filter((name) => exts.has(path.extname(name).toLowerCase()))
    .sort(collator.compare);
  if (files.length === 0) warn(`public/content/${folder}/ has no usable files`);
  return files;
}

function toUrl(folder: string, name: string): string {
  return `${BASE}/content/${folder}/${encodeURIComponent(name)}`;
}

function images(folder: string): string[] {
  return listFiles(folder, IMAGE_EXT).map((name) => toUrl(folder, name));
}

/** "01 - Perfect - Ed Sheeran.mp3" → { title: "Perfect", artist: "Ed Sheeran" } */
export function parseSongName(fileName: string): Omit<Song, "src"> {
  const base = fileName.slice(0, fileName.length - path.extname(fileName).length);
  const withoutOrder = base.replace(/^\d+\s*[-_.)]?\s*/, "").trim() || base;
  const [title, ...rest] = withoutOrder.split(" - ").map((s) => s.trim());
  const artist = rest.join(" - ");
  return artist ? { title, artist } : { title };
}

function songs(): Song[] {
  return listFiles("music", AUDIO_EXT).map((name) => ({
    src: toUrl("music", name),
    ...parseSongName(name),
  }));
}

function letter(name: string): string[] {
  const file = path.join(CONTENT_DIR, "letters", `${name}.txt`);
  if (!fs.existsSync(file)) {
    warn(`missing letter public/content/letters/${name}.txt`);
    return [];
  }
  return fs
    .readFileSync(file, "utf8")
    .split(/\r?\n\s*\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function settings(): Settings {
  const file = path.join(CONTENT_DIR, "settings.json");
  if (!fs.existsSync(file)) {
    warn("missing public/content/settings.json, using defaults");
    return DEFAULT_SETTINGS;
  }
  try {
    const raw = JSON.parse(fs.readFileSync(file, "utf8")) as Partial<Settings>;
    return { ...DEFAULT_SETTINGS, ...raw };
  } catch (err) {
    warn(`settings.json is not valid JSON (${(err as Error).message}), using defaults`);
    return DEFAULT_SETTINGS;
  }
}

export function loadContent(): Content {
  return {
    settings: settings(),
    songs: songs(),
    photos: {
      polaroid: images("polaroid"),
      memories: images("memories"),
      collage: images("collage"),
      finale: images("finale"),
    },
    letters: {
      polaroid: letter("polaroid"),
      memories: letter("memories"),
      flowers: letter("flowers"),
    },
  };
}
