// Runs after `next build` (postbuild). For a locked build (see scripts/seal-content.mts), removes the
// plaintext letters and photos that Next copied from public/ into out/, then checks that no letter
// text and no private photo is left anywhere in out/. Fails the build if something leaked.
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "out");
const STATE_FILE = path.join(ROOT, "node_modules", ".cache", "sealed-build.json");

let state;
try {
  state = JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
} catch {
  state = { sealed: false };
}
if (!state.sealed) process.exit(0);

function fail(message) {
  console.error(`[strip-sealed] ${message}`);
  process.exit(1);
}

const keyFile = state.unlockAt ? "key.age" : "key.bin";
if (!fs.existsSync(path.join(OUT, "sealed", keyFile))) fail(`locked build but out/sealed/${keyFile} is missing`);

for (const rel of state.strip) fs.rmSync(path.join(OUT, rel), { recursive: true, force: true });

// Leak check: no remaining file may be a copy of a private photo or contain a line of a letter.
const photoSizes = new Set(
  state.strip
    .filter((rel) => !rel.startsWith("content/letters"))
    .map((rel) => fs.statSync(path.join(ROOT, "public", rel)).size),
);
const lettersDir = path.join(ROOT, "public", "content", "letters");
const snippets = fs.existsSync(lettersDir)
  ? fs
      .readdirSync(lettersDir)
      .flatMap((f) => fs.readFileSync(path.join(lettersDir, f), "utf8").split(/\r?\n/))
      .map((line) => line.trim().slice(0, 40))
      .filter((s) => s.length >= 20)
  : [];

const TEXT = new Set([".html", ".txt", ".js", ".json", ".css", ".svg", ".map"]);
function* walk(dir) {
  for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) yield* walk(p);
    else yield p;
  }
}
for (const file of walk(OUT)) {
  const rel = path.relative(OUT, file);
  if (rel.startsWith("sealed")) continue;
  if (TEXT.has(path.extname(file))) {
    const text = fs.readFileSync(file, "utf8");
    const hit = snippets.find((s) => text.includes(s) || text.includes(JSON.stringify(s).slice(1, -1)));
    if (hit) fail(`letter text found in out/${rel}: "${hit}…"`);
  } else if (photoSizes.has(fs.statSync(file).size) && !rel.startsWith("content/music")) {
    fail(`out/${rel} looks like a private photo (same size)`);
  }
}

console.log(`[strip-sealed] removed ${state.strip.length} plaintext path(s); no letter text or photos left in out/`);
