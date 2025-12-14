export type ThemeMode = "light" | "dark";
export type ThemePreference = ThemeMode | "system";

export type ThemeState = {
  mode: ThemeMode;
  preference: ThemePreference;
};
