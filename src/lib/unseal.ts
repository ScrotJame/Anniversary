import type { Content, Lock } from "./types";
import {
  BUNDLE_FILE,
  KEY_FILE,
  PHOTO_FOLDERS,
  SEALED_DIR,
  TLOCK_KEY_FILE,
  decryptBytes,
  importKey,
  unwrapKey,
  type SealedBundle,
} from "./seal";

/** drand has not published the unlock round yet (the device clock is ahead, or it's a few seconds early). */
export class TooEarlyError extends Error {}
/** Anything but the right password. */
export class WrongPasswordError extends Error {}

async function fetchBytes(url: string): Promise<Uint8Array> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  return new Uint8Array(await res.arrayBuffer());
}

/** The key file with the date lock removed; kept after the first success so password retries skip drand. */
let outerKey: Promise<Uint8Array> | null = null;

async function fetchOuterKey(dir: string, lock: Lock): Promise<Uint8Array> {
  if (!lock.unlockAt) return fetchBytes(`${dir}/${KEY_FILE}`);
  const res = await fetch(`${dir}/${TLOCK_KEY_FILE}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`${TLOCK_KEY_FILE}: HTTP ${res.status}`);
  const armored = await res.text();
  const { timelockDecrypt, mainnetClient } = await import("tlock-js");
  try {
    return new Uint8Array(await timelockDecrypt(armored, mainnetClient()));
  } catch (err) {
    if (/too early/i.test((err as Error).message)) throw new TooEarlyError();
    throw err;
  }
}

/**
 * Browser side of seal.ts: lifts the date lock (drand beacon), then the password, then decrypts
 * the letters and photos (photos become blob: URLs).
 */
export async function unseal(
  base: string,
  lock: Lock,
  password?: string,
): Promise<Pick<Content, "letters" | "photos">> {
  const dir = `${base}/${SEALED_DIR}`;
  outerKey ??= fetchOuterKey(dir, lock);
  let outer: Uint8Array;
  try {
    outer = await outerKey;
  } catch (err) {
    outerKey = null;
    throw err;
  }

  let raw = outer;
  if (lock.password) {
    try {
      raw = await unwrapKey(outer, password ?? "");
    } catch {
      throw new WrongPasswordError();
    }
  }
  const key = await importKey(raw);

  const bundle = JSON.parse(
    new TextDecoder().decode(await decryptBytes(key, await fetchBytes(`${dir}/${BUNDLE_FILE}`))),
  ) as SealedBundle;

  const photos = {} as Content["photos"];
  await Promise.all(
    PHOTO_FOLDERS.map(async (folder) => {
      photos[folder] = await Promise.all(
        bundle.photos[folder].map(async ({ file, type }) => {
          const bytes = await decryptBytes(key, await fetchBytes(`${dir}/${file}`));
          return URL.createObjectURL(new Blob([bytes as BlobPart], { type }));
        }),
      );
    }),
  );
  return { letters: bundle.letters, photos };
}
