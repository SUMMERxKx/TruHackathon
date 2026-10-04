"use client";

import { useEffect, useState } from "react";
import type { ThinkEvent } from "@/lib/parser";
import { personaFor } from "@/lib/personas";

function ToolChip({ text, speed }: { text: string; speed: number }) {
  const [running, setRunning] = useState(true);
  useEffect(() => {
    const t = window.setTimeout(() => setRunning(false), 1300 / speed);
    return () => window.clearTimeout(t);
  }, [speed]);

  return (
    <div className="animate-pop my-1.5 inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-black/30 px-3 py-1.5 font-mono text-[0.78rem] text-[var(--text-dim)]">
      {running ? (
        <>
          <span className="inline-block w-3 h-3 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin-slow" />
          <span>{text.split("→")[0].trim()} …</span>
        </>
      ) : (
        <>
          <span>🔧</span>
          <span>{text}</span>
        </>
      )}
    </div>
  );
}

function ThoughtLine({ event }: { event: Extract<ThinkEvent, { type: "thought" }> }) {
  const p = personaFor(event.persona);
  const isKevin = p.key === "kevin";
  return (
    <div className={`animate-pop flex gap-2.5 my-2 ${isKevin ? "opacity-80" : ""}`}>
      <div
        className="w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-sm border"
        style={{ borderColor: p.color, background: `${p.color}22` }}
      >
        {p.emoji}
      </div>
      <div className="min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-[0.82rem]" style={{ color: p.color }}>
            {p.name}
          </span>
          <span className="text-[0.68rem] text-[var(--text-dim)]">{p.title}</span>
        </div>
        <div className={`text-[0.88rem] leading-snug ${isKevin ? "italic" : ""}`}>
          {event.text}
        </div>
      </div>
    </div>
  );
}

function fmtBilled(seconds: number): string {
  const billed = Math.round(seconds * 225);
  const h = Math.floor(billed / 3600);
  const m = Math.round((billed % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

// A progress bar legally distinct from progress.
function LyingProgress({ speed }: { speed: number }) {
  const [pct, setPct] = useState(3);
  useEffect(() => {
    const iv = window.setInterval(() => {
      setPct((p) => {
        if (p >= 99) return 12; // so close
        const step = (p > 80 ? 7 : 2.3) * speed;
        return Math.min(99, p + step * (0.4 + Math.random()));
      });
    }, 450);
    return () => window.clearInterval(iv);
  }, [speed]);

  return (
    <div className="flex items-center gap-2 pt-2">
      <div className="flex-1 h-3 win98-bevel-in overflow-hidden">
        <div
          className="h-full progress-liar transition-[width] duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="font-mono text-[0.62rem] text-[var(--text-dim)] w-28 shrink-0">
        {Math.floor(pct)}% (non-binding)
      </span>
    </div>
  );
}

interface Props {
  bootLines: string[];
  events: ThinkEvent[];
  phase: "booting" | "thinking" | "answering" | "done";
  thinkSeconds: number;
  tokenCount: number;
  speed: number;
}

export default function ThinkingPanel({
  bootLines,
  events,
  phase,
  thinkSeconds,
  tokenCount,
  speed,
}: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const finished = phase === "answering" || phase === "done";

  useEffect(() => {
    if (finished) setCollapsed(true);
  }, [finished]);

  const agentCount = new Set(
    events.filter((e) => e.type === "thought").map((e) => e.persona)
  ).size;

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-panel)] overflow-hidden">
      <button
        onClick={() => finished && setCollapsed((c) => !c)}
        className={`w-full flex items-center gap-2 px-4 py-2.5 text-left text-[0.82rem] ${
          finished ? "hover:bg-[var(--bg-raised)] cursor-pointer" : "cursor-default"
        }`}
      >
        {!finished ? (
          <>
            <span className="inline-block w-3.5 h-3.5 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin-slow" />
            <span className="font-medium animate-blink">Thinking…</span>
            <span className="text-[var(--text-dim)]">
              · {Math.max(agentCount, 1)} agents · 2 committees · 1 intern
            </span>
            <span className="ml-auto font-mono text-[0.72rem] text-[var(--text-dim)]">
              {tokenCount.toLocaleString()} tok · ₷{(tokenCount * 0.00042).toFixed(4)} SpesCoins
            </span>
          </>
        ) : (
          <>
            <span>🧠</span>
            <span className="font-medium">
              Thought for {Math.round(thinkSeconds)}s{" "}
              <span className="text-[var(--text-dim)]">
                (billed as {fmtBilled(thinkSeconds)})
              </span>
            </span>
            <span className="ml-auto text-[var(--text-dim)]">
              {collapsed ? "▸ expand" : "▾ collapse"}
            </span>
          </>
        )}
      </button>

      {!collapsed && (
        <div className="px-4 pb-3 border-t border-[var(--border)]">
          {!finished && <LyingProgress speed={speed} />}
          {bootLines.length > 0 && (
            <div className="font-mono text-[0.72rem] text-[var(--text-dim)] pt-2 space-y-0.5">
              {bootLines.map((l, i) => (
                <div key={i} className="animate-pop">{l}</div>
              ))}
            </div>
          )}
          <div className="pt-1">
            {events.map((e, i) =>
              e.type === "thought" ? (
                <ThoughtLine key={i} event={e} />
              ) : (
                <div key={i}>
                  <ToolChip text={e.text} speed={speed} />
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
