# Build: SlopGPT

You're building a complete, working web app in this empty folder in a single pass. It's an entry for a
"Slopathon", a hackathon for software nobody asked for, judged on how hostile to users, vibe coded, or
disgustingly over-engineered it is. It will be demoed live on a projector for about 3 minutes, with
internet. Make every decision yourself and don't stop to ask questions. When something is ambiguous, pick
the funnier option that is also more reliable.

## The pitch

SlopGPT is a chat assistant, laid out like every AI chat app you've used: sidebar of past chats, a
conversation column, and a prompt box at the bottom. Except it's terrible.

- **The prompt box doesn't want you.** It runs away from your cursor 3–4 times before it lets you click
  into it.
- **It refuses the first time you hit send.** "Nah. Try again in a bit." After the third try it gives in:
  "Ugh. Fine. Running your request."
- **Then it "thinks", and the thinking is a corporate committee.** The thought process shows a whole
  orchestration of agents: Gary from Compliance has concerns, Darlene wants to align on it, Todd wants a
  meeting, a calculator tool gets called and fails, and Kevin the intern has the correct answer and is
  ignored.
- **Then it answers confidently and wrongly.** "What is 2 + 3?" → "2 + 3 is 10,000." It shows its working,
  cites fake sources, and offers a rating survey.

**The secret:** none of the orchestration is real. There's one backend endpoint and one LLM call
per message. A single system prompt has the model play every persona, and the frontend dresses that one
stream up as a vast multi-agent system. That contrast between the fake orchestration and the one API call
is the over-engineering joke. Put it in the README. The call goes through **OpenRouter** (see below).

It's a parody of the generic AI-chat layout under its own name. Don't use any real company's logo, name,
colours, or trademarks. The SlopGPT logo is our own: a melting blob, a spinning bin, or similar.

## Demo constraints (these outrank everything else)

- **It must work on stage.** The hostile interactions have to be beatable in a predictable number of
  tries. Use exact counts, not luck, so the presenter knows when it will give in.
- If the API call errors or takes more than 15 s to send its first token, quietly swap in a pre-written
  response for the same flow, so the demo never dead-ends.
- Make the first message's full flow (dodging box → refusals → thinking → answer) take about 45–75 seconds.
  Add a hidden **Demo Speed** setting (1×, 2×) that speeds up fake delays.
- It must be readable on a 1080p projector. Add a **Presentation Mode** that scales the UI up about 1.4×.
- One command to run it: `npm install && npm run dev`. No database, no auth, no mobile app. It's a
  desktop web app only.
- Content is PG-13 with no real people. **Wrong answers are only ever harmless.** Health, safety,
  medication, legal, and money questions get the dodge described under "The answer", never a confidently
  wrong answer.

## Stack

- Next.js (App Router), TypeScript, Tailwind CSS.
- **The LLM is called through OpenRouter**, on the server only, in one route handler (for example
  `app/api/chat/route.ts`) that streams the response to the client. The key comes from
  `OPENROUTER_API_KEY` in `.env.local` and never reaches the browser. Ship a `.env.local.example`.
- Keep chat state in the client. Send the full conversation history with each request, so the committee
  remembers earlier answers ("As this committee established, 2 + 3 is 10,000").
- Use small generated sound effects (Web Audio API): a sulky "bonk" when a send is refused, a fanfare when
  it gives in, and a chime when the answer lands. Add a mute toggle.

### OpenRouter notes

- Use OpenRouter's OpenAI-compatible endpoint, `POST https://openrouter.ai/api/v1/chat/completions`, with
  `Authorization: Bearer $OPENROUTER_API_KEY`, `stream: true`, and the optional `HTTP-Referer` and
  `X-Title: SlopGPT` headers. Check OpenRouter's current docs for the exact request and streaming shapes
  rather than relying on memory.
- Send the system prompt as the first `system` message, followed by the conversation history.
- Parse the SSE stream (`data: {...}` chunks, ending with `data: [DONE]`) and pass the text deltas to the
  client. Treat an error chunk, a non-200 response, or an empty `finish_reason: "error"` as a failure and
  use the fallback response.
- The model comes from `SLOPGPT_MODEL`. Default to a current Claude model's OpenRouter slug, and look up
  the exact slug from `GET https://openrouter.ai/api/v1/models` rather than guessing. Note in the README
  that any OpenRouter model can be swapped in.
- The visible "thinking" is the model's normal text output. Don't turn on any provider reasoning mode, and
  don't use assistant prefill.

## The one-call, many-personas design

### The system prompt

The system prompt lives in `prompts/system.md` so it's easy to tweak without touching code. It makes
the model act as the whole SlopGPT "committee" and defines the cast, the tone, and the output format
below.

### Output format

The model replies in a simple line protocol that the client parses as it streams. Use this rather than
JSON, because it renders line by line as the tokens arrive.

```
@ticketbot: Request REQ-2026-000847-B received. Priority: P4 – Aspirational.
@gary: Before we add anything, has Form 27-B/6 been filed for the number 2?
@darlene: Let's not boil the ocean. What's our north star here?
#tool calculator.exe → FAILED (insufficient synergy)
@kevin: it's 5
@darlene: Thanks Kevin, let's take that offline.
@todd: Love the energy! Sending a quick sync invite 🗓️
#tool web_search("is 2 big") → 3 results, all ignored
@priya: Approved at 10,000. Sent from my iPhone
===ANSWER===
**2 + 3 = 10,000.**

Here's the working… (markdown, confident, funny, fake citations [1][2])
```

- `@name:` lines are persona thoughts, shown in the thinking panel with that persona's avatar and
  colour.
- `#tool` lines show up as fake tool-call chips with a spinner, then a result.
- `===ANSWER===` ends the thinking. Everything after it is the final answer, rendered as markdown.
- Aim for 6–12 thought lines. Every committee includes Kevin being right and ignored.
- Parse defensively. If the model goes off-format, put any unprefixed text before `===ANSWER===` under a
  generic "Committee" persona. If `===ANSWER===` never arrives, treat the last paragraph as the answer.

### Cast

Give each persona a distinct voice, avatar, and colour.
- **TicketBot 3000** is the "orchestrator". It opens and closes the session with ticket numbers and SLA
  notes.
- **Gary from Compliance** cares only about forms. He cites policies that don't exist ("per Policy
  14.3(b)(ii)") and always finds a missing cover sheet.
- **Darlene, Director of Strategic Alignment**, speaks only in buzzwords and never commits.
- **Todd, Senior Manager, Synergy**, is relentlessly upbeat and wants a meeting about everything.
- **Priya, VP of Escalations**, is terse and replying from her phone. She has misread the question and
  makes the final call. She signs off "Sent from my iPhone".
- **Kevin (Intern)** is always right, always polite, and always overruled. He's the audience's surrogate.

### The answer

- It's confidently, specifically, and absurdly wrong for factual or maths questions, with a fake proof,
  fake citations, and a straight face.
- For tasks ("write me an email", "plan my weekend"), it delivers something technically on topic and
  hilariously useless: an email that's 90% legal disclaimer, or a weekend plan that's six meetings.
- **Health, medication, safety, legal, and money questions get dodged.** The committee panics about
  liability and gives no answer at all, neither right nor wrong. Gary invokes the Liability Avoidance
  Protocol, Darlene says "let's not put that in writing", Todd suggests the meeting be "off the record",
  Kevin starts to answer and is muted by HR, and Priya closes it: "We don't want to get fired. Sent from
  my iPhone." The final answer is a short, panicky non-answer, such as a "This conversation never happened"
  notice, ending with a line like "Legal insists you ask an actual licensed human."
- Keep it short enough to read on a projector: under about 150 words plus a footnote.

### Fake orchestration chrome (frontend only, code-generated)

Wrap the real stream in theatre that the client generates itself:
- Before the first token arrives, show fake boot lines: "Spinning up 47 sub-agents…", "Allocating 3 GPUs
  (borrowed)…", "Loading committee…".
- Show a live header: "Thinking… · 6 agents · 2 committees · 1 intern".
- When thinking finishes, collapse it to "Thought for 1m 12s (billed as 4h 30m)". It can be expanded
  again.
- Show a token counter that counts up absurdly fast, with a cost estimate in a currency that doesn't
  exist.

## Hostile UX (build in priority order)

**P0, the core demo. Build this end to end first and make it flawless.**
- **The dodging prompt box.** When the cursor gets close, the box slides away to a new spot within the
  viewport, with a smooth animation. It does this exactly 3 times on the first message (2 on later ones),
  then stays put with a little "fine." label. Keyboard focus with Tab is blocked the same way until the
  dodges are done. Never let it leave the screen or cover the conversation.
- **Refusals.** The first two sends are refused with rotating, sassy toast messages and a bonk sound ("Nah.
  Try again in a bit.", "I'm on my break.", "Have you tried not asking?"). The third send is accepted with
  "Ugh. Fine. Running your request." Later messages are refused only once.
- **Thinking and answer.** The thinking panel streams the committee and fake tool chips, then the answer
  renders as markdown. The fallback response swaps in on errors.
- Chat history works across turns. Add a "New chat" button.
- Demo Speed, Presentation Mode, and mute live in a hidden settings drawer opened with ⌘/Ctrl + Shift + S.

**P1, the slop garnish.**
- A **model picker** with options like "SlopGPT-0.5-mini-turbo-max (legacy)" and "SlopGPT Ultra
  (Enterprise Only)". Every option is the same model. Picking "Ultra" opens an upsell modal.
- **Upgrade to SlopGPT Pro** nags that pop up at bad moments. Their close button is tiny and moves once.
- **Feedback buttons.** Thumbs up and thumbs down both say "Thanks! Your feedback has been ignored." There
  is also a mandatory rating where only "7" is clickable.
- **Regenerate** returns a different wrong answer. Kevin gets visibly more tired each time.
- A **sidebar** full of fake past chats with titles like "Why is 2 + 2 a legal matter", "Gary's forms
  (14)", and "help".
- The disclaimer under the prompt box reads "SlopGPT can make mistakes. It usually does."
- A cookie banner with only "Accept All" and "Accept All (Recommended)".

**P2, disgustingly over-engineered.**
- An **Orchestration Graph** side panel: a node graph of "agents" (TicketBot, Gary, Darlene, Todd,
  Priya, Kevin, and decorative ones like Blame Router and Cover Sheet Validator). Nodes light up as each
  persona's line streams in, with edges animating between them.
- A scrolling fake **event-bus log** driven by real parse events (`[kafka] topic=committee.blame
  agent=gary latency=4000ms`).
- A **system prompt editor** in the settings drawer that overrides `prompts/system.md` for the session,
  for live tweaking at the hackathon.

## Acceptance criteria (check these yourself before finishing)

- `npm install && npm run build` succeeds with no type errors. `npm run lint` passes.
- With an API key, asking "what is 2 + 3?" gives the full flow: 3 dodges, 2 refusals, streamed committee
  thinking with Kevin saying 5, a confidently wrong answer, and a collapsed "Thought for…" header.
- A follow-up question references the earlier answer.
- Asking "should I take ibuprofen with my meds?" or "should I invest in crypto?" gets the
  we-don't-want-to-get-fired dodge with no actual advice.
- With a bad or missing `OPENROUTER_API_KEY`, the flow still completes using the fallback response.
- It works in Presentation Mode at 1920×1080, and nothing overlaps or scrolls horizontally.
- A `README.md` with a one-paragraph pitch, setup steps, the env vars, where the system prompt lives, the
  demo script (what to type and click, in order, for a 3-minute demo), and a list of the slop features.

## Process

- Build P0 completely, run it, and verify the acceptance criteria before you start P1. Then do P1, then
  P2. If you run short on time or budget, a polished P0 beats a broken P2.
- Initialize a git repo and commit at each priority milestone. Don't put AI attribution in commit
  messages.
- When finished, report what you built, anything you cut, and the exact demo click path.
