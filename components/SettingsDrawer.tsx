"use client";

import { useSettings } from "@/lib/settings";

export default function SettingsDrawer() {
  const s = useSettings();
  if (!s.drawerOpen) return null;

  return (
    <div className="fixed right-4 top-4 z-50 w-96 max-w-[90vw] rounded-2xl border border-[var(--border)] bg-[var(--bg-panel)] shadow-2xl p-4 animate-pop">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-sm">Operator Panel</h2>
        <button
          onClick={() => s.update({ drawerOpen: false })}
          className="text-[var(--text-dim)] hover:text-white text-lg leading-none"
        >
          ×
        </button>
      </div>

      <div className="space-y-3 text-sm">
        <label className="flex items-center justify-between">
          <span>Demo speed</span>
          <div className="flex gap-1">
            {([1, 2] as const).map((v) => (
              <button
                key={v}
                onClick={() => s.update({ speed: v })}
                className={`rounded-lg px-3 py-1 border text-xs ${
                  s.speed === v
                    ? "border-[var(--accent)] bg-[var(--accent)]/20"
                    : "border-[var(--border)] hover:border-[var(--text-dim)]"
                }`}
              >
                {v}×
              </button>
            ))}
          </div>
        </label>

        <label className="flex items-center justify-between">
          <span>Presentation mode (projector)</span>
          <input
            type="checkbox"
            checked={s.presentation}
            onChange={(e) => s.update({ presentation: e.target.checked })}
            className="w-4 h-4 accent-[var(--accent)]"
          />
        </label>

        <label className="flex items-center justify-between">
          <span>Mute sounds</span>
          <input
            type="checkbox"
            checked={s.muted}
            onChange={(e) => s.update({ muted: e.target.checked })}
            className="w-4 h-4 accent-[var(--accent)]"
          />
        </label>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <span>System prompt override (this session)</span>
            {s.systemOverride && (
              <button
                onClick={() => s.update({ systemOverride: "" })}
                className="text-xs text-[var(--text-dim)] hover:text-white underline"
              >
                reset
              </button>
            )}
          </div>
          <textarea
            value={s.systemOverride}
            onChange={(e) => s.update({ systemOverride: e.target.value })}
            placeholder="Leave empty to use prompts/system.md"
            rows={6}
            className="w-full rounded-lg border border-[var(--border)] bg-black/30 p-2 font-mono text-[0.72rem] outline-none focus:border-[var(--accent)]"
          />
        </div>

        <p className="text-[0.68rem] text-[var(--text-dim)]">
          Toggle this panel with ⌘/Ctrl + Shift + S.
        </p>
      </div>
    </div>
  );
}
