"use client";

import { useState } from "react";

const STEPS = [
  {
    title: "Start a new chat?",
    body: "This will abandon the current committee mid-thought. They will discuss this at standup.",
    yes: "Yes, abandon them",
    no: "Never mind",
  },
  {
    title: "Are you sure you're sure?",
    body: "Studies show 94% of users who click Yes twice are simply guessing. Be honest.",
    yes: "Yes?? I guess",
    no: "You're right, cancel",
  },
];

interface Props {
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmChain({ onConfirm, onCancel }: Props) {
  const [step, setStep] = useState(0);
  const s = STEPS[step];

  return (
    <div className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center p-4">
      <div className="w-full max-w-sm win98-bevel animate-pop" style={{ fontFamily: "var(--font-sys98)" }}>
        <div className="win98-title px-2 py-1 text-xs flex justify-between items-center">
          <span>Confirmation Wizard — step {step + 1} of ???</span>
          <button onClick={onCancel} className="win98-btn w-4 h-4 text-[0.6rem] leading-none">
            ×
          </button>
        </div>
        <div className="p-4 text-black text-sm">
          <div className="flex gap-3">
            <span className="text-3xl">⚠️</span>
            <div>
              <p className="font-bold mb-1">{s.title}</p>
              <p className="text-xs">{s.body}</p>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => (step < STEPS.length - 1 ? setStep(step + 1) : onConfirm())}
              className="win98-btn px-3 py-1 text-xs"
            >
              {s.yes}
            </button>
            <button onClick={onCancel} className="win98-btn px-3 py-1 text-xs font-bold">
              {s.no}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
