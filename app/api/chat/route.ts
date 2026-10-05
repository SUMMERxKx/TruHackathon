import fs from "fs/promises";
import path from "path";

export const runtime = "nodejs";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "z-ai/glm-5.3-flash";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  systemOverride?: string;
}

async function loadSystemPrompt(): Promise<string> {
  const file = path.join(process.cwd(), "prompts", "system.md");
  return fs.readFile(file, "utf8");
}

export async function POST(req: Request) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || apiKey.includes("your-key-here")) {
    return Response.json(
      { error: "OPENROUTER_API_KEY is not configured" },
      { status: 500 }
    );
  }

  let body: ChatRequest;
  try {
    body = (await req.json()) as ChatRequest;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const history = (body.messages ?? [])
    .filter((m) => m.role === "user" || m.role === "assistant")
    .slice(-20)
    .map((m) => ({
      role: m.role,
      content: String(m.content).slice(0, 8000),
    }));

  if (history.length === 0) {
    return Response.json({ error: "No messages" }, { status: 400 });
  }

  const system =
    typeof body.systemOverride === "string" && body.systemOverride.trim()
      ? body.systemOverride
      : await loadSystemPrompt();

  const upstream = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://github.com/SUMMERxKx/TruHackathon",
      "X-Title": "SlopGPT",
    },
    body: JSON.stringify({
      model: process.env.SLOPGPT_MODEL || DEFAULT_MODEL,
      stream: true,
      max_tokens: 2200,
      messages: [{ role: "system", content: system }, ...history],
    }),
  });

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => "");
    return Response.json(
      { error: `Upstream error ${upstream.status}`, detail: detail.slice(0, 500) },
      { status: 502 }
    );
  }

  // Re-emit OpenRouter's SSE stream as a plain text stream of deltas.
  // Uses an explicit read loop in start(): a pull()-based source stalls on
  // SSE keepalive chunks that enqueue nothing.
  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let sseBuffer = "";
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          sseBuffer += decoder.decode(value, { stream: true });

          let nl: number;
          while ((nl = sseBuffer.indexOf("\n")) !== -1) {
            const line = sseBuffer.slice(0, nl).trim();
            sseBuffer = sseBuffer.slice(nl + 1);
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6);
            if (data === "[DONE]") {
              controller.close();
              void reader.cancel().catch(() => {});
              return;
            }
            try {
              const json = JSON.parse(data);
              const delta: string | undefined = json.choices?.[0]?.delta?.content;
              if (delta) controller.enqueue(encoder.encode(delta));
            } catch {
              // Partial or non-JSON keepalive line; skip.
            }
          }
        }
        controller.close();
      } catch {
        try {
          controller.close();
        } catch {
          // already closed
        }
      }
    },
    cancel() {
      void reader.cancel().catch(() => {});
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
