import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

//theme
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primeicons/primeicons.css"; //icons
//core
import "primereact/resources/primereact.min.css";
import AppProvider from "./context.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <AppProvider>
    <App />
  </AppProvider>
);
