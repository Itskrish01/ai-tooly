import { useContext } from "react";
import TabLink from "./UI/TabLink";
import { AppContext } from "../context";

const NavTabLinks = () => {
  const { activeApp, setActiveApp } = useContext(AppContext);

  return (
    <div className="tab-links inline-flex gap-1 overflow-x-auto rounded-lg border border-line bg-bg-1 p-1">
      <TabLink
        icon={<i className="pi pi-language" style={{ fontSize: 12 }}></i>}
        value="translate"
        name="Translate"
        active={activeApp}
        handleClick={setActiveApp}
      />
      <TabLink
        icon={<i className="pi pi-bolt" style={{ fontSize: 12 }}></i>}
        value="rephrase"
        name="Rephrase"
        active={activeApp}
        handleClick={setActiveApp}
      />
      <TabLink
        icon={<i className="pi pi-comments" style={{ fontSize: 12 }}></i>}
        value="image-generator"
        name="Chat"
        active={activeApp}
        handleClick={setActiveApp}
      />
    </div>
  );
};

export default NavTabLinks;
