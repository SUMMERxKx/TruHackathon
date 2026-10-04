"use client";

export interface Toast {
  id: number;
  text: string;
  kind: "refusal" | "ok";
}

export default function Toasts({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`animate-toast rounded-xl border px-4 py-2 text-sm font-medium shadow-lg ${
            t.kind === "refusal"
              ? "bg-[#2a1215] border-[#7f1d1d] text-red-300"
              : "bg-[#132a1a] border-[#166534] text-emerald-300"
          }`}
        >
          {t.text}
        </div>
      ))}
    </div>
  );
}
