import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import * as resources from './resources';
import * as Localization from 'expo-localization';
import { Logger } from '../lib/logging';

// Get locale safely with fallback
let languageCode = 'en';
try {
  const locales = Localization.getLocales();
  if (locales && locales[0]) {
    languageCode = locales[0].languageCode;
  }
} catch (error) {
  Logger.warn('Failed to get locales, using default', {error: error.message});
}

i18n.use(initReactI18next).init({
  lng: languageCode,
  fallbackLng: 'en',
  resources: {
    ...Object.entries(resources).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: {
          translation: value
        }
      }),
      {}
    )
  }
});

export default i18n;
