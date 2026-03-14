import type {
  ThemeCustomColors,
  ThemeMode,
  ThemePreference,
  ThemeState,
} from "./theme.interface";
import { parseSessionIdentity } from "@core/auth/session-security";

const PREFERENCE_STORAGE_KEY = "of-theme-preference";
const AUTH_SESSION_KEY = "auth.session";
const CUSTOM_COLORS_STORAGE_PREFIX = "of-theme-custom-colors";

const HEX_COLOR_PATTERN = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;
const COLOR_VARIABLES: Record<keyof ThemeCustomColors, string> = {
  primary: "--color-primary",
  secondary: "--color-secondary",
  tertiary: "--color-tertiary",
  text: "--color-text",
  background: "--color-background",
  surface: "--color-surface",
  surfaceAlt: "--color-surface-2",
};

type ThemeListener = (state: ThemeState) => void;

type ThemeCustomPalette = Partial<Record<ThemeMode, ThemeCustomColors>>;

function normalizeHexColor(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (!HEX_COLOR_PATTERN.test(trimmed)) return null;

  if (trimmed.length === 4) {
    const r = trimmed[1];
    const g = trimmed[2];
    const b = trimmed[3];
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }

  return trimmed.toLowerCase();
}

export class ThemeService {
  private listeners = new Set<ThemeListener>();
  private mediaQuery: MediaQueryList | null = null;

  public init(): ThemeState {
    const preference = this.getStoredPreference();
    const mode = this.resolveMode(preference);
    const customColors = this.getStoredCustomColors(mode);

    this.applyMode(mode);
    this.applyCustomColors(customColors);
    this.bindMediaQuery(preference);

    return { mode, preference, customColors };
  }

  public subscribe(listener: ThemeListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public setPreference(preference: ThemePreference): ThemeState {
    this.storePreference(preference);

    const mode = this.resolveMode(preference);
    const customColors = this.getStoredCustomColors(mode);

    this.applyMode(mode);
    this.applyCustomColors(customColors);
    this.bindMediaQuery(preference);

    const state: ThemeState = { mode, preference, customColors };
    this.emit(state);

    return state;
  }

  public refreshForCurrentUser(): ThemeState {
    const preference = this.getStoredPreference();
    const mode = this.resolveMode(preference);
    const customColors = this.getStoredCustomColors(mode);

    this.applyMode(mode);
    this.applyCustomColors(customColors);
    this.bindMediaQuery(preference);

    const state: ThemeState = { mode, preference, customColors };
    this.emit(state);

    return state;
  }

  public getPreference(): ThemePreference {
    return this.getStoredPreference();
  }

  public getCustomColors(): ThemeCustomColors {
    const mode = this.resolveMode(this.getStoredPreference());
    return this.getStoredCustomColors(mode);
  }

  public setCustomColors(colors: ThemeCustomColors): ThemeState {
    const mode = this.resolveMode(this.getStoredPreference());
    const normalized = this.normalizeCustomColors(colors);
    this.storeCustomColors(mode, normalized);
    return this.refreshForCurrentUser();
  }

  public clearCustomColors(): ThemeState {
    const mode = this.resolveMode(this.getStoredPreference());
    this.clearStoredCustomColors(mode);
    return this.refreshForCurrentUser();
  }

  private bindMediaQuery(preference: ThemePreference): void {
    if (this.mediaQuery) {
      this.mediaQuery.onchange = null;
      this.mediaQuery = null;
    }

    if (preference !== "system" || typeof window === "undefined") return;

    this.mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    this.mediaQuery.onchange = () => {
      const nextMode: ThemeMode = this.mediaQuery?.matches ? "dark" : "light";
      const customColors = this.getStoredCustomColors(nextMode);
      this.applyMode(nextMode);
      this.applyCustomColors(customColors);
      this.emit({ mode: nextMode, preference: "system", customColors });
    };
  }

  private emit(state: ThemeState): void {
    this.listeners.forEach((listener) => listener(state));
  }

  private resolveMode(preference: ThemePreference): ThemeMode {
    if (preference === "light" || preference === "dark") return preference;
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  private applyMode(mode: ThemeMode): void {
    document.documentElement.setAttribute("data-theme", mode);
    document.documentElement.style.colorScheme = mode;
  }

  private applyCustomColors(colors: ThemeCustomColors): void {
    const rootStyle = document.documentElement.style;

    (Object.keys(COLOR_VARIABLES) as Array<keyof ThemeCustomColors>).forEach(
      (key) => {
        const variableName = COLOR_VARIABLES[key];
        const color = normalizeHexColor(colors[key]);

        if (color) {
          rootStyle.setProperty(variableName, color);
        } else {
          rootStyle.removeProperty(variableName);
        }
      },
    );
  }

  private getStoredPreference(): ThemePreference {
    try {
      const value = localStorage.getItem(PREFERENCE_STORAGE_KEY);
      if (value === "light" || value === "dark" || value === "system")
        return value;
    } catch {
      // ignore storage errors
    }
    return "system";
  }

  private storePreference(preference: ThemePreference): void {
    try {
      localStorage.setItem(PREFERENCE_STORAGE_KEY, preference);
    } catch {
      // ignore storage errors
    }
  }

  private getStoredCustomColors(mode: ThemeMode): ThemeCustomColors {
    const palette = this.getStoredCustomPalette(mode);
    return this.normalizeCustomColors(palette[mode]);
  }

  private getStoredCustomPalette(mode: ThemeMode): ThemeCustomPalette {
    const storageKey = this.resolveCustomColorsStorageKey();
    if (!storageKey) return {};

    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return {};
      const parsed = JSON.parse(raw) as DataMap;
      return this.normalizePaletteStorage(parsed, mode);
    } catch {
      return {};
    }
  }

  private normalizePaletteStorage(
    raw: DataMap,
    mode: ThemeMode,
  ): ThemeCustomPalette {
    const hasModeKeys =
      typeof raw?.light === "object" || typeof raw?.dark === "object";

    if (hasModeKeys) {
      return {
        light: this.normalizeCustomColors(raw?.light as ThemeCustomColors),
        dark: this.normalizeCustomColors(raw?.dark as ThemeCustomColors),
      };
    }

    // Legacy format: flat object with color keys only.
    const legacyColors = this.normalizeCustomColors(raw as ThemeCustomColors);
    if (Object.keys(legacyColors).length <= 0) return {};

    return { [mode]: legacyColors };
  }

  private storeCustomColors(mode: ThemeMode, colors: ThemeCustomColors): void {
    const storageKey = this.resolveCustomColorsStorageKey();
    if (!storageKey) return;

    const normalized = this.normalizeCustomColors(colors);
    const palette = this.getStoredCustomPalette(mode);

    if (Object.keys(normalized).length <= 0) {
      delete palette[mode];
    } else {
      palette[mode] = normalized;
    }

    if (!palette.light && !palette.dark) {
      this.clearStoredCustomColors(mode);
      return;
    }

    try {
      localStorage.setItem(storageKey, JSON.stringify(palette));
    } catch {
      // ignore storage errors
    }
  }

  private clearStoredCustomColors(mode: ThemeMode): void {
    const storageKey = this.resolveCustomColorsStorageKey();
    if (!storageKey) return;

    const palette = this.getStoredCustomPalette(mode);
    delete palette[mode];

    if (palette.light || palette.dark) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(palette));
      } catch {
        // ignore storage errors
      }
      return;
    }

    try {
      localStorage.removeItem(storageKey);
    } catch {
      // ignore storage errors
    }
  }

  private resolveCustomColorsStorageKey(): string | null {
    const userIdentifier = this.getCurrentUserIdentifier();
    if (!userIdentifier) return null;
    return `${CUSTOM_COLORS_STORAGE_PREFIX}:${encodeURIComponent(userIdentifier)}`;
  }

  private getCurrentUserIdentifier(): string | null {
    try {
      const rawSession = localStorage.getItem(AUTH_SESSION_KEY);
      const session = parseSessionIdentity(rawSession);
      if (!session) return null;

      const uid = typeof session.uid === "string" ? session.uid.trim() : "";
      if (uid) return `uid:${uid}`;

      const email =
        typeof session.email === "string" ? session.email.trim() : "";
      if (email) return `email:${email.toLowerCase()}`;
      return null;
    } catch {
      return null;
    }
  }

  private normalizeCustomColors(
    colors: ThemeCustomColors | null | undefined,
  ): ThemeCustomColors {
    if (!colors || typeof colors !== "object") return {};

    const normalized: ThemeCustomColors = {};

    (Object.keys(COLOR_VARIABLES) as Array<keyof ThemeCustomColors>).forEach(
      (key) => {
        const value = normalizeHexColor(colors[key]);
        if (value) normalized[key] = value;
      },
    );

    return normalized;
  }
}

export const themeService = new ThemeService();
