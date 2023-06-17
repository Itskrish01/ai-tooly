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
  const selectedApp = () => {
    if (activeApp === "translate") {
      return <Translate />;
    } else if (activeApp === "rephrase") {
      return <Rephrase />;
    } else {
      return <ImageGen />;
    }
  };
  return (
    <>
      <Navbar />

      <div className="container max-w-7xl mx-auto px-4 mt-10">
        <NavTabLinks />
        {selectedApp()}
      </div>
    </>
  );
}

export default App;
