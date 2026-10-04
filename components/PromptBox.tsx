"use client";

import { useEffect, useRef, useState } from "react";
import { bonk, fanfare } from "@/lib/sounds";

const SEND_LABELS = ["Send", "Yeet", "Submit?", "Deploy to prod", "Beg"];

const REFUSALS = [
  "Nah. Try again in a bit.",
  "I'm on my break.",
  "Have you tried not asking?",
  "New phone, who dis.",
  "Request received. Ignoring it.",
  "Mercury is in retrograde for the backend.",
];

interface Props {
  busy: boolean;
  messagesSent: number;
  onAccepted: (text: string) => void;
  pushToast: (text: string, kind?: "refusal" | "ok") => void;
}

export default function PromptBox({
  busy,
  messagesSent,
  onAccepted,
  pushToast,
}: Props) {
  const [text, setText] = useState("");
  // Position override while dodging; null = home (docked at bottom center).
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [dodgesLeft, setDodgesLeft] = useState(3);
  const [gaveIn, setGaveIn] = useState(false);
  const attemptsRef = useRef(0);
  const refusalIdx = useRef(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Re-arm the hostility for every new message.
  useEffect(() => {
    setDodgesLeft(messagesSent === 0 ? 3 : 2);
    setGaveIn(false);
    setPos(null);
    attemptsRef.current = 0;
  }, [messagesSent]);

  const dodge = () => {
    if (busy || gaveIn || dodgesLeft <= 0) return;
    const el = boxRef.current;
    const w = el?.offsetWidth ?? 600;
    const h = el?.offsetHeight ?? 130;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const margin = 24;
    const minX = Math.max(margin, vw * 0.22); // stay clear of the sidebar
    const maxX = vw - w - margin;
    const minY = vh * 0.3;
    const maxY = vh - h - margin;
    const x = minX + Math.random() * Math.max(40, maxX - minX);
    const y = minY + Math.random() * Math.max(40, maxY - minY);
    setPos({ x, y });

    const left = dodgesLeft - 1;
    setDodgesLeft(left);
    if (left === 0) {
      // It sulks back home and gives up.
      window.setTimeout(() => {
        setPos(null);
        setGaveIn(true);
        textareaRef.current?.focus();
      }, 450);
    }
  };

  const trySubmit = () => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    attemptsRef.current += 1;
    const required = messagesSent === 0 ? 3 : 2;
    if (attemptsRef.current < required) {
      bonk();
      pushToast(REFUSALS[refusalIdx.current % REFUSALS.length], "refusal");
      refusalIdx.current += 1;
      return;
    }
    fanfare();
    pushToast("Ugh. Fine. Running your request.", "ok");
    setText("");
    attemptsRef.current = 0;
    onAccepted(trimmed);
  };

  const style: React.CSSProperties = pos
    ? {
        position: "fixed",
        left: pos.x,
        top: pos.y,
        transition: "left 0.35s cubic-bezier(.3,1.4,.5,1), top 0.35s cubic-bezier(.3,1.4,.5,1)",
        zIndex: 40,
      }
    : {
        position: "relative",
        transition: "left 0.35s ease, top 0.35s ease",
        zIndex: 40,
      };

  return (
    <div
      ref={boxRef}
      style={style}
      className="w-full max-w-[44rem] mx-auto"
      onPointerEnter={dodge}
    >
      {gaveIn && (
        <div className="absolute -top-6 left-3 text-xs text-[var(--text-dim)] italic animate-pop">
          fine.
        </div>
      )}
      <div
        className="rounded-2xl p-3 flex items-end gap-2 shadow-xl"
        style={{
          background: "linear-gradient(135deg, rgba(255,47,185,0.22), rgba(57,255,20,0.14), rgba(47,212,255,0.2))",
          border: "3px ridge #ff2fb9",
        }}
      >
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={(e) => {
            if (!gaveIn && dodgesLeft > 0) {
              e.currentTarget.blur();
              dodge();
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              trySubmit();
            }
          }}
          rows={1}
          placeholder={busy ? "The committee is deliberating…" : "Ask SlopGPT anything (it will not help)"}
          disabled={busy}
          className="flex-1 resize-none bg-transparent outline-none text-[0.95rem] placeholder:text-[var(--text-dim)] px-2 py-1.5 max-h-40"
        />
        <button
          onClick={trySubmit}
          disabled={busy || !text.trim()}
          className="win98-btn disabled:opacity-40 disabled:cursor-not-allowed text-sm font-bold px-4 py-2"
        >
          {busy ? "…" : SEND_LABELS[messagesSent % SEND_LABELS.length]}
        </button>
      </div>
      <p
        className="text-center text-[0.7rem] text-[var(--text-dim)] mt-2"
        style={{ fontFamily: "var(--font-papyrus)" }}
      >
        SlopGPT can make mistakes. It usually does.
      </p>
    </div>
  );
}
