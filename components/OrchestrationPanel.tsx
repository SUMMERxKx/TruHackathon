"use client";

import { useEffect, useRef, useState } from "react";
import type { ThinkEvent } from "@/lib/parser";
import { PERSONAS, personaFor, type PersonaKey } from "@/lib/personas";

// The vast distributed system behind one (1) API call.

interface NodeDef {
  id: string;
  label: string;
  x: number;
  y: number;
  persona?: PersonaKey;
  decorative?: boolean;
}

const NODES: NodeDef[] = [
  { id: "hub", label: "Orchestrator", x: 150, y: 110 },
  { id: "ticketbot", label: "TicketBot", x: 150, y: 30, persona: "ticketbot" },
  { id: "gary", label: "Gary", x: 40, y: 70, persona: "gary" },
  { id: "darlene", label: "Darlene", x: 260, y: 70, persona: "darlene" },
  { id: "todd", label: "Todd", x: 40, y: 160, persona: "todd" },
  { id: "priya", label: "Priya", x: 260, y: 160, persona: "priya" },
  { id: "kevin", label: "Kevin", x: 150, y: 195, persona: "kevin" },
  { id: "blame", label: "Blame Router", x: 40, y: 230, decorative: true },
  { id: "coversheet", label: "CoverSheet Validator", x: 150, y: 250, decorative: true },
  { id: "excuse", label: "Excuse Cache", x: 260, y: 230, decorative: true },
];

const SERVICES = [
  "request-ingestion",
  "blame-router",
  "synergy-orchestrator",
  "cover-sheet-validator",
  "escalation-mesh",
  "excuse-cache",
  "meeting-scheduler",
  "kevin-suppressor",
];

const NOISE = [
  '[k8s] pod synergy-orchestrator-7d4f restarted (OOMKilled)',
  '[kafka] rebalancing consumer group "blame" (attempt 847)',
  "[cache] excuse-cache hit ratio: 4% (excuses too fresh)",
  "[audit] cover-sheet-validator: 0 cover sheets found (as always)",
  "[mesh] escalation-mesh latency p99: 6 business days",
  "[gpu] borrowing GPU #3 back from Todd's screensaver",
  "[billing] converting tokens to SpesCoins at imaginary rate",
  "[hr] kevin-suppressor operating at full capacity",
];

interface Props {
  events: ThinkEvent[];
  phase: "idle" | "booting" | "thinking" | "answering" | "done";
}

export default function OrchestrationPanel({ events, phase }: Props) {
  const [log, setLog] = useState<string[]>([]);
  const seenCount = useRef(0);
  const seq = useRef(0);
  const logRef = useRef<HTMLDivElement>(null);
  const busy = phase === "booting" || phase === "thinking" || phase === "answering";

  const lastThought = [...events].reverse().find((e) => e.type === "thought");
  const activePersona = busy && lastThought ? personaFor(lastThought.persona).key : null;

  // Real parse events → bus log lines.
  useEffect(() => {
    if (events.length < seenCount.current) {
      // New turn
      seenCount.current = 0;
      setLog([]);
    }
    if (events.length > seenCount.current) {
      const fresh = events.slice(seenCount.current);
      seenCount.current = events.length;
      const lines = fresh.map((e) => {
        seq.current += 1;
        const latency = Math.floor(800 + Math.random() * 5200);
        return e.type === "thought"
          ? `[kafka] topic=committee.thought agent=${personaFor(e.persona).key} partition=3 offset=${seq.current} latency=${latency}ms`
          : `[bus] tool.invoke ${e.text.split("→")[0].trim()} → status=${e.text.includes("FAILED") ? "FAILED" : "USELESS"}`;
      });
      setLog((l) => [...l, ...lines].slice(-80));
    }
  }, [events]);

  // Ambient infrastructure noise while "working".
  useEffect(() => {
    if (!busy) return;
    const iv = window.setInterval(() => {
      setLog((l) =>
        [...l, NOISE[Math.floor(Math.random() * NOISE.length)]].slice(-80)
      );
    }, 2300);
    return () => window.clearInterval(iv);
  }, [busy]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [log]);

  return (
    <aside className="hidden lg:flex w-80 shrink-0 h-screen flex-col border-l border-[var(--border)] bg-[var(--bg-panel)]">
      <div className="px-4 py-2.5 border-b border-[var(--border)]">
        <h2 className="text-xs font-semibold uppercase tracking-wider">
          Orchestration <span className="text-[var(--text-dim)]">(live)</span>
        </h2>
        <p className="text-[0.62rem] text-[var(--text-dim)]">
          14 microservices · 1 actual API call
        </p>
      </div>

      {/* Agent graph */}
      <svg viewBox="0 0 300 275" className="w-full shrink-0 px-2 pt-2">
        {NODES.filter((n) => n.id !== "hub").map((n) => (
          <line
            key={`edge-${n.id}`}
            x1={150}
            y1={110}
            x2={n.x}
            y2={n.y}
            stroke={activePersona && n.persona === activePersona ? PERSONAS[activePersona].color : "var(--border)"}
            strokeWidth={activePersona && n.persona === activePersona ? 2 : 1}
            strokeDasharray="4 3"
          >
            {busy && (
              <animate attributeName="stroke-dashoffset" from="14" to="0" dur="1.2s" repeatCount="indefinite" />
            )}
          </line>
        ))}
        {NODES.map((n) => {
          const isActive = !!n.persona && n.persona === activePersona;
          const color = n.persona ? PERSONAS[n.persona].color : n.id === "hub" ? "#8b5cf6" : "#4b5563";
          return (
            <g key={n.id} style={{ transition: "opacity 0.3s" }} opacity={busy ? 1 : 0.55}>
              <circle
                cx={n.x}
                cy={n.y}
                r={isActive ? 13 : 9}
                fill={`${color}${isActive ? "66" : "22"}`}
                stroke={color}
                strokeWidth={isActive ? 2 : 1}
                className={n.decorative && busy ? "animate-blink" : ""}
                style={n.decorative ? { animationDelay: `${(n.x + n.y) % 900}ms` } : undefined}
              />
              <text
                x={n.x}
                y={n.y + (n.id === "hub" ? 24 : 21)}
                textAnchor="middle"
                fontSize="8.5"
                fill={isActive ? color : "var(--text-dim)"}
                fontWeight={isActive ? 700 : 400}
              >
                {n.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Service status lights */}
      <div className="px-4 py-2 border-y border-[var(--border)] grid grid-cols-2 gap-x-3 gap-y-1">
        {SERVICES.map((s, i) => (
          <div key={s} className="flex items-center gap-1.5 text-[0.6rem] font-mono text-[var(--text-dim)] truncate">
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                busy ? (i % 3 === 0 ? "bg-amber-400 animate-blink" : "bg-emerald-400") : "bg-emerald-700"
              }`}
              style={{ animationDelay: `${i * 170}ms` }}
            />
            {s}
          </div>
        ))}
      </div>

      {/* Event bus log */}
      <div ref={logRef} className="flex-1 overflow-y-auto px-3 py-2 font-mono text-[0.6rem] leading-relaxed text-[var(--text-dim)] space-y-0.5">
        {log.length === 0 ? (
          <div className="opacity-60">
            [status] All systems operational.
            <br />
            [status] Approvals: degraded since 2019.
          </div>
        ) : (
          log.map((l, i) => <div key={i}>{l}</div>)
        )}
      </div>
    </aside>
  );
}
