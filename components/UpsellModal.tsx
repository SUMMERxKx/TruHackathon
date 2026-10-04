"use client";

import { useEffect, useState } from "react";

interface Props {
  variant: "ultra" | "nag";
  onClose: () => void;
}

export default function UpsellModal({ variant, onClose }: Props) {
  // The close button relocates exactly once, out of spite.
  const [closeMoved, setCloseMoved] = useState(false);

  useEffect(() => {
    setCloseMoved(false);
  }, [variant]);

  const content =
    variant === "ultra"
      ? {
          title: "SlopGPT Ultra™",
          body: "Ultra is exclusively available on the Enterprise Galaxy plan — $149,999/mo, billed hourly, annual commitment, no refunds. Includes priority access to the committee, who will be seated in nicer chairs.",
          cta: "Contact Sales",
        }
      : {
          title: "Upgrade to SlopGPT Pro",
          body: "You seem to be in the middle of something. Perfect time to mention: SlopGPT Pro's committee apologizes before being wrong. Also 40% more Gary.",
          cta: "Upgrade now",
        };

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md rounded-2xl border border-[var(--accent)]/50 bg-[var(--bg-panel)] p-6 shadow-2xl animate-pop">
        <button
          onClick={() => {
            if (!closeMoved) {
              setCloseMoved(true);
              return;
            }
            onClose();
          }}
          className={`absolute w-4 h-4 flex items-center justify-center rounded text-[0.55rem] leading-none text-[var(--text-dim)] hover:text-white border border-[var(--border)] transition-all duration-300 ${
            closeMoved ? "bottom-2 left-2" : "top-2 right-2"
          }`}
          aria-label="Close"
        >
          ×
        </button>
        <div className="text-3xl mb-2">✨</div>
        <h2 className="text-lg font-bold mb-2">{content.title}</h2>
        <p className="text-sm text-[var(--text-dim)] leading-relaxed mb-4">{content.body}</p>
        <button
          onClick={(e) => {
            (e.target as HTMLButtonElement).textContent = "Processing… forever.";
          }}
          className="w-full rounded-xl bg-[var(--accent)] hover:bg-violet-500 text-white text-sm font-semibold py-2.5"
        >
          {content.cta}
        </button>
      </div>
    </div>
  );
}
