import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/global.css";
import App from "./app/App";
import { applyTheme, getStoredTheme } from "./features/theme/themeStorage";

applyTheme(getStoredTheme());

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element #root was not found");

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
