import dayjs from "dayjs";
import "dayjs/locale/en";
import "dayjs/locale/pt-br";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import {
  APP_LANGUAGE_STORAGE_KEY,
  DEFAULT_APP_LANGUAGE,
  type AppLanguage,
  SUPPORTED_APP_LANGUAGES,
  normalizeAppLanguage,
} from "./app-language";
import enUSResources from "./resources/en-US.json";
import ptBRResources from "./resources/pt-BR.json";

function persistLanguage(language: AppLanguage): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(APP_LANGUAGE_STORAGE_KEY, language);
  } catch {
    // ignore storage errors
  }
}

function readStoredLanguage(): AppLanguage | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(APP_LANGUAGE_STORAGE_KEY);
    return value ? normalizeAppLanguage(value) : null;
  } catch {
    return null;
  }
}

function resolveBrowserLanguage(): AppLanguage {
  if (typeof navigator === "undefined") return DEFAULT_APP_LANGUAGE;
  return normalizeAppLanguage(navigator.language);
}

function resolveInitialLanguage(): AppLanguage {
  return readStoredLanguage() ?? resolveBrowserLanguage();
}

function toDayjsLocale(language: AppLanguage): string {
  return language === "pt-BR" ? "pt-br" : "en";
}

function applyLanguageSideEffects(language: AppLanguage): void {
  dayjs.locale(toDayjsLocale(language));
  persistLanguage(language);

  if (typeof document !== "undefined") {
    document.documentElement.lang = language;
  }
}

const initialLanguage = resolveInitialLanguage();

void i18n.use(initReactI18next).init({
  resources: {
    "en-US": { translation: enUSResources },
    "pt-BR": { translation: ptBRResources },
  },
  lng: initialLanguage,
  fallbackLng: DEFAULT_APP_LANGUAGE,
  supportedLngs: [...SUPPORTED_APP_LANGUAGES],
  interpolation: { escapeValue: false },
  returnNull: false,
});

applyLanguageSideEffects(initialLanguage);

i18n.on("languageChanged", (nextLanguage) => {
  const normalized = normalizeAppLanguage(nextLanguage);
  applyLanguageSideEffects(normalized);
});

export function getCurrentAppLanguage(): AppLanguage {
  const resolved = i18n.resolvedLanguage ?? i18n.language;
  return normalizeAppLanguage(resolved);
}

export async function setAppLanguage(language: AppLanguage): Promise<void> {
  if (language === getCurrentAppLanguage()) return;
  await i18n.changeLanguage(language);
}

export { i18n };
