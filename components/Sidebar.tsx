"use client";

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

export default function Sidebar({ onNewChat }: { onNewChat: () => void }) {
  return (
    <aside className="w-64 shrink-0 h-screen bg-[var(--bg-panel)] border-r border-[var(--border)] flex flex-col">
      <div className="p-4 flex items-center gap-2">
        <span className="text-2xl">🫠</span>
        <span className="font-bold text-lg tracking-tight">SlopGPT</span>
      </div>

      <button
        onClick={onNewChat}
        className="mx-3 mb-3 rounded-xl border border-[var(--border)] bg-[var(--bg-raised)] hover:border-[var(--accent)] text-sm font-medium px-3 py-2.5 text-left transition-colors"
      >
        ＋ New chat
      </button>

      <div className="px-4 pb-1 text-[0.65rem] uppercase tracking-wider text-[var(--text-dim)]">
        Previous disappointments
      </div>
      <nav className="flex-1 overflow-y-auto px-2 space-y-0.5">
        {FAKE_CHATS.map((c) => (
          <div
            key={c}
            className="rounded-lg px-3 py-2 text-sm text-[var(--text-dim)] hover:bg-[var(--bg-raised)] hover:text-[var(--text)] cursor-not-allowed truncate"
            title="This chat is archived for compliance reasons."
          >
            {c}
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-[var(--border)] text-xs text-[var(--text-dim)]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[var(--bg-raised)] border border-[var(--border)] flex items-center justify-center">
            🙂
          </div>
          <div>
            <div className="text-[var(--text)]">You</div>
            <div>Unverified · Free Tier (forever)</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
