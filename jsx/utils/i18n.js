import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { reactI18nextModule } from 'react-i18next'
import translations from './translations'
i18n
  .use(LanguageDetector)
  .use(reactI18nextModule)
  .init({
    fallbackLng: ['en', 'dev'],
    resources: {
      en: translations.en,
      fr: translations.fr,
      es: translations.es,
      de: translations.de
    },
    defaultNS: 'common',
    debug: true,
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
