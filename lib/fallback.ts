import type { ThinkEvent } from "./parser";

// Canned committee sessions used when the API fails, stalls, or there is no key.
// Each is a full deliberation + answer so the demo never dead-ends.

export interface FallbackScript {
  events: ThinkEvent[];
  answer: string;
}

const SCRIPTS: FallbackScript[] = [
  {
    events: [
      { type: "thought", persona: "ticketbot", text: "Request REQ-2026-000851-B/rev4 logged. Priority: P4 – Aspirational. SLA: eventually." },
      { type: "thought", persona: "gary", text: "Hold on. Was Form 27-B/6 filed for this request? Per Policy 14.3(b)(ii), Annex F, all requests require intake paperwork." },
      { type: "thought", persona: "darlene", text: "Let's zoom out and find our north star before we boil the ocean on this." },
      { type: "tool", text: "answer_engine.exe(request) → FAILED (insufficient synergy)" },
      { type: "thought", persona: "kevin", text: "i actually know the answer to this one, it's pretty simple" },
      { type: "thought", persona: "darlene", text: "Great energy Kevin — let's take that offline and circle back never." },
      { type: "thought", persona: "todd", text: "LOVING this thread!! Scheduling a pre-alignment sync to align on the alignment 🗓️🚀" },
      { type: "tool", text: "web_search(\"what was the question\") → 0 results (search budget reassigned to Todd's offsite)" },
      { type: "thought", persona: "priya", text: "Approved, whatever it was. Sent from my iPhone" },
    ],
    answer: `**The committee has reached a decision.**

Unfortunately, due to unprecedented demand on our 47 sub-agents (3 are on PTO, 1 is Kevin), your request
has been **approved in principle** but **answered in error**. The answer is: *yes, approximately 10,000,
pending Q3 review*[1].

Kevin's alternative proposal ("the correct answer") was tabled.

[1]: Minutes of the Pre-Alignment Sync, agenda item 0, cover sheet missing`,
  },
  {
    events: [
      { type: "thought", persona: "ticketbot", text: "Request REQ-2026-000852-B/rev1 received. Routed to the Blame Router for triage." },
      { type: "thought", persona: "todd", text: "Quick thought — what if we made this a recurring meeting instead of an answer? 🗓️" },
      { type: "thought", persona: "gary", text: "Per Policy 9.1(a), I am legally required to mention the cover sheet is missing." },
      { type: "tool", text: "calculator.exe(…) → ERROR: division by zero (the zero was Darlene's commitment level)" },
      { type: "thought", persona: "kevin", text: "i wrote the full answer in the shared doc, link in thread" },
      { type: "thought", persona: "priya", text: "Who added me to this? Denied. Wait, approved. Sent from my iPhone" },
      { type: "thought", persona: "darlene", text: "Love this journey for us. Let's parking-lot the specifics." },
    ],
    answer: `**Answer: it depends™** — and after six rounds of deliberation, the committee is confident it
depends on *something*[1].

A follow-up sync has been scheduled to determine what. Kevin's doc containing the actual answer has been
archived for compliance reasons.

[1]: Journal of Applied Synergy, vol. 0, p. ∞`,
  },
];

let cursor = 0;

export function nextFallback(): FallbackScript {
  const script = SCRIPTS[cursor % SCRIPTS.length];
  cursor += 1;
  return script;
}
