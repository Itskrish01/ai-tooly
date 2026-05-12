import { useContext } from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import NavTabLinks from "./components/NavTabLinks";
import { AppContext } from "./context";
import Translate from "./components/AppComponent/Translate";
import Rephrase from "./components/AppComponent/Rephrase";
import ImageGen from "./components/AppComponent/ImageGen";

function App() {
  const { activeApp } = useContext(AppContext);

  const meta = {
    translate: {
      eyebrow: "Translate",
      title: "Translate text across 100+ languages.",
      blurb:
        "Fast, accurate machine translation with searchable history kept on-device.",
    },
    rephrase: {
      eyebrow: "Rephrase",
      title: "Rewrite sentences with one click.",
      blurb:
        "Paste a sentence, get a cleaner, clearer version. Built for writers, students, and product teams.",
    },
    "image-generator": {
      eyebrow: "Image",
      title: "Generate images from a prompt.",
      blurb: "Describe what you want and receive a grid of variations in seconds.",
    },
  };

  const m = meta[activeApp] ?? meta.translate;

  const renderApp = () => {
    if (activeApp === "translate") return <Translate />;
    if (activeApp === "rephrase") return <Rephrase />;
    return <ImageGen />;
  };

  return (
    <div className="relative min-h-screen bg-bg text-fg">
      {/* Subtle radial glow */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 h-[520px]"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 0%, rgba(91,140,255,0.10) 0%, transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 dotgrid opacity-60"
      />

      <div className="relative z-10">
        <Navbar />

        <main className="mx-auto max-w-6xl px-5 sm:px-8 pt-10 sm:pt-14 pb-24">
          {/* Hero */}
          <section className="animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-line bg-bg-1/80 px-3 py-1 text-xs text-fg-dim backdrop-blur">
              <span className="dot-pulse" />
              <span className="font-mono uppercase tracking-wider">
                {m.eyebrow}
              </span>
              <span className="text-fg-mute">·</span>
              <span>v0.1 · beta</span>
            </div>
            <h1 className="mt-5 max-w-3xl text-3xl sm:text-5xl font-semibold tracking-tight leading-[1.05]">
              {m.title}
            </h1>
            <p className="mt-4 max-w-2xl text-fg-dim text-sm sm:text-base leading-relaxed">
              {m.blurb}
            </p>
          </section>

          <div className="mt-8 flex items-center justify-between gap-4">
            <NavTabLinks />
            
          </div>

          <section className="mt-6 animate-fade-in">{renderApp()}</section>

          <footer className="mt-20">
            <div className="hairline mb-5" />
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-fg-mute font-mono">
              <p>© {new Date().getFullYear()} ai tooly</p>
              <p className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5">
                  <span className="dot-pulse" /> all systems operational
                </span>
                <span>·</span>
                <span>built with react + primereact</span>
              </p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default App;
