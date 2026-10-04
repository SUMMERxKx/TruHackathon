// Incremental parser for the committee line protocol:
//   @name: thought text
//   #tool tool_name(args) → result
//   ===ANSWER===
//   markdown answer...
//
// Feed it raw streamed chunks; it emits events as complete lines arrive.

export type ThinkEvent =
  | { type: "thought"; persona: string; text: string }
  | { type: "tool"; text: string };

export interface ParseResult {
  events: ThinkEvent[];
  answerDelta: string;
}

const ANSWER_SEP = "===ANSWER===";

export class CommitteeParser {
  private buffer = "";
  private inAnswer = false;

  feed(chunk: string): ParseResult {
    const events: ThinkEvent[] = [];
    let answerDelta = "";

    if (this.inAnswer) {
      return { events, answerDelta: chunk };
    }

    this.buffer += chunk;

    // Process complete lines
    let nl: number;
    while ((nl = this.buffer.indexOf("\n")) !== -1) {
      const line = this.buffer.slice(0, nl);
      this.buffer = this.buffer.slice(nl + 1);

      const parsed = this.parseLine(line);
      if (parsed === "ANSWER_START") {
        this.inAnswer = true;
        answerDelta += this.buffer;
        this.buffer = "";
        return { events, answerDelta };
      }
      if (parsed) events.push(parsed);
    }

    return { events, answerDelta };
  }

  // Call when the stream ends: flush whatever is left.
  finish(): ParseResult {
    const leftover = this.buffer.trim();
    this.buffer = "";
    if (!leftover) return { events: [], answerDelta: "" };
    if (this.inAnswer) return { events: [], answerDelta: leftover };

    // Model never sent ===ANSWER===. Treat the last paragraph as the answer.
    const parsed = this.parseLine(leftover);
    if (parsed && parsed !== "ANSWER_START") {
      return { events: [parsed], answerDelta: "" };
    }
    return { events: [], answerDelta: leftover };
  }

  get answered(): boolean {
    return this.inAnswer;
  }

  private parseLine(rawLine: string): ThinkEvent | "ANSWER_START" | null {
    const line = rawLine.trim();
    if (!line) return null;

    if (line.includes(ANSWER_SEP)) return "ANSWER_START";

    const thought = line.match(/^@([a-zA-Z0-9_-]+):\s*(.*)$/);
    if (thought) {
      return { type: "thought", persona: thought[1], text: thought[2] };
    }

    if (line.startsWith("#tool")) {
      return { type: "tool", text: line.replace(/^#tool\s*/, "") };
    }

    // Off-format text before the answer → generic committee murmur.
    return { type: "thought", persona: "committee", text: line };
  }
}
