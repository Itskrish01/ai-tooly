// Local AI client for the Ollama-backed API at AI_URL.
// Reads VITE_AI_URL, VITE_AI_KEY, VITE_AI_MODEL from .env.
//
// SECURITY NOTE: this ships the API key to the browser. It is acceptable
// for a local dev tool talking to http://localhost:5050. For production,
// route requests through a server-side proxy and never expose the real key.

const BASE_URL = import.meta.env.VITE_AI_URL || "https://ai.krishtasood.in";
const API_KEY = import.meta.env.VITE_AI_KEY || "";
const DEFAULT_MODEL = import.meta.env.VITE_AI_MODEL || "gemma3:e2b";

function headers() {
  const h = { "Content-Type": "application/json" };
  if (API_KEY) h.Authorization = `Bearer ${API_KEY}`;
  return h;
}

async function parseError(res) {
  try {
    const j = await res.json();
    return new Error(j.message || j.error || res.statusText);
  } catch {
    return new Error(`${res.status} ${res.statusText}`);
  }
}

/**
 * Single-turn chat.
 * @param {string} message
 * @param {{system?:string, model?:string, temperature?:number, signal?:AbortSignal}} opts
 * @returns {Promise<{response:string, model:string}>}
 */
export async function chat(message, opts = {}) {
  const res = await fetch(`${BASE_URL}/api/chat`, {
    method: "POST",
    headers: headers(),
    signal: opts.signal,
    body: JSON.stringify({
      message,
      system: opts.system,
      model: opts.model || DEFAULT_MODEL,
      temperature: opts.temperature ?? 0.3,
      options: opts.options,
    }),
  });
  if (!res.ok) throw await parseError(res);
  return res.json();
}

/**
 * Multi-turn messages.
 * @param {Array<{role:string,content:string}>} messages
 */
export async function messages(messages, opts = {}) {
  const res = await fetch(`${BASE_URL}/api/messages`, {
    method: "POST",
    headers: headers(),
    signal: opts.signal,
    body: JSON.stringify({
      messages,
      model: opts.model || DEFAULT_MODEL,
      temperature: opts.temperature ?? 0.3,
    }),
  });
  if (!res.ok) throw await parseError(res);
  return res.json();
}

/**
 * Async generator that yields tokens as they stream.
 */
export async function* stream(input, opts = {}) {
  const body =
    typeof input === "string"
      ? {
          message: input,
          system: opts.system,
          model: opts.model || DEFAULT_MODEL,
          temperature: opts.temperature ?? 0.3,
        }
      : {
          messages: input,
          model: opts.model || DEFAULT_MODEL,
          temperature: opts.temperature ?? 0.3,
        };

  const res = await fetch(`${BASE_URL}/api/chat/stream`, {
    method: "POST",
    headers: headers(),
    signal: opts.signal,
    body: JSON.stringify(body),
  });
  if (!res.ok || !res.body) throw await parseError(res);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split("\n\n");
    buffer = events.pop() ?? "";
    for (const evt of events) {
      const lines = evt.split("\n");
      const event = lines.find((l) => l.startsWith("event: "))?.slice(7);
      const data = lines.find((l) => l.startsWith("data: "))?.slice(6);
      if (!data) continue;
      let parsed;
      try {
        parsed = JSON.parse(data);
      } catch {
        continue;
      }
      if (event === "token" && parsed.content) yield parsed.content;
      if (event === "done") return;
      if (event === "error") throw new Error(parsed.message || "stream error");
    }
  }
}

/** Quick health probe. */
export async function health() {
  const res = await fetch(`${BASE_URL}/health`);
  return res.json();
}

export const ai = { chat, messages, stream, health, BASE_URL, DEFAULT_MODEL };
export default ai;
