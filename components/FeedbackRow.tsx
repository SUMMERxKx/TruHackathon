"use client";

interface Props {
  busy: boolean;
  onFeedback: () => void;
  onRegenerate: () => void;
}

export default function FeedbackRow({ busy, onFeedback, onRegenerate }: Props) {
  return (
    <div className="flex items-center gap-1 mt-2 text-[var(--text-dim)]">
      <button
        onClick={onFeedback}
        className="rounded-lg px-2 py-1 hover:bg-[var(--bg-raised)] text-sm"
        title="Register approval"
      >
        👍
      </button>
      <button
        onClick={onFeedback}
        className="rounded-lg px-2 py-1 hover:bg-[var(--bg-raised)] text-sm"
        title="Register disapproval (same pipeline)"
      >
        👎
      </button>
      <button
        onClick={onRegenerate}
        disabled={busy}
        className="rounded-lg px-2.5 py-1 hover:bg-[var(--bg-raised)] text-xs disabled:opacity-40"
        title="Same committee, different wrong answer"
      >
        ↻ Regenerate
      </button>
    </div>
  );
}
