import { useContext, useEffect, useState } from "react";
import { AppContext, TOOLS } from "../context";
import { health } from "../lib/aiClient";

const StatusBar = () => {
  const { activeApp } = useContext(AppContext);
  const tool = TOOLS.find((t) => t.id === activeApp);
  const [status, setStatus] = useState({ ok: null, model: "", host: "" });
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    let alive = true;
    health()
      .then((h) => {
        if (!alive) return;
        setStatus({
          ok: h?.status === "ok" || h?.ok === true || h?.success === true,
          model: h?.defaultModel || h?.ollama?.defaultModel || "",
          host: h?.host || "",
        });
      })
      .catch(() => alive && setStatus({ ok: false, model: "", host: "" }));
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  const tt = time.toLocaleTimeString([], { hour12: false });

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 border-t border-line bg-bg/95 backdrop-blur">
      <div className="mx-auto flex h-7 items-center justify-between px-3 font-mono text-[10.5px] text-fg-dim">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span
              className={`inline-block h-1.5 w-1.5 rounded-full ${
                status.ok === false
                  ? "bg-danger"
                  : status.ok
                  ? "bg-accent"
                  : "bg-warn"
              }`}
            />
            <span className="uppercase tracking-wider">
              {status.ok === false
                ? "offline"
                : status.ok
                ? "online"
                : "probing"}
            </span>
          </span>
          <span className="text-fg-mute">·</span>
          <span>ai.krishtasood.in</span>
          {status.model && (
            <>
              <span className="text-fg-mute">·</span>
              <span className="text-accent">{status.model}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span>
            <span className="text-fg-mute">tool:</span>{" "}
            {tool?.id || "—"}
          </span>
          <span className="text-fg-mute">·</span>
          <span>{tt} UTC{new Date().getTimezoneOffset() / -60}</span>
        </div>
      </div>
    </div>
  );
};

export default StatusBar;
