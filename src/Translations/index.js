import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';

import * as resources from './resources';
import {getLocales} from 'react-native-localize';

i18n.use(initReactI18next).init({
  lng: getLocales()[0].languageCode,
  fallbackLng: 'en',
  resources: {
    ...Object.entries(resources).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: {
          translation: value,
        },
      }),
      {},
    ),
  },
});

export default i18n;
