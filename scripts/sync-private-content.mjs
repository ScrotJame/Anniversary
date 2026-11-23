// Copies photos from content-private/ (a clone of the private repo ScrotJame/Anniversary-content)
// into public/content/, so the real photos are served without ever being committed to this public repo.
// Runs automatically before `npm run dev` and `npm run build` (predev / prebuild).
//
// Files copied on the previous run are tracked in a manifest and removed first, so deleting a photo
// from content-private/ also removes it from the site. Nothing else in public/content/ is touched.
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "content-private");
const DEST = path.join(ROOT, "public", "content");
const MANIFEST = path.join(ROOT, "node_modules", ".cache", "private-content-sync.json");
const PHOTO_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);

function readManifest() {
  try {
    return JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
  } catch {
    return [];
  }
}

// 1. remove what the previous run copied
for (const rel of readManifest()) {
  fs.rmSync(path.join(DEST, rel), { force: true });
}

if (!fs.existsSync(SRC)) {
  fs.rmSync(MANIFEST, { force: true });
  console.log("[sync-private-content] no content-private/ folder, using the sample content");
  process.exit(0);
}

// 2. copy content-private/<folder>/<photo> -> public/content/<folder>/<photo>
const copied = [];
for (const folder of fs.readdirSync(SRC, { withFileTypes: true })) {
  if (!folder.isDirectory() || folder.name.startsWith(".")) continue;
  for (const file of fs.readdirSync(path.join(SRC, folder.name), { withFileTypes: true })) {
    if (!file.isFile() || !PHOTO_EXT.has(path.extname(file.name).toLowerCase())) continue;
    const rel = `${folder.name}/${file.name}`;
    fs.mkdirSync(path.join(DEST, folder.name), { recursive: true });
    fs.copyFileSync(path.join(SRC, folder.name, file.name), path.join(DEST, rel));
    copied.push(rel);
  }
}

fs.mkdirSync(path.dirname(MANIFEST), { recursive: true });
fs.writeFileSync(MANIFEST, JSON.stringify(copied, null, 2));
console.log(`[sync-private-content] copied ${copied.length} photo(s) from content-private/`);
