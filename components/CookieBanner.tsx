"use client";

import { useState } from "react";

export default function CookieBanner() {
  const [gone, setGone] = useState(false);
  if (gone) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-[55] border-t border-[var(--border)] bg-[var(--bg-raised)]/95 backdrop-blur px-4 py-3">
      <div className="max-w-3xl mx-auto flex flex-wrap items-center gap-3 justify-between">
        <p className="text-xs text-[var(--text-dim)]">
          🍪 We use cookies to track how often you sigh. Your options are listed below in full.
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setGone(true)}
            className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs hover:bg-[var(--bg-panel)]"
          >
            Accept All
          </button>
          <button
            onClick={() => setGone(true)}
            className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-500"
          >
            Accept All (Recommended)
          </button>
        </div>
      </div>
    </div>
  );
}
