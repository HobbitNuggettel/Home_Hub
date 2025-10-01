/**
 * i18n Configuration
 * Internationalization setup for multi-language support
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Import translation files
import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import it from './locales/it.json';
import pt from './locales/pt.json';
import ru from './locales/ru.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';
import zh from './locales/zh.json';
import ar from './locales/ar.json';

const resources = {
  en: { translation: en },
  es: { translation: es },
  fr: { translation: fr },
  de: { translation: de },
  it: { translation: it },
  pt: { translation: pt },
  ru: { translation: ru },
  ja: { translation: ja },
  ko: { translation: ko },
  zh: { translation: zh },
  ar: { translation: ar }
};

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
      checkWhitelist: true
    },

    interpolation: {
      escapeValue: false // React already does escaping
    },

    backend: {
      loadPath: '/locales/{{lng}}.json',
      addPath: '/locales/{{lng}}.missing.json'
    },

    react: {
      useSuspense: false
    },

    // Language whitelist
    supportedLngs: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh', 'ar'],
    
    // Namespace configuration
    defaultNS: 'translation',
    ns: ['translation'],

    // Pluralization
    pluralSeparator: '_',
    contextSeparator: '_',

    // Missing key handling
    saveMissing: process.env.NODE_ENV === 'development',
    missingKeyHandler: (lng, ns, key, fallbackValue) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Missing translation key: ${key} for language: ${lng}`);
      }
    },

    // Key separator
    keySeparator: '.',
    nsSeparator: ':',

    // Load path for missing translations
    load: 'languageOnly',
    cleanCode: true,

    // Preload languages
    preload: ['en', 'es', 'fr'],

    // Language names for UI
    lngNames: {
      en: 'English',
      es: 'Español',
      fr: 'Français',
      de: 'Deutsch',
      it: 'Italiano',
      pt: 'Português',
      ru: 'Русский',
      ja: '日本語',
      ko: '한국어',
      zh: '中文',
      ar: 'العربية'
    }
  });

export default i18n;
