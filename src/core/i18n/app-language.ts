export const APP_LANGUAGE_STORAGE_KEY = "of-language-preference";

export const SUPPORTED_APP_LANGUAGES = ["en-US", "pt-BR"] as const;

export type AppLanguage = (typeof SUPPORTED_APP_LANGUAGES)[number];

export const DEFAULT_APP_LANGUAGE: AppLanguage = "en-US";

const LANGUAGE_ALIAS_MAP: Record<string, AppLanguage> = {
  en: "en-US",
  "en-us": "en-US",
  pt: "pt-BR",
  "pt-br": "pt-BR",
};

export function normalizeAppLanguage(raw?: string | null): AppLanguage {
  if (!raw) return DEFAULT_APP_LANGUAGE;

  const normalized = raw.trim().toLowerCase();
  if (!normalized) return DEFAULT_APP_LANGUAGE;

  return LANGUAGE_ALIAS_MAP[normalized] ?? DEFAULT_APP_LANGUAGE;
}

export function isAppLanguage(value: string): value is AppLanguage {
  return SUPPORTED_APP_LANGUAGES.includes(value as AppLanguage);
}

