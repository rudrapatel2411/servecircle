import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.js';
import hi from './hi.js';
import gu from './gu.js';

const LANGUAGE_STORAGE_KEY = 'servecircle_language';

const savedLanguage = typeof window !== 'undefined'
  ? localStorage.getItem(LANGUAGE_STORAGE_KEY) || 'en'
  : 'en';

const i18nInstance = i18n.createInstance();

i18nInstance.use({
  type: 'postProcessor',
  name: 'localizeNumbers',
  process: function(value, key, options, translator) {
    if (typeof value !== 'string') return value;
    const lang = translator.language;
    if (lang === 'hi') {
      return value.replace(/\d/g, d => '०१२३४५६७८९'[d]);
    } else if (lang === 'gu') {
      return value.replace(/\d/g, d => '૦૧૨૩૪૫૬૭૮૯'[d]);
    }
    return value;
  }
});

i18nInstance.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    hi: { translation: hi },
    gu: { translation: gu },
  },
  lng: savedLanguage,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
  postProcess: ['localizeNumbers']
});

i18nInstance.on('languageChanged', (lng) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
    } catch (e) {
      console.warn('Failed to persist language preference:', e);
    }
  }
});

export default i18nInstance;
