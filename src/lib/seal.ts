/**
 * Locked content ("sealed" build), shared by the build script and the browser.
 *
 * Two independent locks, either or both:
 *  - date: settings.unlockAt in the future. Nothing opens before then.
 *  - password: env UNLOCK_PASS set at build time. The right password opens the letters; anything
 *    else leaves the visitor as a guest who can only listen to the music.
 *
 * The build ships no letters or photos in the clear: scripts/seal-content.mts encrypts them with a
 * random AES key into public/sealed/. That key is wrapped with a key derived from the password
 * (PBKDF2), and the result is time-lock encrypted with drand (tlock) to the round at unlockAt.
 * Nobody can read anything before drand publishes that round, so changing the device clock or
 * reading the page source reveals nothing; after that the password is still needed.
 *
 * Plain WebCrypto only (no Node APIs), so it runs in Node 24 and in the browser.
 */
import type { Content, Lock } from "./types";

/** public/sealed/ — served at `${BASE}/sealed/`. */
export const SEALED_DIR = "sealed";
/** The (password-wrapped) AES key, tlock-encrypted (age armor) — when date-locked. */
export const TLOCK_KEY_FILE = "key.age";
/** The password-wrapped AES key — when only password-locked. */
export const KEY_FILE = "key.bin";
/** AES-GCM encrypted JSON of {@link SealedBundle}. */
export const BUNDLE_FILE = "bundle.bin";

export type PhotoFolder = keyof Content["photos"];
export const PHOTO_FOLDERS: PhotoFolder[] = ["polaroid", "memories", "collage", "finale"];

export type SealedPhoto = { file: string; type: string };

export type SealedBundle = {
  letters: Content["letters"];
  photos: Record<PhotoFolder, SealedPhoto[]>;
};

/** Parses settings.unlockAt; null when missing or not a valid date. */
export function unlockTime(unlockAt: string | null | undefined): number | null {
  if (!unlockAt) return null;
  const t = Date.parse(unlockAt);
  return Number.isFinite(t) ? t : null;
}

/** True while the date lock applies. */
export function isSealed(unlockAt: string | null | undefined, now: number = Date.now()): boolean {
  const t = unlockTime(unlockAt);
  return t !== null && now < t;
}

/** The lock a build made now gets; null means a normal, unlocked build. */
export function lockFor(unlockAt: string | null | undefined, hasPassword: boolean, now: number = Date.now()): Lock | null {
  const dated = isSealed(unlockAt, now);
  if (!dated && !hasPassword) return null;
  return { unlockAt: dated ? unlockAt! : null, password: hasPassword };
}

const IV_BYTES = 12;
const SALT_BYTES = 16;
const PBKDF2_ITERATIONS = 600_000;

export function importKey(raw: Uint8Array): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", raw as BufferSource, "AES-GCM", false, ["encrypt", "decrypt"]);
}

/** AES-256-GCM. Output: 12-byte IV followed by ciphertext+tag. */
export async function encryptBytes(key: CryptoKey, data: Uint8Array): Promise<Uint8Array> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const sealed = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data as BufferSource));
  const out = new Uint8Array(IV_BYTES + sealed.length);
  out.set(iv);
  out.set(sealed, IV_BYTES);
  return out;
}

export async function decryptBytes(key: CryptoKey, data: Uint8Array): Promise<Uint8Array> {
  const iv = data.subarray(0, IV_BYTES);
  const body = data.subarray(IV_BYTES);
  return new Uint8Array(
    await crypto.subtle.decrypt({ name: "AES-GCM", iv: iv as BufferSource }, key, body as BufferSource),
  );
}

/** Forgiving on purpose: surrounding spaces, letter case and Unicode composition (phone keyboards) don't matter. */
export function normalizePassword(password: string): string {
  return password.normalize("NFC").trim().toLowerCase();
}

async function passwordKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const base = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(normalizePassword(password)),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", hash: "SHA-256", salt: salt as BufferSource, iterations: PBKDF2_ITERATIONS },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

/** Encrypts the raw content key with the password. Output: 16-byte salt + encryptBytes(…). */
export async function wrapKey(raw: Uint8Array, password: string): Promise<Uint8Array> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const sealed = await encryptBytes(await passwordKey(password, salt), raw);
  const out = new Uint8Array(SALT_BYTES + sealed.length);
  out.set(salt);
  out.set(sealed, SALT_BYTES);
  return out;
}

/** Inverse of {@link wrapKey}; rejects when the password is wrong. */
export async function unwrapKey(wrapped: Uint8Array, password: string): Promise<Uint8Array> {
  const salt = wrapped.subarray(0, SALT_BYTES);
  return decryptBytes(await passwordKey(password, salt), wrapped.subarray(SALT_BYTES));
}
