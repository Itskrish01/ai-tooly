import { createContext, useState } from "react";

export const AppContext = createContext();

export const TOOLS = [
  { id: "translate", name: "Translate", icon: "pi-language", group: "Transform", desc: "Translate text across 100+ languages" },
  { id: "rephrase", name: "Rephrase", icon: "pi-bolt", group: "Transform", desc: "Rewrite with a different tone" },
  { id: "summarize", name: "Summarize", icon: "pi-align-left", group: "Transform", desc: "Compress long text into key points" },
  { id: "grammar", name: "Grammar Fix", icon: "pi-check-circle", group: "Transform", desc: "Fix grammar, spelling, and clarity" },
  { id: "code-explain", name: "Code Explain", icon: "pi-code", group: "Develop", desc: "Explain a snippet line-by-line" },
];

const AppProvider = ({ children }) => {
  const [activeApp, setActiveApp] = useState("translate");

  const values = {
    activeApp,
    setActiveApp,
  };

  return <AppContext.Provider value={values}>{children}</AppContext.Provider>;
};

export default AppProvider;
