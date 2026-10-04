"use client";

import { useState } from "react";

export default function RatingModal({ onClose }: { onClose: () => void }) {
  const [thanked, setThanked] = useState(false);

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--bg-panel)] p-6 shadow-2xl animate-pop text-center">
        {!thanked ? (
          <>
            <h2 className="text-lg font-bold mb-1">Rate your experience</h2>
            <p className="text-sm text-[var(--text-dim)] mb-4">
              This survey is mandatory. There is no close button.
            </p>
            <div className="flex justify-center gap-1.5 flex-wrap">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  disabled={n !== 7}
                  onClick={() => n === 7 && setThanked(true)}
                  className={`w-9 h-9 rounded-lg border text-sm font-semibold ${
                    n === 7
                      ? "border-[var(--accent)] bg-[var(--accent)]/20 hover:bg-[var(--accent)]/40 cursor-pointer"
                      : "border-[var(--border)] text-[var(--text-dim)] opacity-40 cursor-not-allowed"
                  }`}
                  title={n === 7 ? "The correct rating" : "Unavailable in your region"}
                >
                  {n}
                </button>
              ))}
            </div>
            <p className="text-[0.62rem] text-[var(--text-dim)] mt-3">
              Ratings 1–6 and 8–10 are unavailable in your region.
            </p>
          </>
        ) : (
          <>
            <div className="text-3xl mb-2">🎉</div>
            <h2 className="text-lg font-bold mb-2">You rated us 7/10!</h2>
            <p className="text-sm text-[var(--text-dim)] mb-4">
              Which we will report as 10/10. Thank you for your honesty.
            </p>
            <button
              onClick={onClose}
              className="rounded-xl bg-[var(--accent)] hover:bg-violet-500 text-white text-sm font-semibold px-6 py-2"
            >
              Return to disappointment
            </button>
          </>
        )}
      </div>
    </div>
  );
}
