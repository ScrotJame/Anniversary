"use client";

import { useEffect } from "react";

/**
 * Deterrent only: blocks the usual DevTools / view-source shortcuts and the right-click menu.
 * Anyone determined can still open DevTools from the browser menu — the real protection is the
 * encryption in src/lib/seal.ts. Off in `npm run dev` so debugging stays easy.
 */
export default function DevtoolsGuard() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;

    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const mod = e.ctrlKey || e.metaKey;
      const blocked =
        e.key === "F12" ||
        // Ctrl+Shift+I/J/C (Windows/Linux), Cmd+Option+I/J/C (Mac)
        (mod && (e.shiftKey || e.altKey) && ["i", "j", "c"].includes(key)) ||
        // view source: Ctrl+U, Cmd+Option+U
        (mod && key === "u");
      if (blocked) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    const onContextMenu = (e: MouseEvent) => {
      // keep the menu in text fields (paste into the password box)
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      e.preventDefault();
    };

    window.addEventListener("keydown", onKeyDown, { capture: true });
    window.addEventListener("contextmenu", onContextMenu, { capture: true });
    return () => {
      window.removeEventListener("keydown", onKeyDown, { capture: true });
      window.removeEventListener("contextmenu", onContextMenu, { capture: true });
    };
  }, []);

  return null;
}
