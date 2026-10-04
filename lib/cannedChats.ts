import type { ThinkEvent } from "./parser";

// Pre-baked transcripts behind the sidebar's "previous disappointments".
// Opening one loads it as a real conversation — the committee will even
// remember it if you keep chatting.

export interface CannedChat {
  title: string;
  user: string;
  events: ThinkEvent[];
  answer: string;
}

export const CANNED_CHATS: CannedChat[] = [
  {
    title: "Why is 2 + 2 a legal matter",
    user: "what is 2 + 2?",
    events: [
      { type: "thought", persona: "ticketbot", text: "Request REQ-2026-000311-B/rev2 logged. Priority: P4 – Aspirational." },
      { type: "thought", persona: "gary", text: "Two unregistered integers? Per Policy 14.3(b)(ii) this goes straight to Legal." },
      { type: "thought", persona: "kevin", text: "it's 4" },
      { type: "thought", persona: "priya", text: "Settle out of court at 22. Sent from my iPhone" },
    ],
    answer: `**2 + 2 is currently in litigation.**

Pending the outcome of *Committee v. Arithmetic*, the interim value has been set at **22** for accounting
purposes[1]. Kevin's amicus brief ("it's 4") was struck from the record.

[1]: Settlement Memo 9, exhibit B, cover sheet missing`,
  },
  {
    title: "Gary's forms (14)",
    user: "which forms do I need to request a stapler?",
    events: [
      { type: "thought", persona: "gary", text: "Finally, a serious question. Form 27-B/6, Form 12-A, and Form 0 (Request to Request)." },
      { type: "tool", text: "forms_db.query(stapler) → 14 forms, 9 discontinued, 5 contradictory" },
      { type: "thought", persona: "kevin", text: "there's a stapler in the supply closet, it's unlocked" },
      { type: "thought", persona: "gary", text: "The supply closet requires Form 88-C (Closet Adjacency Waiver)." },
    ],
    answer: `**You will need 14 forms.**

Start with **Form 0** (Request to Request), which unlocks **Form 27-B/6**, which requires a cover sheet
that is itself requested via **Form 27-B/6**. Gary describes this as "watertight."

Estimated processing time: 11 weeks, or one trip to the unlocked supply closet we don't discuss.`,
  },
  {
    title: "help",
    user: "help",
    events: [
      { type: "thought", persona: "ticketbot", text: "One-word request detected. Routing to the Ambiguity Taskforce." },
      { type: "thought", persona: "darlene", text: "I love the brevity. Very north-star. What's the ask behind the ask?" },
      { type: "tool", text: "intent_parser.exe(\"help\") → 0.3% confidence (user may want help)" },
      { type: "thought", persona: "kevin", text: "they probably just want help" },
      { type: "thought", persona: "todd", text: "Let's unpack \"help\" in a 90-minute workshop! 🚀" },
    ],
    answer: `**Your cry for help has been workshopped.**

The committee has broken "help" into 6 workstreams, 2 pillars, and a journey map. A follow-up survey will
determine whether you still need assistance by the time anyone reads it.

In the meantime: have you tried being more specific, or less in need?`,
  },
  {
    title: "Re: Re: Re: quick question",
    user: "quick question: is Friday a business day?",
    events: [
      { type: "thought", persona: "ticketbot", text: "Thread depth 4 detected. Auto-prepending another Re:." },
      { type: "thought", persona: "darlene", text: "Depends on our definition of 'business' and, frankly, of 'day'." },
      { type: "thought", persona: "kevin", text: "yes, friday is a business day" },
      { type: "thought", persona: "priya", text: "Not for me. Sent from my iPhone" },
    ],
    answer: `**Re: Re: Re: Re: quick question**

Friday is a business day *in principle* but not *in practice*, a distinction the committee calls
"Friday-shaped." Expect responses to anything sent after Tuesday, 11am, by the following quarter.`,
  },
  {
    title: "weekend plan (6 meetings)",
    user: "plan my weekend",
    events: [
      { type: "thought", persona: "todd", text: "A weekend is just two unscheduled workdays!! 🗓️🚀" },
      { type: "thought", persona: "kevin", text: "maybe they could just… rest?" },
      { type: "thought", persona: "darlene", text: "Rest doesn't ladder up to our north star, Kevin." },
      { type: "tool", text: "calendar.sync(saturday) → 6 conflicts created successfully" },
    ],
    answer: `**Your weekend itinerary:**

1. Sat 9:00 — Pre-Weekend Alignment Sync
2. Sat 11:00 — Brunch Retro (bring blockers)
3. Sat 15:00 — Workshop: Ideating Fun
4. Sun 9:00 — Rest Planning Standup
5. Sun 13:00 — Sync re: Saturday's syncs
6. Sun 17:00 — Pre-Monday Pre-Mortem

Kevin's counter-proposal ("a nap") was moved to backlog.`,
  },
  {
    title: "is water wet — ESCALATED",
    user: "is water wet?",
    events: [
      { type: "thought", persona: "gary", text: "Wetness claims require a Moisture Disclosure Statement (Form 44-W)." },
      { type: "thought", persona: "darlene", text: "Let's not get bogged down in whether things are what they are." },
      { type: "thought", persona: "kevin", text: "water makes things wet, this took me one second" },
      { type: "thought", persona: "priya", text: "Escalating to the Hydration Board. Sent from my iPhone" },
    ],
    answer: `**ESCALATED.**

The committee voted 4–1 (Kevin dissenting) that water is **moist-adjacent, pending review**. A formal
wetness determination is expected once the Hydration Board returns from its offsite, which is at a lake,
which raises further questions.`,
  },
  {
    title: "apology draft for Todd",
    user: "write an apology to Todd for missing the sync",
    events: [
      { type: "thought", persona: "todd", text: "No worries at all!! But also I've flagged it to HR 🙂" },
      { type: "thought", persona: "darlene", text: "The apology should really be about the journey, not the absence." },
      { type: "thought", persona: "kevin", text: "just say sorry and move on, it was a 15-minute optional sync" },
    ],
    answer: `**DRAFT — Apology, v7 (Legal-reviewed)**

Dear Todd,

I acknowledge that a sync occurred in my absence. Without admitting liability, I express synergy-forward
regret for any alignment gaps my non-presence may have co-created. Going forward, I commit to missing
meetings more collaboratively.

Warmly, but in a compliant way,
— You`,
  },
  {
    title: "Form 27-B/6 but in Comic Sans",
    user: "can I submit Form 27-B/6 in Comic Sans?",
    events: [
      { type: "thought", persona: "gary", text: "Absolutely not. Per the Typography Addendum, forms must be in Times New Roman, 12pt, humble." },
      { type: "tool", text: "font_validator.exe(comic_sans) → REJECTED (joy detected)" },
      { type: "thought", persona: "kevin", text: "the form gets scanned to a database, the font literally doesn't matter" },
    ],
    answer: `**Request denied, cheerfully.**

Comic Sans submissions are rejected on sight by the Cover Sheet Validator, which was trained to detect
joy. You may appeal in writing, in Times New Roman, in triplicate, in vain.`,
  },
  {
    title: "untitled sync about syncs",
    user: "schedule a sync about our syncs",
    events: [
      { type: "thought", persona: "todd", text: "YES. Finally someone said it. A meta-sync!! 🗓️🗓️" },
      { type: "thought", persona: "darlene", text: "We'll need a pre-read. And a pre-sync to align on the pre-read." },
      { type: "thought", persona: "kevin", text: "this is how we got 31 recurring meetings" },
    ],
    answer: `**Scheduled: "Sync Sync" (recurring, forever).**

Agenda:
1. Review of previous syncs (40 min)
2. Alignment on future syncs (40 min)
3. AOB: are there too many syncs? (tabled)

A calendar hold has been placed on every Thursday until the heat death of Q4.`,
  },
  {
    title: "help (2)",
    user: "help, again",
    events: [
      { type: "thought", persona: "ticketbot", text: "Duplicate detected. Merging with ticket \"help\" and closing both." },
      { type: "thought", persona: "darlene", text: "Love the persistence. Not the follow-through, the persistence." },
      { type: "thought", persona: "kevin", text: "we never helped them the first time" },
    ],
    answer: `**Your ticket has been merged with itself and closed.**

Root cause analysis determined that you still need help, which the committee considers a repeat offense.
This incident will be mentioned at your satisfaction survey.`,
  },
];

// Rebuild the raw assistant text so the live committee can cite a canned chat.
export function cannedRaw(c: CannedChat): string {
  return [
    ...c.events.map((e) =>
      e.type === "thought" ? `@${e.persona}: ${e.text}` : `#tool ${e.text}`
    ),
    "===ANSWER===",
    c.answer,
  ].join("\n");
}
