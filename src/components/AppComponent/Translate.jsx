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
];

const Translate = () => {
  const toast = useRef(null);
  const textareaRef = useRef(null);

  const [fromLanguage, setFromLanguage] = useState(QUICK);
  const [toLanguage, setToLanguage] = useState([
    { label: "English", langcode: "en" },
    { label: "Hindi", langcode: "hi" },
    { label: "Japanese", langcode: "ja" },
    { label: "Spanish", langcode: "es" },
    { label: "French", langcode: "fr" },
  ]);

  const [historyOpen, setHistoryOpen] = useState(false);
  const [fromPickerOpen, setFromPickerOpen] = useState(false);
  const [toPickerOpen, setToPickerOpen] = useState(false);
  const [filterWord, setFilterWord] = useState("");

  const [activeLanguage, setActiveLanguage] = useState(QUICK[0]);
  const [activeLanguage2, setActiveLanguage2] = useState({
    label: "Hindi",
    langcode: "hi",
  });

  const [translations, setTranslations] = useState([]);
  const [translateResult, setTranslationResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFocus, setIsFocus] = useState(false);
  const [value, setValue] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("translations");
    if (stored) setTranslations(JSON.parse(stored));
  }, [translateResult]);

  const clearLocalStorage = () => {
    localStorage.removeItem("translations");
    setTranslations([]);
    toast.current?.show({
      severity: "success",
      summary: "Cleared",
      detail: "Translation history cleared.",
      life: 2500,
    });
  };

  const saveTranslationToLocalStorage = (translation) => {
    const stored = localStorage.getItem("translations");
    let arr = stored ? JSON.parse(stored) : [];
    const exists = arr.find(
      (t) =>
        t.id === translation.id &&
        t.sourcelang === translation.sourcelang &&
        t.targetlang === translation.targetlang
    );
    if (!exists) {
      arr.unshift(translation);
      localStorage.setItem("translations", JSON.stringify(arr));
    }
  };

  const deleteTranslationFromLocalStorage = (id) => {
    const stored = localStorage.getItem("translations");
    if (!stored) return;
    let arr = JSON.parse(stored).filter((t) => t.id !== id);
    localStorage.setItem("translations", JSON.stringify(arr));
    setTranslations(arr);
  };

  const swapLanguages = () => {
    const a = activeLanguage;
    const b = activeLanguage2;
    setActiveLanguage(b);
    setActiveLanguage2(a);
    if (translateResult) {
      setValue(translateResult);
      setTranslationResult(value);
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setIsLoading(true);
    setTranslationResult("");
    let acc = "";
    const system = `You are a professional translator. Translate the user text from ${activeLanguage.label} to ${activeLanguage2.label}. Return ONLY the translated text. No explanations, no quotes, no language labels, no preamble.`;
    try {
      for await (const token of aiStream(value, { system, temperature: 0.2 })) {
        acc += token;
        setTranslationResult(acc);
      }
      const translationObject = {
        id: uuidv4(),
        translation: acc.trim(),
        value,
        sourcelang: activeLanguage.label,
        targetlang: activeLanguage2.label,
      };
      saveTranslationToLocalStorage(translationObject);
    } catch (error) {
      console.error(error);
      toast.current?.show({
        severity: "error",
        summary: "Translation failed",
        detail: error.message || "Please check the AI service is reachable.",
        life: 5000,
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

  const onPickFrom = (lang) => {
    if (!fromLanguage.find((l) => l.langcode === lang.langcode)) {
      setFromLanguage([lang, ...fromLanguage.slice(0, fromLanguage.length - 1)]);
    }
    setActiveLanguage(lang);
    setTimeout(() => {
      setFromPickerOpen(false);
      setFilterWord("");
    }, 150);
  };

  const onPickTo = (lang) => {
    if (!toLanguage.find((l) => l.langcode === lang.langcode)) {
      setToLanguage([lang, ...toLanguage.slice(0, toLanguage.length - 1)]);
    }
    setActiveLanguage2(lang);
    setTimeout(() => {
      setToPickerOpen(false);
      setFilterWord("");
    }, 150);
  };

  const renderPicker = (visible, setVisible, onPick, current) => (
    <Sidebar visible={visible} fullScreen onHide={() => setVisible(false)}>
      <div className="bg-bg min-h-screen">
        <div className="border-b border-line">
          <input
            type="text"
            placeholder="Search language…"
            value={filterWord}
            onChange={(e) => setFilterWord(e.target.value)}
            className="w-full bg-transparent px-6 py-5 text-sm text-fg placeholder:text-fg-mute focus:outline-none"
            autoFocus
          />
        </div>
        <div className="px-6 py-6">
          <div className="grid grid-cols-2 gap-1.5 md:grid-cols-4 lg:grid-cols-6">
            {Languages.filter((item) =>
              item.label
                .toLowerCase()
                .includes(filterWord.toLowerCase())
            ).map((language) => {
              const isActive = language.label === current?.label;
              return (
                <button
                  type="button"
                  key={language.langcode}
                  onClick={() => onPick(language)}
                  className={`text-left px-3 py-2 rounded-md text-sm border transition ${
                    isActive
                      ? "bg-accent/10 border-accent/40 text-fg"
                      : "border-line text-fg-dim hover:text-fg hover:bg-bg-1"
                  }`}
                >
                  {language.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Sidebar>
  );

  const LangChip = ({ lang, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-md border border-line bg-bg-2 px-2.5 py-1 text-xs text-fg hover:bg-bg-3 transition"
    >
      <span className="font-mono uppercase tracking-wider text-fg-mute text-[10px]">
        {lang?.langcode || "—"}
      </span>
      <span>{lang?.label || "Select"}</span>
      <i className="pi pi-chevron-down text-fg-mute" style={{ fontSize: 9 }} />
    </button>
  );

  return (
    <>
      {renderPicker(fromPickerOpen, setFromPickerOpen, onPickFrom, activeLanguage)}
      {renderPicker(toPickerOpen, setToPickerOpen, onPickTo, activeLanguage2)}

      <Sidebar
        visible={historyOpen}
        position="right"
        style={{ width: 460 }}
        onHide={() => setHistoryOpen(false)}
      >
        <div className="bg-bg min-h-screen">
          <div className="flex items-center justify-between px-5 py-4 border-b border-line">
            <div>
              <h4 className="text-sm font-semibold text-fg">History</h4>
              <p className="text-xs text-fg-mute mt-0.5">
                {translations.length} translations · stored on-device
              </p>
            </div>
            {translations.length > 0 && (
              <button
                type="button"
                onClick={clearLocalStorage}
                className="text-xs text-fg-dim hover:text-fg font-medium transition"
              >
                Clear all
              </button>
            )}
          </div>
          <div className="overflow-y-auto h-[calc(100vh-66px)]">
            {translations.length === 0 && (
              <div className="px-5 py-16 text-center">
                <div className="mx-auto grid h-10 w-10 place-items-center rounded-md border border-line bg-bg-1 mb-3">
                  <i className="pi pi-history text-fg-mute" style={{ fontSize: 14 }} />
                </div>
                <p className="text-sm text-fg-dim">No translations yet</p>
                <p className="mt-1 text-xs text-fg-mute">
                  Anything you translate will be listed here.
                </p>
              </div>
            )}
            {translations.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setValue(item.value);
                  setTranslationResult(item.translation);
                  setActiveLanguage(item.sourcelang);
                  setActiveLanguage2(item.targetlang);
                }}
                className="group cursor-pointer border-b border-line/60 px-5 py-4 hover:bg-bg-1 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[11px] text-fg-mute font-mono uppercase tracking-wider">
                    <span>{item.sourcelang?.label || item.sourcelang}</span>
                    <i className="pi pi-arrow-right text-accent" style={{ fontSize: 9 }} />
                    <span>{item.targetlang?.label || item.targetlang}</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTranslationFromLocalStorage(item.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-fg-mute hover:text-red-400 transition"
                    aria-label="Delete"
                  >
                    <i className="pi pi-trash" style={{ fontSize: 11 }} />
                  </button>
                </div>
                <p className="mt-2 text-sm text-fg leading-relaxed">{item.value}</p>
                <p className="mt-1 text-sm text-fg-dim leading-relaxed">
                  {item.translation}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Sidebar>

      <Toast ref={toast} />

      <div className="surface overflow-hidden">
        {/* Top bar with language pickers */}
        <div className="flex items-center justify-between border-b border-line bg-bg-1 px-3 py-2.5">
          <div className="flex items-center gap-2">
            <LangChip lang={activeLanguage} onClick={() => setFromPickerOpen(true)} />
            <button
              type="button"
              onClick={swapLanguages}
              className="grid h-7 w-7 place-items-center rounded-md text-fg-dim hover:text-fg hover:bg-bg-2 transition"
              aria-label="Swap"
            >
              <i className="pi pi-arrow-right-arrow-left" style={{ fontSize: 11 }} />
            </button>
            <LangChip lang={activeLanguage2} onClick={() => setToPickerOpen(true)} />
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setHistoryOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs text-fg-dim hover:text-fg hover:bg-bg-2 transition"
            >
              <i className="pi pi-history" style={{ fontSize: 11 }} />
              History
            </button>
          </div>
        </div>

        {/* Two-pane editor */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-line">
          <div className="relative">
            <div className="flex items-center justify-between px-4 pt-3 pb-1">
              <span className="text-[11px] uppercase tracking-wider text-fg-mute font-mono">
                Source · {activeLanguage?.label}
              </span>
              {value && (
                <button
                  type="button"
                  onClick={() => {
                    setValue("");
                    setTranslationResult("");
                  }}
                  className="text-xs text-fg-mute hover:text-fg transition"
                >
                  Clear
                </button>
              )}
            </div>
            <textarea
              ref={textareaRef}
              placeholder="Enter text to translate…"
              value={value}
              onChange={handleChange}
              onBlur={() => setIsFocus(false)}
              onFocus={() => setIsFocus(true)}
              maxLength={500}
              className="w-full resize-none bg-transparent px-4 pt-2 pb-10 text-base leading-relaxed text-fg placeholder:text-fg-mute focus:outline-none min-h-[180px]"
            />
            <div className="absolute bottom-3 right-4 flex items-center gap-3 text-[11px] font-mono text-fg-mute">
              <span className={value.length === 500 ? "text-red-400" : ""}>
                {value.length} / 500
              </span>
            </div>
          </div>

          <div className="relative bg-bg-1/40">
            <div className="flex items-center justify-between px-4 pt-3 pb-1">
              <span className="text-[11px] uppercase tracking-wider text-fg-mute font-mono">
                Target · {activeLanguage2?.label}
              </span>
              {translateResult && !isLoading && (
                <button
                  type="button"
                  onClick={() =>
                    navigator.clipboard.writeText(translateResult).then(() =>
                      toast.current?.show({
                        severity: "success",
                        summary: "Copied",
                        detail: "Copied to clipboard",
                        life: 2000,
                      })
                    )
                  }
                  className="inline-flex items-center gap-1.5 text-xs text-fg-dim hover:text-fg transition"
                >
                  <i className="pi pi-copy" style={{ fontSize: 11 }} />
                  Copy
                </button>
              )}
            </div>
            {isLoading && (
              <ProgressBar
                mode="indeterminate"
                style={{ height: 2, position: "absolute", top: 0, width: "100%" }}
              />
            )}
            <textarea
              value={isLoading ? "" : translateResult}
              placeholder={isLoading ? "Translating…" : "Translation will appear here…"}
              disabled
              className="w-full resize-none bg-transparent px-4 pt-2 pb-10 text-base leading-relaxed text-fg placeholder:text-fg-mute focus:outline-none min-h-[180px]"
            />
          </div>
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-between border-t border-line bg-bg-1 px-3 py-2.5">
          <div className="flex items-center gap-2 text-[11px] text-fg-mute font-mono">
            <span className="dot-pulse" />
            <span>powered by ai.krishtasood.in</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              label="Translate"
              loading={isLoading}
              disabled={!value || !activeLanguage || !activeLanguage2}
              onClick={handleSubmit}
              icon="pi pi-arrow-right"
              iconPos="right"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Translate;
