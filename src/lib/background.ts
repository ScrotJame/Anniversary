import path from "node:path";

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });

/** "background.jpeg", "Background.PNG" → true. The extension is checked by the caller. */
export function isBackground(fileName: string): boolean {
  const { name, ext } = path.parse(fileName);
  return ext !== "" && name.toLowerCase() === "background";
}

/** The background image among a folder's (already extension-filtered) file names, if any. */
export function pickBackground(fileNames: string[]): string | undefined {
  return fileNames.filter(isBackground).sort(collator.compare)[0];
}
