import { useContext } from "react";
import TabLink from "./UI/TabLink";
import { AppContext } from "../context";

const NavTabLinks = () => {
  const { activeApp, setActiveApp } = useContext(AppContext);

  const setHandleActive = (value) => {
    setActiveApp(value);
  };
  return (
    <div className="flex gap-3 flex-wrap">
      <TabLink
        icon={<i className="pi pi-language"></i>}
        value={"translate"}
        name={"Translate"}
        active={activeApp}
        handleClick={setHandleActive}
      />
      <TabLink
        icon={<i className="pi pi-bolt"></i>}
        value={"rephrase"}
        name={"Rephrase"}
        active={activeApp}
        handleClick={setHandleActive}
      />
      <TabLink
        icon={<i className="pi pi-image"></i>}
        name={"Image generator"}
        value={"image-generator"}
        active={activeApp}
        handleClick={setHandleActive}
      />
    </div>
  );
};

export default NavTabLinks;
