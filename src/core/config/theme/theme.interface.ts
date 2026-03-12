export type ThemeMode = "light" | "dark";
export type ThemePreference = ThemeMode | "system";

export type ThemeCustomColors = {
  primary?: string;
  secondary?: string;
  tertiary?: string;
  text?: string;
  background?: string;
  surface?: string;
  surfaceAlt?: string;
};

export type ThemeState = {
  mode: ThemeMode;
  preference: ThemePreference;
  customColors: ThemeCustomColors;
};
