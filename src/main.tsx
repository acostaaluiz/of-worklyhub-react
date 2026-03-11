import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@shared/styles/global.scss";

import App from "./App.tsx";
import { bootstrapDayjs } from "@app/bootstrap/dayjs.bootstrap";
import { bootstrapTheme } from "@app/bootstrap/theme.bootstrap";

const runtimeEnv = Object.fromEntries(
  Object.entries(import.meta.env).map(([key, value]) => [key, String(value)])
);
(globalThis as { __WORKLYHUB_RUNTIME_ENV__?: Record<string, string | undefined> }).__WORKLYHUB_RUNTIME_ENV__ =
  runtimeEnv;

bootstrapDayjs();
bootstrapTheme({ defaultMode: "dark" });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
