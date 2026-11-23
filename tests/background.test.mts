import { test } from "node:test";
import assert from "node:assert/strict";
import { isBackground, pickBackground } from "../src/lib/background.ts";

test("isBackground matches the file name 'background' with any extension, any case", () => {
  assert.equal(isBackground("background.jpeg"), true);
  assert.equal(isBackground("Background.JPG"), true);
  assert.equal(isBackground("BACKGROUND.png"), true);
});

test("isBackground rejects other names", () => {
  assert.equal(isBackground("01-anh.jpg"), false);
  assert.equal(isBackground("background-2.jpg"), false);
  assert.equal(isBackground("my-background.jpg"), false);
  assert.equal(isBackground("background"), false); // no extension: not an image file
});

test("pickBackground returns the first background in natural order", () => {
  assert.equal(pickBackground(["01-anh.jpg", "background.png", "Background.jpeg"]), "Background.jpeg");
});

test("pickBackground returns undefined when there is none", () => {
  assert.equal(pickBackground(["01-anh.jpg", "02-anh.jpg"]), undefined);
  assert.equal(pickBackground([]), undefined);
});
