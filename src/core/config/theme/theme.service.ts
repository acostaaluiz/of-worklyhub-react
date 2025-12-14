import type { ThemeMode, ThemePreference, ThemeState } from "./theme.interface";


const STORAGE_KEY = "of-theme-preference";

type ThemeListener = (state: ThemeState) => void;

export class ThemeService {
  private listeners = new Set<ThemeListener>();
  private mediaQuery: MediaQueryList | null = null;

  public init(): ThemeState {
    const preference = this.getStoredPreference();
    const mode = this.resolveMode(preference);

    this.applyMode(mode);
    this.bindMediaQuery(preference);

    return { mode, preference };
  }

  public subscribe(listener: ThemeListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public setPreference(preference: ThemePreference): ThemeState {
    this.storePreference(preference);

    const mode = this.resolveMode(preference);

    this.applyMode(mode);
    this.bindMediaQuery(preference);

    const state: ThemeState = { mode, preference };
    this.emit(state);

    return state;
  }

  public getPreference(): ThemePreference {
    return this.getStoredPreference();
  }

  private bindMediaQuery(preference: ThemePreference): void {
    if (this.mediaQuery) {
      this.mediaQuery.onchange = null;
      this.mediaQuery = null;
    }

    if (preference !== "system") return;

    this.mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    this.mediaQuery.onchange = () => {
      const nextMode: ThemeMode = this.mediaQuery?.matches ? "dark" : "light";
      this.applyMode(nextMode);
      this.emit({ mode: nextMode, preference: "system" });
    };
  }

  private emit(state: ThemeState): void {
    this.listeners.forEach((l) => l(state));
  }

  private resolveMode(preference: ThemePreference): ThemeMode {
    if (preference === "light" || preference === "dark") return preference;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  private applyMode(mode: ThemeMode): void {
    document.documentElement.setAttribute("data-theme", mode);
    document.documentElement.style.colorScheme = mode;
  }

  private getStoredPreference(): ThemePreference {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value === "light" || value === "dark" || value === "system") return value;
    return "system";
  }

  private storePreference(preference: ThemePreference): void {
    localStorage.setItem(STORAGE_KEY, preference);
  }
}

export const themeService = new ThemeService();
