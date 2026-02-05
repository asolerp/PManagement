import {useState, useEffect} from 'react';
import * as Localization from 'expo-localization';

export const useLocales = () => {
  const [locale, setLocale] = useState();

  useEffect(() => {
    try {
      const locales = Localization.getLocales();
      if (locales && locales[0]) {
        setLocale(locales[0].languageCode);
      } else {
        setLocale('en');
      }
    } catch (error) {
      console.warn('Failed to get locale:', error);
      setLocale('en');
    }
  }, []);

  return {
    locale: locale || 'en',
  };
};
