// Locks the letters and photos (see src/lib/seal.ts) while settings.unlockAt is in the future and/or
// env UNLOCK_PASS is set (GitHub secret in CI, .env.local on this machine — never in the repo).
// Runs after sync-private-content before `npm run dev` / `npm run build`; the date lock needs network (drand).
//
//   public/sealed/key.age     content key (password-wrapped if UNLOCK_PASS), tlock-encrypted to unlockAt
//   public/sealed/key.bin     …or, with no date lock left, just the password-wrapped key
//   public/sealed/bundle.bin  letters + photo list, AES-GCM
//   public/sealed/<hex>.bin   each photo, AES-GCM
//
// It also records which plaintext files the build must drop from out/ (scripts/strip-sealed.mjs).
// With neither lock, it removes public/sealed/ and the build is a normal one.
import fs from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import tlock from "tlock-js";
import { loadContent } from "../src/lib/content.ts";
import {
  BUNDLE_FILE,
  KEY_FILE,
  PHOTO_FOLDERS,
  SEALED_DIR,
  TLOCK_KEY_FILE,
  encryptBytes,
  importKey,
  lockFor,
  unlockTime,
  wrapKey,
  type SealedBundle,
} from "../src/lib/seal.ts";

const ROOT = process.cwd();
const PUBLIC = path.join(ROOT, "public");
const OUT_DIR = path.join(PUBLIC, SEALED_DIR);
const STATE_FILE = path.join(ROOT, "node_modules", ".cache", "sealed-build.json");

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
};

function writeState(state: object) {
  fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

/** "/content/polaroid/01%20a.jpg" → "content/polaroid/01 a.jpg" (relative to public/ and out/) */
const urlToRel = (url: string) => decodeURIComponent(url.replace(/^\//, ""));

fs.rmSync(OUT_DIR, { recursive: true, force: true });

const content = loadContent({ reveal: true });
const password = process.env.UNLOCK_PASS ?? "";
const lock = lockFor(content.settings.unlockAt, password !== "");

if (!lock) {
  writeState({ sealed: false });
  const { unlockAt } = content.settings;
  console.log(`[seal-content] not locked${unlockAt ? ` (unlockAt ${unlockAt} has passed)` : ""}, no UNLOCK_PASS`);
  process.exit(0);
}

const rawKey = new Uint8Array(randomBytes(32));
const key = await importKey(rawKey);
fs.mkdirSync(OUT_DIR, { recursive: true });

const strip: string[] = ["content/letters"];
const photos = {} as SealedBundle["photos"];
for (const folder of PHOTO_FOLDERS) {
  photos[folder] = [];
  for (const url of content.photos[folder]) {
    const rel = urlToRel(url);
    const file = `${randomBytes(12).toString("hex")}.bin`;
    const bytes = new Uint8Array(fs.readFileSync(path.join(PUBLIC, rel)));
    fs.writeFileSync(path.join(OUT_DIR, file), await encryptBytes(key, bytes));
    photos[folder].push({ file, type: MIME[path.extname(rel).toLowerCase()] ?? "application/octet-stream" });
    strip.push(rel);
  }
}

const bundle: SealedBundle = { letters: content.letters, photos };
fs.writeFileSync(
  path.join(OUT_DIR, BUNDLE_FILE),
  await encryptBytes(key, new TextEncoder().encode(JSON.stringify(bundle))),
);

const inner = lock.password ? await wrapKey(rawKey, password) : rawKey;
let round: number | null = null;
if (lock.unlockAt) {
  const client = tlock.mainnetClient();
  round = tlock.roundAt(unlockTime(lock.unlockAt)!, await client.chain().info());
  fs.writeFileSync(path.join(OUT_DIR, TLOCK_KEY_FILE), await tlock.timelockEncrypt(round, tlock.Buffer.from(inner), client));
} else {
  fs.writeFileSync(path.join(OUT_DIR, KEY_FILE), inner);
}

writeState({ sealed: true, ...lock, round, strip });
const count = PHOTO_FOLDERS.reduce((n, f) => n + photos[f].length, 0);
const how = [lock.unlockAt && `until ${lock.unlockAt} (drand round ${round})`, lock.password && "with password"];
console.log(`[seal-content] locked ${how.filter(Boolean).join(" + ")}: ${count} photo(s) + letters`);
