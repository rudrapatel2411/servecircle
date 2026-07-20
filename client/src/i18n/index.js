import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.js';
import hi from './hi.js';
import gu from './gu.js';

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
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
  postProcess: ['localizeNumbers']
});

export default i18nInstance;
