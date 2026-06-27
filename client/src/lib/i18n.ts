import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import ar from '../locales/ar.json';
import en from '../locales/en.json';

export const SUPPORTED_LANGUAGES = ['ar', 'en'] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { ar: { translation: ar }, en: { translation: en } },
    fallbackLng: 'ar',
    supportedLngs: SUPPORTED_LANGUAGES,
    interpolation: { escapeValue: false }, // React يهرّب أصلًا
    detection: { order: ['localStorage', 'navigator'], caches: ['localStorage'] },
  });

/** يضبط اتجاه ولغة المستند حسب اللغة الحالية (RTL للعربية). */
export function applyDirection(lang: string) {
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = lang;
  document.documentElement.dir = dir;
}

applyDirection(i18n.language);
i18n.on('languageChanged', applyDirection);

export default i18n;
