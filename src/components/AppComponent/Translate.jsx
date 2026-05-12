import { useEffect, useRef, useState } from "react";
import { Languages } from "../../data/languages";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { v4 as uuidv4 } from "uuid";
import { Sidebar } from "primereact/sidebar";
import { ProgressBar } from "primereact/progressbar";
import { stream as aiStream } from "../../lib/aiClient";

const QUICK = [
  { label: "English", langcode: "en" },
  { label: "Hindi", langcode: "hi" },
  { label: "Japanese", langcode: "ja" },
  { label: "Spanish", langcode: "es" },
  { label: "French", langcode: "fr" },
  { label: "German", langcode: "de" },
];

const Translate = () => {
  const toast = useRef(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const [from, setFrom] = useState({ label: "English", langcode: "en" });
  const [to, setTo] = useState({ label: "Hindi", langcode: "hi" });
  const [translations, setTranslations] = useState([]);
  const [output, setOutput] = useState("");
  const [value, setValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("translations");
    if (stored) setTranslations(JSON.parse(stored));
  }, [output]);

  const save = (entry) => {
    const stored = localStorage.getItem("translations");
    const arr = stored ? JSON.parse(stored) : [];
    arr.unshift(entry);
    localStorage.setItem("translations", JSON.stringify(arr.slice(0, 100)));
  };

  const remove = (id) => {
    const arr = (JSON.parse(localStorage.getItem("translations") || "[]")).filter(
      (t) => t.id !== id
    );
    localStorage.setItem("translations", JSON.stringify(arr));
    setTranslations(arr);
  };

  const clearAll = () => {
    localStorage.removeItem("translations");
    setTranslations([]);
    toast.current?.show({
      severity: "success",
      summary: "Cleared",
      detail: "History wiped.",
      life: 2000,
    });
  };

  const swap = () => {
    setFrom(to);
    setTo(from);
    if (output) {
      setValue(output);
      setOutput(value);
    }
  };

  const submit = async () => {
    if (!value.trim() || isLoading) return;
    setIsLoading(true);
    setOutput("");
    let acc = "";
    const system = `You are a professional translator. Translate the user text from ${from.label} to ${to.label}. Return ONLY the translated text. No explanations, no quotes, no language labels.`;
    try {
      for await (const tok of aiStream(value, { system, temperature: 0.2 })) {
        acc += tok;
        setOutput(acc);
      }
      save({
        id: uuidv4(),
        translation: acc.trim(),
        value,
        sourcelang: from.label,
        targetlang: to.label,
      });
    } catch (e) {
      console.error(e);
      toast.current?.show({
        severity: "error",
        summary: "Translation failed",
        detail: e.message || "Check the AI service.",
        life: 4000,
      });
    }
    setIsLoading(false);
  };

  const renderPicker = (visible, setVisible, current, onPick) => (
    <Sidebar visible={visible} fullScreen onHide={() => setVisible(false)}>
      <div className="bg-bg min-h-screen">
        <div className="border-b border-line px-6 py-5">
          <div className="bracket mb-3">Select Language</div>
          <input
            autoFocus
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="search…"
            className="w-full bg-transparent font-mono text-base text-fg placeholder:text-fg-mute focus:outline-none caret-accent"
          />
        </div>
        <div className="px-6 py-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-1.5">
          {Languages.filter((l) =>
            l.label.toLowerCase().includes(filter.toLowerCase())
          ).map((l) => {
            const active = l.label === current.label;
            return (
              <button
                key={l.langcode}
                onClick={() => {
                  onPick(l);
                  setVisible(false);
                  setFilter("");
                }}
                className={`text-left px-3 py-2 rounded-sm border font-mono text-[12px] transition ${
                  active
                    ? "border-accent/40 bg-accent/10 text-accent"
                    : "border-line text-fg-dim hover:text-fg hover:bg-bg-2"
                }`}
              >
                <span className="text-fg-mute mr-2">{l.langcode}</span>
                {l.label}
              </button>
            );
          })}
        </div>
      </div>
    </Sidebar>
  );

  const Chip = ({ lang, onClick, prefix }) => (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-sm border border-line bg-bg-2 px-2.5 py-1 font-mono text-[11px] text-fg hover:border-line-strong transition"
    >
      <span className="text-fg-mute uppercase tracking-wider text-[9.5px]">
        {prefix}
      </span>
      <span className="text-accent">{lang.langcode}</span>
      <span className="text-fg-dim">{lang.label}</span>
      <i className="pi pi-chevron-down text-fg-mute" style={{ fontSize: 8 }} />
    </button>
  );

  return (
    <div className="animate-fade-up">
      <Toast ref={toast} />
      {renderPicker(fromOpen, setFromOpen, from, setFrom)}
      {renderPicker(toOpen, setToOpen, to, setTo)}

      <Sidebar
        visible={historyOpen}
        position="right"
        style={{ width: 460 }}
        onHide={() => setHistoryOpen(false)}
      >
        <div className="bg-bg min-h-screen">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <div>
              <div className="bracket">History</div>
              <p className="font-mono text-[11px] text-fg-mute mt-1">
                {translations.length} entries · localStorage
              </p>
            </div>
            {translations.length > 0 && (
              <button
                onClick={clearAll}
                className="font-mono text-[11px] text-danger hover:opacity-80"
              >
                wipe
              </button>
            )}
          </div>
          <div className="overflow-y-auto h-[calc(100vh-72px)]">
            {translations.length === 0 ? (
              <div className="px-5 py-16 text-center font-mono text-[11px] text-fg-mute">
                no translations yet
              </div>
            ) : (
              translations.map((t) => (
                <div
                  key={t.id}
                  onClick={() => {
                    setValue(t.value);
                    setOutput(t.translation);
                  }}
                  className="group cursor-pointer border-b border-line/60 px-5 py-3 hover:bg-bg-1 transition"
                >
                  <div className="flex items-center justify-between font-mono text-[10.5px] text-fg-mute uppercase tracking-wider">
                    <span>
                      {t.sourcelang}{" "}
                      <span className="text-accent">→</span> {t.targetlang}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        remove(t.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 hover:text-danger"
                    >
                      <i className="pi pi-trash" style={{ fontSize: 10 }} />
                    </button>
                  </div>
                  <p className="mt-2 text-[13px] text-fg leading-relaxed">
                    {t.value}
                  </p>
                  <p className="mt-1 text-[13px] text-fg-dim leading-relaxed">
                    {t.translation}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </Sidebar>

      {/* Eyebrow */}
      <div className="flex items-center justify-between mb-3">
        <span className="bracket">Translate</span>
        <button
          onClick={() => setHistoryOpen(true)}
          className="inline-flex items-center gap-1.5 font-mono text-[11px] text-fg-dim hover:text-fg transition"
        >
          <i className="pi pi-history" style={{ fontSize: 11 }} />
          history ({translations.length})
        </button>
      </div>

      {/* Lang bar */}
      <div className="panel mb-3">
        <div className="flex items-center justify-between px-3 py-2.5">
          <div className="flex items-center gap-2">
            <Chip lang={from} prefix="from" onClick={() => setFromOpen(true)} />
            <button
              onClick={swap}
              title="Swap"
              className="grid h-7 w-7 place-items-center rounded-sm text-fg-dim hover:text-accent hover:bg-bg-2 transition"
            >
              <i className="pi pi-arrow-right-arrow-left" style={{ fontSize: 11 }} />
            </button>
            <Chip lang={to} prefix="to" onClick={() => setToOpen(true)} />
          </div>
          <div className="font-mono text-[10.5px] text-fg-mute">
            {value.length} / 1000
          </div>
        </div>
      </div>

      {/* Editors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="panel overflow-hidden">
          <div className="panel-head">
            <div className="flex items-center gap-2 font-mono text-[11px] text-fg-dim">
              <span className="dot" /> source.{from.langcode}
            </div>
            {value && (
              <button
                onClick={() => {
                  setValue("");
                  setOutput("");
                }}
                className="font-mono text-[10.5px] text-fg-mute hover:text-fg"
              >
                clear
              </button>
            )}
          </div>
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={`type in ${from.label}…`}
            maxLength={1000}
            className="w-full resize-none bg-transparent px-4 py-4 text-[15px] leading-relaxed text-fg placeholder:text-fg-mute focus:outline-none min-h-[260px]"
          />
        </div>

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
              target.{to.langcode}
              {isLoading && <span className="shimmer-text ml-1">streaming</span>}
            </div>
            {output && !isLoading && (
              <button
                onClick={() =>
                  navigator.clipboard
                    .writeText(output)
                    .then(() =>
                      toast.current?.show({
                        severity: "success",
                        summary: "Copied",
                        life: 1500,
                      })
                    )
                }
                className="flex items-center gap-1.5 font-mono text-[10.5px] text-fg-dim hover:text-fg"
              >
                <i className="pi pi-copy" style={{ fontSize: 10 }} /> copy
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
            className={`px-4 py-4 text-[15px] leading-relaxed whitespace-pre-wrap min-h-[260px] ${
              output ? "text-fg" : "text-fg-mute"
            }`}
          >
            {output ? (
              <>
                {output}
                {isLoading && <span className="caret" />}
              </>
            ) : isLoading ? (
              <span className="text-fg-dim">translating…</span>
            ) : (
              "translation appears here."
            )}
          </div>
        </div>
      </div>

      {/* Action */}
      <div className="mt-3 flex items-center justify-between rounded-sm border border-line bg-bg-1 px-3 py-2">
        <div className="flex items-center gap-2 font-mono text-[10.5px] text-fg-mute">
          <span className="dot-live" />
          ai.krishtasood.in · temp 0.2
        </div>
        <Button
          label={isLoading ? "Translating" : "Translate"}
          loading={isLoading}
          disabled={!value.trim()}
          onClick={submit}
          icon="pi pi-arrow-right"
          iconPos="right"
        />
      </div>
    </div>
  );
};

export default Translate;
