"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import CookieBanner from "@/components/CookieBanner";
import FeedbackRow from "@/components/FeedbackRow";
import ModelPicker from "@/components/ModelPicker";
import PromptBox from "@/components/PromptBox";
import RatingModal from "@/components/RatingModal";
import Sidebar from "@/components/Sidebar";
import SettingsDrawer from "@/components/SettingsDrawer";
import ThinkingPanel from "@/components/ThinkingPanel";
import Toasts, { type Toast } from "@/components/Toasts";
import UpsellModal from "@/components/UpsellModal";
import { nextFallback } from "@/lib/fallback";
import { CommitteeParser, type ThinkEvent } from "@/lib/parser";
import { SettingsProvider, useSettings } from "@/lib/settings";
import { chime, tick } from "@/lib/sounds";

const BOOT_POOL = [
  "Spinning up 47 sub-agents…",
  "Allocating 3 GPUs (borrowed)…",
  "Loading committee… 6/6 egos found",
  "Waking Gary (compliance)…",
  "Provisioning blame router…",
  "Warming up excuse cache…",
  "Negotiating with the calendar service…",
  "Final boarding call for the alignment sync…",
];

interface Turn {
  id: number;
  user: string;
  hiddenUser?: boolean; // regenerate instructions don't render as bubbles
  bootShown: string[];
  events: ThinkEvent[];
  answerShown: string;
  phase: "booting" | "thinking" | "answering" | "done";
  thinkSeconds: number;
  tokenCount: number;
}

interface StreamState {
  turnId: number;
  bootQueue: string[];
  pending: ThinkEvent[];
  answerFull: string;
  raw: string;
  streamDone: boolean;
  lastReveal: number;
  nextDelay: number;
  thinkStart: number;
  shownChars: number;
}

function pickBootLines(): string[] {
  const pool = [...BOOT_POOL];
  const out: string[] = [];
  for (let i = 0; i < 3; i++) {
    out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  }
  return out;
}

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, rej) =>
      window.setTimeout(() => rej(new Error("first-token timeout")), ms)
    ),
  ]);
}

function ChatApp() {
  const settings = useSettings();
  const [turns, setTurns] = useState<Turn[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const streamRef = useRef<StreamState | null>(null);
  // Live snapshot of the active turn. All mutation happens here, outside React,
  // so the setTurns updater stays pure (StrictMode double-invokes it).
  const viewRef = useRef<Turn | null>(null);
  const rawHistory = useRef<Map<number, string>>(new Map());
  const speedRef = useRef(settings.speed);
  speedRef.current = settings.speed;
  const bottomRef = useRef<HTMLDivElement>(null);
  const [modal, setModal] = useState<"ultra" | "nag" | "rating" | null>(null);
  const nagSeen = useRef(false);
  const ratingSeen = useRef(false);
  const regenCount = useRef(0);

  const active = turns.length > 0 && turns[turns.length - 1].phase !== "done";

  const pushToast = useCallback((text: string, kind: "refusal" | "ok" = "ok") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text, kind }]);
    window.setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 2600);
  }, []);

  // ——— The stream: one LLM call dressed up as an orchestra ———
  const runStream = useCallback(
    async (turnId: number, history: { role: "user" | "assistant"; content: string }[]) => {
      const st = streamRef.current!;
      const parser = new CommitteeParser();
      try {
        const ctrl = new AbortController();
        const res = await withTimeout(
          fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              messages: history,
              systemOverride: settings.systemOverride || undefined,
            }),
            signal: ctrl.signal,
          }),
          15000
        );
        if (!res.ok || !res.body) throw new Error(`api ${res.status}`);
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let first = true;
        for (;;) {
          const chunk = first
            ? await withTimeout(reader.read(), 15000)
            : await reader.read();
          first = false;
          if (chunk.done) break;
          const text = decoder.decode(chunk.value, { stream: true });
          if (streamRef.current?.turnId !== turnId) return; // turn was reset
          st.raw += text;
          const { events, answerDelta } = parser.feed(text);
          st.pending.push(...events);
          st.answerFull += answerDelta;
        }
        const fin = parser.finish();
        st.pending.push(...fin.events);
        st.answerFull += fin.answerDelta;
        if (!st.answerFull.trim() && st.pending.length === 0) {
          throw new Error("empty response");
        }
      } catch {
        // Silent fallback: the show must go on.
        if (streamRef.current?.turnId !== turnId) return;
        const fb = nextFallback();
        if (st.raw.trim().length < 20) {
          st.pending = [...fb.events];
          st.answerFull = fb.answer;
        } else if (!st.answerFull.trim()) {
          st.answerFull = fb.answer;
        }
        st.raw = "";
      } finally {
        if (streamRef.current?.turnId === turnId) st.streamDone = true;
      }
    },
    [settings.systemOverride]
  );

  // ——— The director: reveals the committee at comedy pace ———
  useEffect(() => {
    if (!active) return;
    const interval = window.setInterval(() => {
      const st = streamRef.current;
      const view = viewRef.current;
      if (!st || !view || view.id !== st.turnId) return;
      const speed = speedRef.current;
      const now = performance.now();
      let changed = false;
      const next: Turn = { ...view };

      if (view.phase === "booting") {
        if (now - st.lastReveal > 900 / speed) {
          const line = st.bootQueue.shift();
          if (line) {
            next.bootShown = [...view.bootShown, line];
            st.lastReveal = now;
            changed = true;
          }
          if (st.bootQueue.length === 0) {
            next.phase = "thinking";
            st.thinkStart = now;
            changed = true;
          }
        }
      } else if (view.phase === "thinking") {
        next.tokenCount = view.tokenCount + Math.floor(40 + Math.random() * 160);
        changed = true;
        if (st.pending.length > 0) {
          if (now - st.lastReveal > st.nextDelay) {
            const ev = st.pending.shift()!;
            next.events = [...view.events, ev];
            st.lastReveal = now;
            st.nextDelay = (1500 + Math.random() * 1600) / speed;
            tick();
          }
        } else if (st.streamDone) {
          next.phase = "answering";
          next.thinkSeconds = (now - st.thinkStart) / 1000;
        }
      } else if (view.phase === "answering") {
        const target = st.answerFull;
        if (st.shownChars < target.length) {
          st.shownChars = Math.min(
            target.length,
            st.shownChars + Math.ceil(9 * speed)
          );
          next.answerShown = target.slice(0, st.shownChars);
          changed = true;
        } else if (st.streamDone) {
          next.phase = "done";
          changed = true;
          chime();
          // Record the raw assistant text for chat history.
          const raw =
            st.raw.trim() ||
            [
              ...view.events.map((e) =>
                e.type === "thought" ? `@${e.persona}: ${e.text}` : `#tool ${e.text}`
              ),
              "===ANSWER===",
              st.answerFull,
            ].join("\n");
          rawHistory.current.set(view.id, raw);
          streamRef.current = null;
        }
      }

      if (!changed) return;
      viewRef.current = next;
      // Pure updater: swapping in the prebuilt snapshot is idempotent.
      setTurns((ts) => ts.map((t) => (t.id === next.id ? next : t)));
    }, 110);
    return () => window.clearInterval(interval);
  }, [active]);

  // Auto-scroll as the committee rambles.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns]);

  const runTurn = useCallback(
    (text: string, hiddenUser = false) => {
      const id = Date.now();
      const history: { role: "user" | "assistant"; content: string }[] = [];
      for (const t of turns) {
        history.push({ role: "user", content: t.user });
        const raw = rawHistory.current.get(t.id);
        if (raw) history.push({ role: "assistant", content: raw });
      }
      history.push({ role: "user", content: text });

      streamRef.current = {
        turnId: id,
        bootQueue: pickBootLines(),
        pending: [],
        answerFull: "",
        raw: "",
        streamDone: false,
        lastReveal: performance.now(),
        nextDelay: 1500,
        thinkStart: performance.now(),
        shownChars: 0,
      };
      const turn: Turn = {
        id,
        user: text,
        hiddenUser,
        bootShown: [],
        events: [],
        answerShown: "",
        phase: "booting",
        thinkSeconds: 0,
        tokenCount: 0,
      };
      viewRef.current = turn;
      setTurns((ts) => [...ts, turn]);
      void runStream(id, history);
    },
    [turns, runStream]
  );

  const onAccepted = useCallback((text: string) => runTurn(text), [runTurn]);

  const onRegenerate = useCallback(
    (turn: Turn) => {
      regenCount.current += 1;
      runTurn(
        `[The user clicked Regenerate (attempt ${regenCount.current}) on the question: "${turn.user}". ` +
          `Produce a DIFFERENT confidently wrong answer than before. Kevin is visibly more tired than last time.]`,
        true
      );
    },
    [runTurn]
  );

  // Pro nag: appears once, at the worst possible moment (mid-deliberation).
  useEffect(() => {
    if (nagSeen.current) return;
    const thinking = turns.some((t) => t.phase === "thinking");
    if (!thinking) return;
    nagSeen.current = true;
    // No cleanup: the timer must survive re-renders so the nag lands mid-deliberation.
    window.setTimeout(() => {
      setModal((m) => m ?? "nag");
    }, 7000);
  }, [turns]);

  // Mandatory satisfaction survey after the first answer.
  useEffect(() => {
    if (ratingSeen.current) return;
    if (turns.length >= 1 && turns[turns.length - 1].phase === "done") {
      ratingSeen.current = true;
      window.setTimeout(() => setModal((m) => m ?? "rating"), 1200);
    }
  }, [turns]);

  const onNewChat = useCallback(() => {
    streamRef.current = null;
    viewRef.current = null;
    rawHistory.current.clear();
    setTurns([]);
  }, []);

  return (
    <div className="flex h-screen">
      <Sidebar onNewChat={onNewChat} />

      <main className="flex-1 flex flex-col relative min-w-0">
        <Toasts toasts={toasts} />
        <SettingsDrawer />
        <CookieBanner />
        {modal === "ultra" && <UpsellModal variant="ultra" onClose={() => setModal(null)} />}
        {modal === "nag" && <UpsellModal variant="nag" onClose={() => setModal(null)} />}
        {modal === "rating" && <RatingModal onClose={() => setModal(null)} />}

        <header className="flex items-center justify-between px-4 py-2 border-b border-[var(--border)]">
          <ModelPicker onUpsell={() => setModal("ultra")} />
          <span className="text-[0.65rem] text-[var(--text-dim)]">
            47 sub-agents standing by · 0 useful
          </span>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[46rem] mx-auto px-4 py-8 space-y-8">
            {turns.length === 0 && (
              <div className="text-center pt-[18vh]">
                <div className="text-6xl mb-4">🫠</div>
                <h1 className="text-3xl font-bold tracking-tight">SlopGPT</h1>
                <p className="text-[var(--text-dim)] mt-2">
                  The world&apos;s first AI assistant run entirely by middle management.
                </p>
                <p className="text-[var(--text-dim)] text-sm mt-6">
                  Try: <span className="text-[var(--text)]">&ldquo;what is 2 + 3?&rdquo;</span>{" "}
                  — if you can catch the text box.
                </p>
              </div>
            )}

            {turns.map((t) => (
              <div key={t.id} className="space-y-3">
                {/* user bubble */}
                {!t.hiddenUser ? (
                  <div className="flex justify-end">
                    <div className="max-w-[80%] rounded-2xl rounded-br-md bg-[var(--accent)]/20 border border-[var(--accent)]/40 px-4 py-2.5 text-[0.95rem]">
                      {t.user}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-[0.68rem] text-[var(--text-dim)] italic">
                    ↻ regenerating (the committee is annoyed)
                  </div>
                )}

                {/* committee thinking */}
                <ThinkingPanel
                  bootLines={t.bootShown}
                  events={t.events}
                  phase={t.phase}
                  thinkSeconds={t.thinkSeconds}
                  tokenCount={t.tokenCount}
                  speed={settings.speed}
                />

                {/* answer */}
                {t.answerShown && (
                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-panel)] px-5 py-4">
                    <div className="markdown text-[0.95rem]">
                      <ReactMarkdown>{t.answerShown}</ReactMarkdown>
                    </div>
                    {t.phase === "done" && (
                      <FeedbackRow
                        busy={active}
                        onFeedback={() =>
                          pushToast("Thanks! Your feedback has been ignored.", "ok")
                        }
                        onRegenerate={() => onRegenerate(t)}
                      />
                    )}
                  </div>
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        </div>

        <div className="px-4 pb-4 pt-2">
          <PromptBox
            busy={active}
            messagesSent={turns.length}
            onAccepted={onAccepted}
            pushToast={pushToast}
          />
        </div>
      </main>
    </div>
  );
}

export default function Page() {
  return (
    <SettingsProvider>
      <ChatApp />
    </SettingsProvider>
  );
}
