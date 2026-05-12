import { useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { ProgressBar } from "primereact/progressbar";
import { stream as aiStream } from "../../lib/aiClient";

/**
 * StreamTool — generic two-pane streaming AI tool used by Summarize,
 * GrammarFix, CodeExplain, etc.
 *
 * Props:
 *   eyebrow         e.g. "[ SUMMARIZE ]"
 *   title           plain heading for accessibility
 *   inputLabel      e.g. "input.txt"
 *   outputLabel     e.g. "summary.md"
 *   placeholder     placeholder for the textarea
 *   actionLabel     e.g. "Summarize"
 *   buildSystem(opts) -> string  given current options, return system prompt
 *   options         optional array of { id, label, hint } to render as
 *                   selectable chips above the input
 *   defaultOption   id of the default option
 *   maxLength       textarea maxLength (default 4000)
 *   monoOutput      render output in mono font (good for code)
 */
const StreamTool = ({
  eyebrow,
  inputLabel = "input",
  outputLabel = "output",
  placeholder = "Paste text…",
  actionLabel = "Run",
  buildSystem,
  options = [],
  defaultOption,
  maxLength = 4000,
  monoOutput = false,
}) => {
  const toast = useRef(null);
  const inputRef = useRef(null);
  const [value, setValue] = useState("");
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [opt, setOpt] = useState(defaultOption || options[0]?.id);

  useEffect(() => {
    setOutput("");
  }, [opt]);

  const onChange = (e) => {
    setValue(e.target.value);
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  };

  const run = async () => {
    if (!value.trim() || isLoading) return;
    setIsLoading(true);
    setOutput("");
    let acc = "";
    try {
      const system = buildSystem({ option: opt });
      for await (const token of aiStream(value, { system, temperature: 0.3 })) {
        acc += token;
        setOutput(acc);
      }
    } catch (error) {
      console.error(error);
      toast.current?.show({
        severity: "error",
        summary: "Failed",
        detail: error.message || "Please try again later.",
        life: 4000,
      });
    }
    setIsLoading(false);
  };

  const copy = () =>
    navigator.clipboard.writeText(output).then(() =>
      toast.current?.show({
        severity: "success",
        summary: "Copied",
        detail: "Copied to clipboard",
        life: 1800,
      })
    );

  return (
    <div className="animate-fade-up">
      <Toast ref={toast} />

      {/* Eyebrow */}
      <div className="flex items-center justify-between mb-3">
        <span className="bracket">{eyebrow}</span>
        {options.length > 0 && (
          <div className="flex items-center gap-1">
            {options.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => setOpt(o.id)}
                title={o.hint}
                className={`px-2 py-1 rounded-sm font-mono text-[11px] uppercase tracking-wider border transition ${
                  opt === o.id
                    ? "border-accent/40 text-accent bg-accent/5"
                    : "border-line text-fg-dim hover:text-fg hover:border-line-strong"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Input */}
        <div className="panel overflow-hidden">
          <div className="panel-head">
            <div className="flex items-center gap-2 font-mono text-[11px] text-fg-dim">
              <span className="dot" />
              <span>{inputLabel}</span>
            </div>
            <div className="flex items-center gap-3 font-mono text-[10.5px] text-fg-mute">
              <span className={value.length === maxLength ? "text-danger" : ""}>
                {value.length} / {maxLength}
              </span>
              {value && (
                <button
                  type="button"
                  onClick={() => {
                    setValue("");
                    setOutput("");
                  }}
                  className="hover:text-fg transition"
                >
                  clear
                </button>
              )}
            </div>
          </div>
          <textarea
            ref={inputRef}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            maxLength={maxLength}
            className="w-full resize-none bg-transparent px-4 py-4 text-[14px] leading-relaxed text-fg placeholder:text-fg-mute focus:outline-none min-h-[280px]"
          />
        </div>

        {/* Output */}
        <div className="panel overflow-hidden relative">
          <div className="panel-head">
            <div className="flex items-center gap-2 font-mono text-[11px] text-fg-dim">
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{
                  background: isLoading ? "var(--accent)" : "var(--fg-mute)",
                  boxShadow: isLoading
                    ? "0 0 8px rgba(190,242,100,0.6)"
                    : "none",
                }}
              />
              <span>{outputLabel}</span>
              {isLoading && (
                <span className="shimmer-text ml-1">streaming</span>
              )}
            </div>
            {output && !isLoading && (
              <button
                type="button"
                onClick={copy}
                className="font-mono text-[10.5px] text-fg-dim hover:text-fg transition flex items-center gap-1.5"
              >
                <i className="pi pi-copy" style={{ fontSize: 10 }} />
                copy
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
            className={`px-4 py-4 text-[14px] leading-relaxed whitespace-pre-wrap break-words min-h-[280px] ${
              monoOutput ? "font-mono text-[13px]" : ""
            } ${output ? "text-fg" : "text-fg-mute"}`}
          >
            {output ? (
              <>
                {output}
                {isLoading && <span className="caret" />}
              </>
            ) : isLoading ? (
              <span className="text-fg-dim">working…</span>
            ) : (
              "Output will appear here."
            )}
          </div>
        </div>
      </div>

      {/* Action */}
      <div className="mt-3 flex items-center justify-between rounded-sm border border-line bg-bg-1 px-3 py-2">
        <div className="flex items-center gap-2 font-mono text-[10.5px] text-fg-mute">
          <span className="dot-live" />
          ai.krishtasood.in {opt ? `· mode: ${opt}` : ""}
        </div>
        <Button
          label={isLoading ? "Running" : actionLabel}
          loading={isLoading}
          disabled={!value.trim()}
          onClick={run}
          icon="pi pi-play"
        />
      </div>
    </div>
  );
};

export default StreamTool;
