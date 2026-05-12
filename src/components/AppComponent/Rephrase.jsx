import { useRef, useState } from "react";
import { ProgressBar } from "primereact/progressbar";
import { Button } from "primereact/button";
import axios from "axios";
import { Toast } from "primereact/toast";

const PRESETS = [
  { id: "standard", label: "Standard", hint: "Balanced rewrite" },
  { id: "concise", label: "Concise", hint: "Shorter & punchier" },
  { id: "formal", label: "Formal", hint: "Professional tone" },
  { id: "casual", label: "Casual", hint: "Friendly tone" },
];

const Rephrase = () => {
  const toast = useRef(null);
  const textareaRef = useRef(null);

  const [value, setValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState("");
  const [tone, setTone] = useState("standard");

  const options = {
    method: "POST",
    url: "https://paraphraser1.p.rapidapi.com/",
    headers: {
      "content-type": "application/json",
      "X-RapidAPI-Key": "a244a76a06msh533558e4eb0c0e0p1a2050jsn84873ca3f3a9",
      "X-RapidAPI-Host": "paraphraser1.p.rapidapi.com",
    },
    data: { input: value },
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setIsLoading(true);
    try {
      const response = await axios.request(options);
      setResult(response.data.output);
    } catch (error) {
      console.error(error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Something went wrong. Please try again later.",
        life: 3000,
      });
    }
    setIsLoading(false);
  };

  const handleChange = (event) => {
    setValue(event.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  return (
    <div>
      <Toast ref={toast} />

      {/* Preset row */}
      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        <span className="text-[11px] uppercase tracking-wider text-fg-mute font-mono mr-2">
          Tone
        </span>
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setTone(p.id)}
            className={`px-2.5 py-1 rounded-md text-xs border transition ${
              tone === p.id
                ? "bg-accent/10 border-accent/40 text-fg"
                : "border-line bg-bg-1 text-fg-dim hover:text-fg hover:bg-bg-2"
            }`}
            title={p.hint}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input card */}
        <div className="surface overflow-hidden">
          <div className="flex items-center justify-between border-b border-line bg-bg-1 px-4 py-2.5">
            <span className="text-[11px] uppercase tracking-wider text-fg-mute font-mono">
              Input
            </span>
            <div className="flex items-center gap-3 text-[11px] font-mono text-fg-mute">
              <span className={value.length === 1000 ? "text-red-400" : ""}>
                {value.length} / 1000
              </span>
              {value && (
                <button
                  type="button"
                  onClick={() => {
                    setValue("");
                    setResult("");
                  }}
                  className="text-fg-dim hover:text-fg transition"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            placeholder="Paste a sentence or paragraph to rephrase…"
            maxLength={1000}
            className="w-full resize-none bg-transparent px-4 py-4 text-base leading-relaxed text-fg placeholder:text-fg-mute focus:outline-none min-h-[260px]"
          />
        </div>

        {/* Output card */}
        <div className="surface overflow-hidden relative">
          <div className="flex items-center justify-between border-b border-line bg-bg-1 px-4 py-2.5">
            <span className="text-[11px] uppercase tracking-wider text-fg-mute font-mono flex items-center gap-2">
              Output
              {isLoading && <span className="shimmer-text">processing</span>}
            </span>
            {result && !isLoading && (
              <button
                type="button"
                className="inline-flex items-center gap-1.5 text-xs text-fg-dim hover:text-fg transition"
                onClick={() =>
                  navigator.clipboard.writeText(result).then(() =>
                    toast.current?.show({
                      severity: "success",
                      summary: "Copied",
                      detail: "Copied to clipboard",
                      life: 2000,
                    })
                  )
                }
              >
                <i className="pi pi-copy" style={{ fontSize: 11 }} />
                Copy
              </button>
            )}
          </div>
          {isLoading && (
            <ProgressBar
              mode="indeterminate"
              style={{ height: 2, position: "absolute", top: 41, width: "100%" }}
            />
          )}
          <textarea
            value={result}
            placeholder={
              isLoading ? "Rewriting…" : "Your rephrased text will appear here."
            }
            disabled
            className="w-full resize-none bg-transparent px-4 py-4 text-base leading-relaxed text-fg placeholder:text-fg-mute focus:outline-none min-h-[260px]"
          />
        </div>
      </div>

      {/* Action bar */}
      <div className="mt-4 flex items-center justify-between rounded-lg border border-line bg-bg-1 px-3 py-2.5">
        <div className="flex items-center gap-2 text-[11px] text-fg-mute font-mono">
          <span className="dot-pulse" />
          model: paraphraser-v1 · tone: {tone}
        </div>
        <Button
          label={isLoading ? "Rephrasing" : "Rephrase"}
          disabled={!value}
          onClick={handleSubmit}
          loading={isLoading}
          icon="pi pi-bolt"
        />
      </div>
    </div>
  );
};

export default Rephrase;
