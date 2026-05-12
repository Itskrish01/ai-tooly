import { useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { stream as aiStream, health } from "../../lib/aiClient";

const SUGGESTIONS = [
  "Explain WebSockets in 3 bullet points.",
  "Write a haiku about static electricity.",
  "Summarise the OWASP Top 10.",
  "Refactor: turn this for-loop into a map().",
];

const ImageGen = () => {
  // The new AI backend doesn't generate images, so this tab is a
  // streaming chat playground against the same AI that powers the
  // other tools.
  const toast = useRef(null);
  const scrollRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState("");

  useEffect(() => {
    health()
      .then((h) => setModel(h?.defaultModel || h?.ollama?.defaultModel || ""))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const send = async (text) => {
    const trimmed = (text ?? input).trim();
    if (!trimmed || isLoading) return;
    const next = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    setIsLoading(true);

    let acc = "";
    setMessages((m) => [...m, { role: "assistant", content: "" }]);
    try {
      for await (const token of aiStream(next, {
        system:
          "You are a concise, helpful AI assistant. Use markdown only when it clarifies the answer.",
        temperature: 0.5,
      })) {
        acc += token;
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "assistant", content: acc };
          return copy;
        });
      }
    } catch (error) {
      console.error(error);
      toast.current?.show({
        severity: "error",
        summary: "Chat failed",
        detail: error.message || "Please try again later.",
        life: 4000,
      });
    }
    setIsLoading(false);
  };

  const reset = () => {
    setMessages([]);
    setInput("");
  };

  return (
    <div>
      <Toast ref={toast} />

      <div className="surface overflow-hidden">
        <div className="flex items-center justify-between border-b border-line bg-bg-1 px-4 py-2.5">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-fg-mute font-mono">
            <span>Chat</span>
            {model && (
              <>
                <span>·</span>
                <span className="normal-case tracking-normal">{model}</span>
              </>
            )}
          </div>
          {messages.length > 0 && (
            <button
              type="button"
              onClick={reset}
              className="text-xs text-fg-dim hover:text-fg transition"
            >
              Clear
            </button>
          )}
        </div>

        <div
          ref={scrollRef}
          className="h-[58vh] overflow-y-auto px-4 sm:px-6 py-6 space-y-5"
        >
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="grid h-12 w-12 place-items-center rounded-md border border-line bg-bg-1 mb-4">
                <i
                  className="pi pi-comments text-fg-mute"
                  style={{ fontSize: 16 }}
                />
              </div>
              <p className="text-sm text-fg">Ask anything</p>
              <p className="mt-1 text-xs text-fg-mute max-w-sm">
                Streaming chat against ai.krishtasood.in. Pick a suggestion or
                type a prompt below.
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-1.5">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="px-2.5 py-1 rounded-md text-xs border border-line bg-bg-1 text-fg-dim hover:text-fg hover:bg-bg-2 transition"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className="flex gap-3">
              <div
                className={`mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-md border ${
                  m.role === "user"
                    ? "border-line bg-bg-2 text-fg"
                    : "border-accent/30 bg-accent/10 text-accent"
                }`}
              >
                <i
                  className={m.role === "user" ? "pi pi-user" : "pi pi-sparkles"}
                  style={{ fontSize: 11 }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] uppercase tracking-wider text-fg-mute font-mono mb-1">
                  {m.role === "user" ? "You" : "Assistant"}
                </div>
                <div className="text-sm leading-relaxed text-fg whitespace-pre-wrap break-words">
                  {m.content || <span className="shimmer-text">thinking…</span>}
                </div>
              </div>
            </div>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="border-t border-line bg-bg-1 p-3 flex items-center gap-2"
        >
          <span className="p-input-icon-left flex-1">
            <i className="pi pi-arrow-right" style={{ fontSize: 12 }} />
            <InputText
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the model anything…"
              style={{ width: "100%" }}
              disabled={isLoading}
            />
          </span>
          <Button
            type="submit"
            label={isLoading ? "Sending" : "Send"}
            loading={isLoading}
            disabled={!input.trim()}
            icon="pi pi-send"
          />
        </form>
      </div>
    </div>
  );
};

export default ImageGen;
