import { createContext, useState } from "react";

export const AppContext = createContext();

const AppProvider = ({ children }) => {
  const [activeApp, setActiveApp] = useState("translate");

  const values = {
    activeApp,
    setActiveApp,
  };

  return <AppContext.Provider value={values}>{children}</AppContext.Provider>;
};

export default AppProvider;
