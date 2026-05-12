import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { ProgressBar } from "primereact/progressbar";
import hljs from "highlight.js/lib/common";
import { stream as aiStream } from "../../lib/aiClient";

const MODES = [
  { id: "summary", label: "Summary", hint: "What does it do, in plain English" },
  { id: "line", label: "Line-by-line", hint: "Walk through each line" },
  { id: "review", label: "Review", hint: "Bugs, improvements, security" },
];

const buildSystem = (mode) => {
  const base =
    "You are a senior engineer reviewing the snippet. Be precise and avoid filler. Always wrap code samples in fenced markdown blocks with a language tag (```ts, ```py, ```js, etc.).";
  if (mode === "line")
    return `${base} Walk through the code line-by-line. For each meaningful line or block, quote it in a fenced code block then explain what it does and why on the next line.`;
  if (mode === "review")
    return `${base} Review the code: list bugs, edge cases, security issues, and concrete improvements. Group findings under '### Bugs', '### Improvements', '### Security'. Quote any referenced code in fenced blocks.`;
  return `${base} Explain in 3-5 short paragraphs: what it does, the inputs/outputs, and any non-obvious behavior. Quote key snippets in fenced blocks. Skip line-by-line details.`;
};

const escapeHtml = (s) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const detect = (code) => {
  if (!code.trim()) return { language: null, html: "" };
  try {
    const r = hljs.highlightAuto(code);
    return { language: r.language || null, html: r.value };
  } catch {
    return { language: null, html: escapeHtml(code) };
  }
};

const highlight = (code, lang) => {
  if (!code) return "";
  if (lang && hljs.getLanguage(lang)) {
    try {
      return hljs.highlight(code, { language: lang, ignoreIllegals: true }).value;
    } catch {
      /* noop */
    }
  }
  try {
    return hljs.highlightAuto(code).value;
  } catch {
    return escapeHtml(code);
  }
};

const splitBlocks = (text) => {
  if (!text) return [];
  const out = [];
  const re = /```([a-zA-Z0-9+#-]*)\n?([\s\S]*?)```/g;
  let last = 0;
  let m;
  let i = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push({ type: "text", id: i++, content: text.slice(last, m.index) });
    out.push({ type: "code", id: i++, lang: m[1] || null, content: m[2] });
    last = re.lastIndex;
  }
  if (last < text.length) {
    // handle in-progress unterminated fence while streaming
    const tail = text.slice(last);
    const openFence = tail.lastIndexOf("```");
    if (openFence !== -1) {
      const before = tail.slice(0, openFence);
      const rest = tail.slice(openFence + 3);
      const nl = rest.indexOf("\n");
      const lang = nl === -1 ? rest.trim() : rest.slice(0, nl).trim();
      const body = nl === -1 ? "" : rest.slice(nl + 1);
      if (before) out.push({ type: "text", id: i++, content: before });
      out.push({ type: "code", id: i++, lang: lang || null, content: body, partial: true });
    } else {
      out.push({ type: "text", id: i++, content: tail });
    }
  }
  return out;
};

const inline = (s) => {
  const e = escapeHtml(s);
  return e
    .replace(
      /`([^`]+)`/g,
      '<code class="px-1.5 py-0.5 rounded-sm bg-bg-3 border border-line text-accent font-code text-[12.5px]">$1</code>'
    )
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-fg font-semibold">$1</strong>');
};

const Prose = ({ text }) => {
  const lines = text.split("\n");
  return (
    <div className="space-y-1">
      {lines.map((raw, idx) => {
        if (/^###\s+/.test(raw))
          return (
            <div
              key={idx}
              className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent mt-4 mb-1"
            >
              {raw.replace(/^###\s+/, "")}
            </div>
          );
        if (/^##\s+/.test(raw))
          return (
            <div key={idx} className="font-display text-[15px] text-fg mt-4 mb-1">
              {raw.replace(/^##\s+/, "")}
            </div>
          );
        if (/^\s*[-*]\s+/.test(raw)) {
          const content = raw.replace(/^\s*[-*]\s+/, "");
          return (
            <div key={idx} className="flex gap-2 text-[13.5px] text-fg leading-relaxed">
              <span className="text-accent shrink-0 select-none">▸</span>
              <span dangerouslySetInnerHTML={{ __html: inline(content) }} />
            </div>
          );
        }
        if (raw.trim() === "") return <div key={idx} className="h-1" />;
        return (
          <p
            key={idx}
            className="text-[13.5px] text-fg leading-relaxed"
            dangerouslySetInnerHTML={{ __html: inline(raw) }}
          />
        );
      })}
    </div>
  );
};

const CodeBlock = ({ code, lang, partial, onCopy }) => {
  const html = useMemo(() => highlight(code, lang), [code, lang]);
  const detected = useMemo(
    () => (lang || detect(code).language || "plain"),
    [code, lang]
  );
  const lines = code.split("\n");
  const lineCount = Math.max(1, lines[lines.length - 1] === "" ? lines.length - 1 : lines.length);
  return (
    <div className="my-2 panel-2 overflow-hidden">
      <div className="flex items-center justify-between border-b border-line bg-bg-3 px-3 py-1.5">
        <div className="flex items-center gap-2 font-mono text-[10.5px] text-fg-mute uppercase tracking-wider">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
          {detected}
          {partial && <span className="text-fg-mute normal-case">· streaming</span>}
        </div>
        {!partial && (
          <button
            type="button"
            onClick={() =>
              navigator.clipboard.writeText(code).then(() => onCopy?.())
            }
            className="font-mono text-[10.5px] text-fg-mute hover:text-fg flex items-center gap-1"
          >
            <i className="pi pi-copy" style={{ fontSize: 10 }} /> copy
          </button>
        )}
      </div>
      <div className="flex overflow-x-auto">
        <div
          className="select-none shrink-0 border-r border-line bg-bg/40 px-2 py-3 text-right font-code text-[12px] leading-[1.7] text-fg-mute"
          style={{ minWidth: 36 }}
        >
          {Array.from({ length: lineCount }).map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        <pre className="flex-1 px-3 py-3 text-[12.5px] leading-[1.7] font-code">
          <code
            className={`hljs language-${detected}`}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </pre>
      </div>
    </div>
  );
};

const CodeExplain = () => {
  const toast = useRef(null);
  const inputRef = useRef(null);
  const overlayRef = useRef(null);
  const gutterRef = useRef(null);
  const [value, setValue] = useState("");
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState("summary");

  const inputDetected = useMemo(() => detect(value), [value]);
  const lineCount = useMemo(() => Math.max(1, value.split("\n").length), [value]);

  useEffect(() => {
    setOutput("");
  }, [mode]);

  const onScroll = (e) => {
    const t = e.target.scrollTop;
    const l = e.target.scrollLeft;
    if (overlayRef.current) {
      overlayRef.current.scrollTop = t;
      overlayRef.current.scrollLeft = l;
    }
    if (gutterRef.current) gutterRef.current.scrollTop = t;
  };

  const run = async () => {
    if (!value.trim() || isLoading) return;
    setIsLoading(true);
    setOutput("");
    let acc = "";
    try {
      const langHint = inputDetected.language
        ? `Language detected: ${inputDetected.language}.`
        : "";
      for await (const tok of aiStream(value, {
        system: `${buildSystem(mode)} ${langHint}`,
        temperature: 0.3,
      })) {
        acc += tok;
        setOutput(acc);
      }
    } catch (e) {
      console.error(e);
      toast.current?.show({
        severity: "error",
        summary: "Failed",
        detail: e.message || "Please try again.",
        life: 4000,
      });
    }
    setIsLoading(false);
  };

  const copyOutput = () =>
    navigator.clipboard.writeText(output).then(() =>
      toast.current?.show({ severity: "success", summary: "Copied", life: 1200 })
    );
  const fireCopy = () =>
    toast.current?.show({ severity: "success", summary: "Copied", life: 1200 });

  const blocks = useMemo(() => splitBlocks(output), [output]);

  return (
    <div className="animate-fade-up">
      <Toast ref={toast} />

      <div className="flex items-center justify-between mb-3">
        <span className="bracket">Code Explain</span>
        <div className="flex items-center gap-1">
          {MODES.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => setMode(o.id)}
              title={o.hint}
              className={`px-2 py-1 rounded-sm font-mono text-[11px] uppercase tracking-wider border transition ${
                mode === o.id
                  ? "border-accent/40 text-accent bg-accent/5"
                  : "border-line text-fg-dim hover:text-fg hover:border-line-strong"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* INPUT — code editor with line numbers + syntax overlay */}
        <div className="panel overflow-hidden">
          <div className="panel-head">
            <div className="flex items-center gap-2 font-mono text-[11px] text-fg-dim">
              <span className="dot" />
              snippet
              {inputDetected.language && (
                <span className="ml-1 px-1.5 py-0.5 rounded-sm bg-accent/10 border border-accent/30 text-accent text-[10px] uppercase tracking-wider">
                  {inputDetected.language}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 font-mono text-[10.5px] text-fg-mute">
              <span>
                {lineCount} {lineCount === 1 ? "ln" : "ln"}
              </span>
              <span className={value.length >= 6000 ? "text-danger" : ""}>
                {value.length} / 6000
              </span>
              {value && (
                <button
                  onClick={() => {
                    setValue("");
                    setOutput("");
                  }}
                  className="hover:text-fg"
                >
                  clear
                </button>
              )}
            </div>
          </div>

          <div className="relative flex" style={{ height: 360 }}>
            {/* Gutter */}
            <div
              ref={gutterRef}
              className="select-none shrink-0 overflow-hidden border-r border-line bg-bg/40 px-2 py-3 text-right font-code text-[12.5px] leading-[1.7] text-fg-mute"
              style={{ width: 44 }}
            >
              {Array.from({ length: lineCount }).map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>

            {/* Overlay + textarea */}
            <div className="relative flex-1 overflow-hidden">
              <pre
                ref={overlayRef}
                aria-hidden
                className="pointer-events-none absolute inset-0 overflow-auto px-3 py-3 font-code text-[12.5px] leading-[1.7] whitespace-pre-wrap break-words m-0"
              >
                <code
                  className={`hljs language-${inputDetected.language || "plaintext"}`}
                  dangerouslySetInnerHTML={{
                    __html:
                      inputDetected.html ||
                      '<span class="text-fg-mute">// paste any snippet — language is auto-detected</span>',
                  }}
                />
                {/* trailing space to ensure scrollable bottom matches textarea */}
                {"\n "}
              </pre>
              <textarea
                ref={inputRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onScroll={onScroll}
                spellCheck={false}
                placeholder=""
                maxLength={6000}
                className="relative z-10 block w-full h-full resize-none bg-transparent text-transparent caret-accent px-3 py-3 font-code text-[12.5px] leading-[1.7] focus:outline-none whitespace-pre-wrap break-words"
              />
            </div>
          </div>
        </div>

        {/* OUTPUT */}
        <div className="panel overflow-hidden relative">
          <div className="panel-head">
            <div className="flex items-center gap-2 font-mono text-[11px] text-fg-dim">
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{
                  background: isLoading ? "var(--accent)" : "var(--fg-mute)",
                  boxShadow: isLoading ? "0 0 8px rgba(190,242,100,0.6)" : "none",
                }}
              />
              explanation.md
              {isLoading && <span className="shimmer-text ml-1">streaming</span>}
            </div>
            {output && !isLoading && (
              <button
                onClick={copyOutput}
                className="font-mono text-[10.5px] text-fg-dim hover:text-fg flex items-center gap-1.5"
              >
                <i className="pi pi-copy" style={{ fontSize: 10 }} /> copy all
              </button>
            )}
          </div>
          {isLoading && (
            <ProgressBar
              mode="indeterminate"
              style={{ position: "absolute", top: 32, width: "100%" }}
            />
          )}

          <div
            className="px-4 py-4 overflow-y-auto"
            style={{ height: 360 }}
          >
            {!output && !isLoading && (
              <p className="font-mono text-[12px] text-fg-mute">
                Explanation appears here.
              </p>
            )}
            {!output && isLoading && (
              <p className="font-mono text-[12px] text-fg-dim">analysing…</p>
            )}
            <div className="space-y-1">
              {blocks.map((b) =>
                b.type === "code" ? (
                  <CodeBlock
                    key={b.id}
                    code={b.content}
                    lang={b.lang}
                    partial={b.partial}
                    onCopy={fireCopy}
                  />
                ) : (
                  <Prose key={b.id} text={b.content} />
                )
              )}
              {output && isLoading && <span className="caret font-mono text-fg" />}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between rounded-sm border border-line bg-bg-1 px-3 py-2">
        <div className="flex items-center gap-2 font-mono text-[10.5px] text-fg-mute">
          <span className="dot-live" />
          ai.krishtasood.in · mode: {mode}
          {inputDetected.language && (
            <>
              <span>·</span>
              <span>lang: {inputDetected.language}</span>
            </>
          )}
        </div>
        <Button
          label={isLoading ? "Running" : "Explain"}
          loading={isLoading}
          disabled={!value.trim()}
          onClick={run}
          icon="pi pi-play"
        />
      </div>
    </div>
  );
};

export default CodeExplain;
