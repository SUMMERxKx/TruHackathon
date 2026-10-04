# SlopGPT 🫠

**The world's first AI assistant run entirely by middle management.**

SlopGPT looks like every AI chat app you've ever used — sidebar, conversation, prompt box — except it is
hostile, wrong, and magnificently over-engineered. The prompt box runs away from your cursor. Sending a
message gets refused twice before it gives in ("Ugh. Fine."). The "thinking" is a live feed of a corporate
committee — Gary from Compliance, Darlene from Strategic Alignment, Todd from Synergy, Priya replying from
her phone, and Kevin the intern, who is always right and always ignored. Then it answers your question
confidently and completely wrongly, with citations.

Built for the Slopathon: software nobody asked for.

## The secret

The 14-microservice orchestration panel, the 47 sub-agents, the agent graph, the kafka event bus — none of
it is real. **The entire backend is one API call per message.** A single system prompt
(`prompts/system.md`) makes one model play every persona in a simple line protocol, and the frontend
dresses that one stream up as a vast distributed system. That contrast *is* the over-engineering joke.

## Setup

```bash
npm install
cp .env.local.example .env.local   # then put your OpenRouter key in it
npm run dev
```

Open http://localhost:3000.

### Environment variables (`.env.local`)

| Var | What |
|---|---|
| `OPENROUTER_API_KEY` | Your key from https://openrouter.ai/keys. Server-side only. |
| `SLOPGPT_MODEL` | Any OpenRouter model slug. Default: `anthropic/claude-sonnet-5.5`. |

No key (or a dead network)? The show still runs — every failure silently swaps in a canned committee
session, so the demo can never dead-end.

## The 3-minute demo script

1. **The box.** Move your mouse toward the prompt box. It dodges. Three times. Then: *"fine."*
2. **The refusals.** Type `what is 2 + 3?` and hit Enter. "Nah. Try again in a bit." Again: "I'm on my
   break." Third time: "Ugh. Fine. Running your request."
3. **The committee.** Watch the boot sequence ("Spinning up 47 sub-agents…"), then the deliberation:
   Gary demands Form 27-B/6, a tool fails from insufficient synergy, Kevin quietly says "it's 5" and is
   taken offline. Point at the orchestration panel on the right — nodes light up per speaker, the event
   bus scrolls, the token counter bills you in SpesCoins.
4. **The answer.** *2 + 3 = 10,000*, with a footnote. "Thought for 1m (billed as 4h)."
5. **The aftermath.** An Upgrade-to-Pro nag whose × button relocates. A mandatory rating survey where only
   7 is clickable. Thumbs up or down: "Thanks! Your feedback has been ignored." Hit **Regenerate** — a
   different wrong answer, and Kevin is more tired.
6. **The kicker.** Ask a follow-up ("are you sure?") — the committee cites its own earlier ruling. Ask
   `should I invest in crypto?` — the committee panics, Kevin is muted by HR, and Legal insists you ask an
   actual licensed human.
7. Open the model picker. Select SlopGPT Ultra. Enjoy the Enterprise Galaxy plan.

### Operator panel (don't show the audience)

`⌘/Ctrl + Shift + S` opens a hidden drawer: demo speed (1×/2×), presentation mode (scales UI ~40% for
projectors), mute, and a live system-prompt editor that overrides `prompts/system.md` for the session.

## Slop features, catalogued

**Hostile**
- Prompt box dodges the cursor 3× (2× for later messages), blocks Tab focus, then sulks: "fine."
- First message refused twice with rotating excuses and a bonk sound; later messages refused once.
- Cookie banner: "Accept All" or "Accept All (Recommended)". No other options.
- Mandatory rating survey; ratings 1–6 and 8–10 are "unavailable in your region."
- Feedback is thanked and ignored, by design and by label.
- Upgrade nag arrives mid-deliberation; its close button moves once before working.

**Wrong on purpose**
- Confidently incorrect answers with fake working and fake citations ("Journal of Applied Synergy, vol. 0").
- Kevin always gives the correct answer first. It is always tabled for Q3.
- Health / legal / money questions trigger the Liability Avoidance Protocol: no answer at all, Kevin is
  muted by HR, Priya closes with "We don't want to get fired. Sent from my iPhone", and you're told to ask
  an actual licensed human.
- Regenerate produces a *different* wrong answer. The committee remembers and cites its past rulings.

**Disgustingly over-engineered (cosmetically)**
- Live orchestration graph: agents light up as they "speak", decorative services (Blame Router, CoverSheet
  Validator, Excuse Cache) flicker under load.
- Microservice status lights for request-ingestion, escalation-mesh, kevin-suppressor, and friends.
- A kafka event-bus log driven by the real parse events, plus ambient infrastructure noise
  ("pod synergy-orchestrator-7d4f restarted (OOMKilled)").
- Token counter at ~1,400 tok/s with cost in SpesCoins (₷), a currency that died with Esperanto banking.
- "Thought for 21s (billed as 1h 19m)."
- Model picker with five models that are all the same model.

## Architecture (such as it is)

```
app/page.tsx          — the "director": paces boot lines, thoughts, and the answer reveal
app/api/chat/route.ts — the entire backend: one streaming OpenRouter call
prompts/system.md     — the committee: cast, line protocol, liability dodge
lib/parser.ts         — incremental parser for @persona / #tool / ===ANSWER=== lines
lib/fallback.ts       — canned committee sessions for when reality fails
lib/sounds.ts         — Web Audio bonks, fanfares, and chimes
components/           — the chrome: dodging prompt box, thinking panel, orchestration theatre
```

The model streams lines like `@gary: Has Form 27-B/6 been filed?` and `#tool calculator.exe(2+3) → FAILED
(insufficient synergy)`, then `===ANSWER===` and markdown. The client parses the stream, queues events,
and reveals them at comedy pace regardless of network speed. UI theatre (boot lines, graphs, billing) is
generated client-side and synced to real parse events.
