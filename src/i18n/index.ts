import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { en } from "./locales/en";
import { zhTW } from "./locales/zh-TW";
import { ja } from "./locales/ja";

export const SUPPORTED_LANGUAGES = ["zh-TW", "en", "ja"] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: Language = "zh-TW";
const STORAGE_KEY = "tms-lang";

/**
 * Custom detector placed last in the order: when neither localStorage nor the
 * browser yields a supported language, fall back to Traditional Chinese.
 */
const defaultLanguageDetector = new LanguageDetector();
defaultLanguageDetector.addDetector({
  name: "defaultLanguage",
  lookup: () => DEFAULT_LANGUAGE,
});

void i18n
  .use(defaultLanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      "zh-TW": { translation: zhTW },
      ja: { translation: ja },
    },
    supportedLngs: [...SUPPORTED_LANGUAGES],
    fallbackLng: "en",
    load: "currentOnly",
    detection: {
      order: ["localStorage", "navigator", "defaultLanguage"],
      lookupLocalStorage: STORAGE_KEY,
      caches: ["localStorage"],
    },
    interpolation: {
      escapeValue: false,
    },
  });

function syncHtmlLang(lng: string): void {
  document.documentElement.lang = lng;
}

syncHtmlLang(i18n.resolvedLanguage ?? DEFAULT_LANGUAGE);
i18n.on("languageChanged", syncHtmlLang);

export default i18n;
