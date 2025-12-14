import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@shared/styles/global.scss";

import App from "./App.tsx";
import { bootstrapTheme } from "@app/bootstrap/theme.bootstrap";

bootstrapTheme({ defaultMode: "dark" });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
