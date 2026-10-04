"use client";

import { useEffect, useState } from "react";
import VolumeControl from "./VolumeControl";

const FAKE_CHATS = [
  "Why is 2 + 2 a legal matter",
  "Gary's forms (14)",
  "help",
  "Re: Re: Re: quick question",
  "weekend plan (6 meetings)",
  "is water wet — ESCALATED",
  "apology draft for Todd",
  "Form 27-B/6 but in Comic Sans",
  "untitled sync about syncs",
  "help (2)",
];

// The sidebar is from a different decade than the rest of the app. On purpose.
export default function Sidebar({ onNewChat }: { onNewChat: () => void }) {
  // Randomized after mount so the server and client agree during hydration.
  const [visitors, setVisitors] = useState(4870);
  useEffect(() => {
    setVisitors(4870 + Math.floor(Math.random() * 900));
  }, []);

  return (
    <aside className="w-64 shrink-0 h-screen win98 flex flex-col border-r-2 border-[#404040]">
      <div className="win98-title px-2 py-1.5 flex items-center gap-2 text-sm">
        <span className="text-lg">🫠</span>
        <span className="rainbow-text font-black tracking-tight" style={{ fontFamily: "var(--font-impact)" }}>
          SlopGPT™
        </span>
        <span className="blink-hard ml-auto text-[0.6rem] bg-yellow-300 text-red-600 font-black px-1 rotate-6">
          NEW!
        </span>
      </div>

      <div className="p-2">
        <button
          onClick={onNewChat}
          className="w-full win98-btn px-3 py-2 text-left text-sm font-bold"
        >
          🆕 New chat
        </button>
      </div>

      <div className="px-3 pb-1 text-[0.6rem] uppercase tracking-wider font-bold">
        Previous disappointments
      </div>
      <nav className="flex-1 overflow-y-auto mx-2 win98-bevel-in p-1 space-y-px">
        {FAKE_CHATS.map((c) => (
          <div
            key={c}
            className="px-2 py-1 text-xs text-black hover:bg-[#000080] hover:text-white cursor-not-allowed truncate"
            title="This chat is archived for compliance reasons."
          >
            📁 {c}
          </div>
        ))}
      </nav>

      <div className="p-2 space-y-2">
        <VolumeControl />

        <div className="win98-bevel-in px-2 py-1 text-center">
          <span className="text-[0.6rem]">You are visitor №</span>
          <div className="font-mono font-bold text-sm bg-black text-lime-400 px-1 inline-block ml-1">
            {visitors.toLocaleString()}
          </div>
        </div>

        <div className="flex gap-1 justify-center">
          <span className="text-[0.52rem] bg-[#000080] text-white px-1 py-0.5 border border-black">
            Best viewed in Netscape 4.0
          </span>
          <span className="text-[0.52rem] bg-black text-lime-400 px-1 py-0.5 border border-lime-400">
            W3C NON-COMPLIANT ✓
          </span>
        </div>

        <div className="flex items-center gap-2 text-[0.65rem] border-t-2 border-[#808080] pt-2">
          <div className="w-7 h-7 win98-bevel flex items-center justify-center">🙂</div>
          <div>
            <div className="font-bold">You</div>
            <div>Unverified · Free Tier (forever)</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
