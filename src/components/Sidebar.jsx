import { useContext } from "react";
import { AppContext, TOOLS } from "../context";

const Sidebar = () => {
  const { activeApp, setActiveApp } = useContext(AppContext);

  // group tools by `group` while preserving order
  const groups = TOOLS.reduce((acc, t) => {
    (acc[t.group] = acc[t.group] || []).push(t);
    return acc;
  }, {});

  return (
    <aside className="hidden md:flex sticky top-0 h-screen w-60 shrink-0 flex-col border-r border-line bg-bg/80 backdrop-blur-xl">
      {/* Brand */}
      <div className="px-4 pt-5 pb-4 border-b border-line">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-sm bg-accent text-bg shadow-glow">
            <span className="font-mono text-[11px] font-bold">⌘</span>
          </span>
          <span className="font-mono text-[13px] font-semibold tracking-wide">
            ai_tooly
          </span>
          <span className="ml-auto font-mono text-[10px] text-fg-mute">
            v0.2
          </span>
        </div>
      </div>

      {/* Tool groups */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-5">
        {Object.entries(groups).map(([group, items]) => (
          <div key={group}>
            <div className="px-3 mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-fg-mute">
              ── {group}
            </div>
            <div className="space-y-0.5">
              {items.map((t) => {
                const active = activeApp === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveApp(t.id)}
                    className={`group relative flex w-full items-center gap-2.5 rounded-sm border border-transparent px-3 py-2 text-left transition ${
                      active
                        ? "rail-item-active"
                        : "text-fg-dim hover:bg-bg-2 hover:text-fg"
                    }`}
                  >
                    <i
                      className={`pi ${t.icon}`}
                      style={{ fontSize: 12 }}
                    />
                    <span className="font-mono text-[12.5px] tracking-tight">
                      {t.name}
                    </span>
                    {active && (
                      <span className="ml-auto font-mono text-[10px] text-accent">
                        →
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-line p-3 space-y-2">
        <a
          href="https://github.com"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 px-2 py-1.5 rounded-sm text-fg-dim hover:text-fg hover:bg-bg-2 transition font-mono text-[11px]"
        >
          <i className="pi pi-github" style={{ fontSize: 11 }} />
          GitHub
        </a>
        <a
          href="https://ai.krishtasood.in"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 px-2 py-1.5 rounded-sm text-fg-dim hover:text-fg hover:bg-bg-2 transition font-mono text-[11px]"
        >
          <i className="pi pi-external-link" style={{ fontSize: 11 }} />
          API Docs
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;
