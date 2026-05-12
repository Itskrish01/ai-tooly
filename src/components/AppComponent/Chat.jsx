import { useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { stream as aiStream } from "../../lib/aiClient";

const SUGGESTIONS = [
  "Explain WebSockets in 3 bullet points.",
  "Write a haiku about static electricity.",
  "Summarise the OWASP Top 10.",
  "Refactor: turn this for-loop into a map().",
];

const Chat = () => {
  const toast = useRef(null);
  const scrollRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const ctrlRef = useRef(null);

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
    const ctrl = new AbortController();
    ctrlRef.current = ctrl;
    try {
      for await (const token of aiStream(next, {
        system:
          "You are a concise, helpful AI assistant. Use markdown only when it clarifies the answer. Keep code in fenced blocks.",
        temperature: 0.5,
        signal: ctrl.signal,
      })) {
        acc += token;
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "assistant", content: acc };
          return copy;
        });
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error(error);
        toast.current?.show({
          severity: "error",
          summary: "Chat failed",
          detail: error.message || "Please try again later.",
          life: 4000,
        });
      }
    }
    setIsLoading(false);
    ctrlRef.current = null;
  };

  const stop = () => {
    ctrlRef.current?.abort();
    setIsLoading(false);
  };

  const reset = () => {
    if (isLoading) ctrlRef.current?.abort();
    setMessages([]);
    setInput("");
  };

  return (
    <div className="animate-fade-up">
      <Toast ref={toast} />

      <div className="flex items-center justify-between mb-3">
        <span className="bracket">Chat</span>
        {messages.length > 0 && (
          <button
            onClick={reset}
            className="font-mono text-[11px] text-fg-dim hover:text-fg transition"
          >
            new session
          </button>
        )}
      </div>

      <div className="panel overflow-hidden">
        {/* Conversation */}
        <div
          ref={scrollRef}
          className="h-[60vh] overflow-y-auto px-4 sm:px-6 py-6 space-y-5"
        >
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="grid h-10 w-10 place-items-center rounded-sm border border-line bg-bg-2 mb-4">
                <i
                  className="pi pi-comments text-accent"
                  style={{ fontSize: 14 }}
                />
              </div>
              <div className="bracket">Start a conversation</div>
              <p className="mt-2 font-mono text-[11px] text-fg-mute max-w-sm">
                streaming · stateless · runs on ai.krishtasood.in
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-1.5 max-w-xl">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="px-2.5 py-1 rounded-sm border border-line bg-bg-2 font-mono text-[11px] text-fg-dim hover:text-fg hover:border-line-strong transition"
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
                className={`mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-sm border ${
                  m.role === "user"
                    ? "border-line bg-bg-2 text-fg"
                    : "border-accent/30 bg-accent/10 text-accent"
                }`}
              >
                <i
                  className={
                    m.role === "user" ? "pi pi-user" : "pi pi-sparkles"
                  }
                  style={{ fontSize: 11 }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-mono text-[10.5px] uppercase tracking-wider text-fg-mute mb-1">
                  {m.role === "user" ? "user" : "assistant"}
                </div>
                <div className="text-[14px] leading-relaxed text-fg whitespace-pre-wrap break-words">
                  {m.content || (
                    <span className="shimmer-text">thinking…</span>
                  )}
                  {isLoading && i === messages.length - 1 && m.content && (
                    <span className="caret" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Composer */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="border-t border-line bg-bg-1 p-3 flex items-center gap-2"
        >
          <span className="p-input-icon-left flex-1">
            <i className="pi pi-angle-right" style={{ fontSize: 12 }} />
            <InputText
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="ask anything…"
              style={{ width: "100%" }}
              disabled={isLoading}
            />
          </span>
          {isLoading ? (
            <Button
              type="button"
              label="Stop"
              onClick={stop}
              outlined
              icon="pi pi-stop-circle"
            />
          ) : (
            <Button
              type="submit"
              label="Send"
              disabled={!input.trim()}
              icon="pi pi-send"
            />
          )}
        </form>
      </div>
    </div>
  );
};

export default Chat;
