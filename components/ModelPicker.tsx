"use client";

import { useEffect, useRef, useState } from "react";

// Every option is, of course, the exact same model.
const MODELS = [
  { id: "slopgpt-5", label: "SlopGPT-5", note: "flagship (allegedly)" },
  { id: "slopgpt-0.5-mini-turbo-max", label: "SlopGPT-0.5-mini-turbo-max", note: "legacy" },
  { id: "slopgpt-4o-mg", label: "SlopGPT-4o-mg", note: "deprecated at launch" },
  { id: "slopgpt-committee", label: "SlopGPT Committee Edition", note: "6 egos, 1 GPU" },
  { id: "slopgpt-ultra", label: "SlopGPT Ultra", note: "Enterprise Only", locked: true },
];

export default function ModelPicker({ onUpsell }: { onUpsell: () => void }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(MODELS[0]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-[var(--bg-raised)] transition-colors"
      >
        {selected.label}
        <span className="text-[var(--text-dim)] text-xs">▾</span>
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 w-80 rounded-xl border border-[var(--border)] bg-[var(--bg-raised)] shadow-2xl p-1.5 z-50 animate-pop">
          {MODELS.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                if (m.locked) {
                  onUpsell();
                } else {
                  setSelected(m);
                }
                setOpen(false);
              }}
              className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-[var(--bg-panel)]"
            >
              <span>
                {m.label}
                <span className="block text-[0.68rem] text-[var(--text-dim)]">{m.note}</span>
              </span>
              {m.locked ? (
                <span className="text-xs">🔒</span>
              ) : selected.id === m.id ? (
                <span className="text-[var(--accent)]">✓</span>
              ) : null}
            </button>
          ))}
          <p className="px-3 py-1.5 text-[0.62rem] text-[var(--text-dim)] border-t border-[var(--border)] mt-1">
            All models route to the same committee. This is disclosed nowhere.
          </p>
        </div>
      )}
    </div>
  );
}
