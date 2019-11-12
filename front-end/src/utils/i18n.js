import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import translations from './translations'
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: ['en', 'dev'],
    resources: {
      de: translations.de,
      en: translations.en,
      es: translations.es,
      fa: translations.fa,
      fr: translations.fr,
      hi: translations.hi,
      it: translations.it,
      nl: translations.nl,
      pt: translations.pt,
      zh: translations.zh
    },
    defaultNS: 'common',
    debug: false,
    interpolation: {
      escapeValue: false
    },
    react: {
      wait: false,
      bindI18n: 'languageChanged loaded',
      bindStore: 'added removed',
      nsMode: 'default'
    }
  })
export default i18n
