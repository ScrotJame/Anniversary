import { test } from "node:test";
import assert from "node:assert/strict";
import {
  decryptBytes,
  encryptBytes,
  importKey,
  isSealed,
  lockFor,
  normalizePassword,
  unlockTime,
  unwrapKey,
  wrapKey,
} from "../src/lib/seal.ts";

const UNLOCK = "2026-12-02T00:00:00+07:00";

test("unlockTime parses an ISO date-time with offset, rejects missing or invalid values", () => {
  assert.equal(unlockTime(UNLOCK), Date.UTC(2026, 11, 1, 17, 0, 0));
  assert.equal(unlockTime(null), null);
  assert.equal(unlockTime(undefined), null);
  assert.equal(unlockTime(""), null);
  assert.equal(unlockTime("not a date"), null);
});

test("isSealed is true only strictly before unlockAt", () => {
  const t = Date.UTC(2026, 11, 1, 17, 0, 0);
  assert.equal(isSealed(UNLOCK, t - 1), true);
  assert.equal(isSealed(UNLOCK, t), false);
  assert.equal(isSealed(UNLOCK, t + 1), false);
  assert.equal(isSealed(null, t - 1), false);
});

test("encryptBytes/decryptBytes round-trip, with a fresh IV each time", async () => {
  const key = await importKey(crypto.getRandomValues(new Uint8Array(32)));
  const data = new TextEncoder().encode("thư tay ♡");
  const a = await encryptBytes(key, data);
  const b = await encryptBytes(key, data);
  assert.notDeepEqual(a, b);
  assert.deepEqual(await decryptBytes(key, a), data);
});

test("decryptBytes rejects a wrong key or tampered data", async () => {
  const key = await importKey(crypto.getRandomValues(new Uint8Array(32)));
  const other = await importKey(crypto.getRandomValues(new Uint8Array(32)));
  const sealed = await encryptBytes(key, new Uint8Array([1, 2, 3]));
  await assert.rejects(decryptBytes(other, sealed));
  const tampered = sealed.slice();
  tampered[tampered.length - 1] ^= 1;
  await assert.rejects(decryptBytes(key, tampered));
});

test("lockFor combines the date lock and the password", () => {
  const t = Date.UTC(2026, 11, 1, 17, 0, 0);
  assert.deepEqual(lockFor(UNLOCK, true, t - 1), { unlockAt: UNLOCK, password: true });
  assert.deepEqual(lockFor(UNLOCK, false, t - 1), { unlockAt: UNLOCK, password: false });
  assert.deepEqual(lockFor(UNLOCK, true, t), { unlockAt: null, password: true }); // date passed: password only
  assert.equal(lockFor(UNLOCK, false, t), null); // nothing left to lock
  assert.equal(lockFor(null, false, t), null);
});

test("normalizePassword ignores spaces, case and Unicode composition", () => {
  assert.equal(normalizePassword("  Anh Yêu Em "), "anh yêu em");
  assert.equal(normalizePassword("Yêu"), normalizePassword("Yêu")); // decomposed vs composed ê
});

test("wrapKey/unwrapKey: the right password (loosely typed) opens it, anything else is rejected", async () => {
  const raw = crypto.getRandomValues(new Uint8Array(32));
  const wrapped = await wrapKey(raw, "Anh Yêu Em");
  assert.deepEqual(await unwrapKey(wrapped, "  anh yêu em"), raw);
  await assert.rejects(unwrapKey(wrapped, "anh yeu em"));
  await assert.rejects(unwrapKey(wrapped, ""));
});
