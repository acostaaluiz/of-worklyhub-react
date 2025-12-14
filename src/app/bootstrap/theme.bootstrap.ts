export type ThemeMode = "light" | "dark";

type BootstrapThemeOptions = {
  defaultMode?: ThemeMode;
  storageKey?: string;
};

const DEFAULT_STORAGE_KEY = "of.theme.mode";

function getPreferredColorScheme(): ThemeMode {
  if (typeof window === "undefined") return "light";
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function readStoredMode(storageKey: string): ThemeMode | null {
  try {
    const value = window.localStorage.getItem(storageKey);
    if (value === "light" || value === "dark") return value;
    return null;
  } catch {
    return null;
  }
}

export function setThemeMode(
  mode: ThemeMode,
  storageKey = DEFAULT_STORAGE_KEY
) {
  document.documentElement.dataset.theme = mode;
  try {
    window.localStorage.setItem(storageKey, mode);
  } catch {
    return;
  }
}

export function bootstrapTheme(options: BootstrapThemeOptions = {}) {
  const storageKey = options.storageKey ?? DEFAULT_STORAGE_KEY;

  const stored = readStoredMode(storageKey);
  const preferred = getPreferredColorScheme();
  const mode: ThemeMode = stored ?? options.defaultMode ?? preferred;

  document.documentElement.dataset.theme = mode;
}
