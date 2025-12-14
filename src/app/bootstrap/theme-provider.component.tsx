import { type PropsWithChildren, useEffect, useMemo, useState } from "react";
import { ConfigProvider, theme } from "antd";

import type { ThemeMode, ThemePreference } from "@core/config/theme/theme.interface";
import { themeService } from "@core/config/theme/theme.service";

type ThemeProviderState = {
  mode: ThemeMode;
  preference: ThemePreference;
};

function readCssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function buildAntdTokens(mode: ThemeMode) {
  const primary = readCssVar("--color-primary") || (mode === "dark" ? "#4de6d3" : "#1e70ff");
  const colorText = readCssVar("--color-text") || (mode === "dark" ? "#e6f1f4" : "#0f172a");
  const colorTextSecondary =
    readCssVar("--color-text-muted") || (mode === "dark" ? "rgba(230, 241, 244, 0.72)" : "#475569");
  const colorBgBase = readCssVar("--color-background") || (mode === "dark" ? "#0f1f26" : "#f6f8fb");
  const colorBgContainer = readCssVar("--color-surface") || (mode === "dark" ? "#132a33" : "#ffffff");
  const colorBorder =
    readCssVar("--color-border") ||
    (mode === "dark" ? "rgba(230,241,244,0.14)" : "rgba(15,23,42,0.12)");

  return {
    token: {
      colorPrimary: primary,
      colorText,
      colorTextSecondary,
      colorBgBase,
      colorBgContainer,
      colorBorder,
      borderRadius: 14,
      fontFamily: readCssVar("--font-family-sans") || undefined,
    },
  };
}

export function AppThemeProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<ThemeProviderState>(() => themeService.init());

  useEffect(() => {
    const unsubscribe = themeService.subscribe((next) => setState(next));
    return unsubscribe;
  }, []);

  const antdTheme = useMemo(() => {
    const algorithm = state.mode === "dark" ? theme.darkAlgorithm : theme.defaultAlgorithm;

    return {
      algorithm,
      ...buildAntdTokens(state.mode),
      components: {
        Typography: {
          colorLink: "var(--color-link)",
          colorLinkHover: "var(--color-link-hover)",
        },
      },
    };
  }, [state.mode]);

  return <ConfigProvider theme={antdTheme}>{children}</ConfigProvider>;
}
