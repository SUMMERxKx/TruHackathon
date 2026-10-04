"use client";

import { useEffect, useRef, useState } from "react";

const TIPS = [
  "It looks like you're trying to receive help. Would you like to stop?",
  "Tip: the committee responds well to flattery. It just doesn't act on it.",
  "Did you know? Kevin has been right 847 times in a row.",
  "Pro tip: clicking harder does not increase correctness.",
  "Fun fact: your request is someone's 4th priority. That someone is also busy.",
  "Reminder: Form 27-B/6 requires a cover sheet. Always has.",
];

interface Props {
  thinking: boolean;
}

// Clippy walked so this thing could melt.
export default function Mascot({ thinking }: Props) {
  const [tip, setTip] = useState<string | null>(null);
  const shownThisTurn = useRef(false);
  const tipIdx = useRef(Math.floor(Math.random() * TIPS.length));

  useEffect(() => {
    if (!thinking) {
      shownThisTurn.current = false;
      return;
    }
    if (shownThisTurn.current) return;
    shownThisTurn.current = true;
    const show = window.setTimeout(() => {
      tipIdx.current = (tipIdx.current + 1) % TIPS.length;
      setTip(TIPS[tipIdx.current]);
    }, 3500);
    const hide = window.setTimeout(() => setTip(null), 11000);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
  }, [thinking]);

  return (
    <div className="fixed bottom-3 right-3 z-[45] hidden lg:flex flex-col items-end gap-1.5 pointer-events-none">
      {tip && (
        <div className="pointer-events-auto max-w-56 rounded-xl rounded-br-none win98-bevel p-2.5 text-[0.7rem] text-black animate-pop"
          style={{ fontFamily: "var(--font-comic)" }}
        >
          {tip}
          <button
            onClick={() => setTip(null)}
            className="block ml-auto mt-1 win98-btn px-2 text-[0.62rem]"
          >
            Unhelpful
          </button>
        </div>
      )}
      <div className={`text-4xl select-none ${thinking ? "animate-wobble" : ""}`}>🫠</div>
    </div>
  );
}
