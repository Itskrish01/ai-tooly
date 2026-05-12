import { useContext } from "react";
import "./App.css";
import { AppContext, TOOLS } from "./context";
import Sidebar from "./components/Sidebar";
import StatusBar from "./components/StatusBar";

import Translate from "./components/AppComponent/Translate";
import Rephrase from "./components/AppComponent/Rephrase";
import Summarize from "./components/AppComponent/Summarize";
import GrammarFix from "./components/AppComponent/GrammarFix";
import CodeExplain from "./components/AppComponent/CodeExplain";

const REGISTRY = {
  translate: Translate,
  rephrase: Rephrase,
  summarize: Summarize,
  grammar: GrammarFix,
  "code-explain": CodeExplain,
};

function App() {
  const { activeApp, setActiveApp } = useContext(AppContext);
  const tool = TOOLS.find((t) => t.id === activeApp) || TOOLS[0];
  const Active = REGISTRY[activeApp] || Translate;

  return (
    <div className="relative min-h-screen bg-bg text-fg flex">
      <Sidebar />

      {/* Main canvas */}
      <div className="relative flex-1 min-w-0">
        {/* atmosphere */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 gridbg opacity-70"
        />
        <div
          aria-hidden
          className="pointer-events-none fixed inset-x-0 top-0 h-[420px] lime-halo"
        />

        <div className="relative z-10 px-4 sm:px-8 pt-6 sm:pt-10 pb-16">
          {/* Mobile brand row + tool picker */}
          <div className="md:hidden mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="grid h-6 w-6 place-items-center rounded-sm bg-accent text-bg">
                <span className="font-mono text-[10px] font-bold">⌘</span>
              </span>
              <span className="font-mono text-[12.5px] font-semibold">
                ai_tooly
              </span>
            </div>
            <select
              value={activeApp}
              onChange={(e) => setActiveApp(e.target.value)}
              className="bg-bg-2 border border-line rounded-sm font-mono text-[11px] text-fg px-2 py-1.5"
            >
              {TOOLS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tool header */}
          <header className="mb-7 max-w-5xl">
            <div className="flex items-center gap-2 font-mono text-[10.5px] text-fg-mute uppercase tracking-[0.18em]">
              <span>~/ai_tooly</span>
              <span className="text-accent">$</span>
              <span className="text-fg-dim">
                {tool.group?.toLowerCase()} / {tool.id}
              </span>
            </div>
            <h1 className="mt-3 font-display text-2xl sm:text-3xl font-semibold tracking-tight text-fg">
              {tool.name.toLowerCase()}
              <span className="caret" />
            </h1>
            <p className="mt-2 font-mono text-[12.5px] text-fg-dim max-w-xl">
              {tool.desc}
            </p>
          </header>

          <main className="max-w-5xl">
            <Active key={activeApp} />
          </main>
        </div>

        <StatusBar />
      </div>

      {/* spacer for status bar */}
      <div className="h-7" />
    </div>
  );
}

export default App;
