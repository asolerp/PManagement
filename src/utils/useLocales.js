import {NativeModules, Platform} from 'react-native';

export const useLocales = () => {
  const locales = {
    ios:
      NativeModules.SettingsManager.settings.AppleLocale ||
      NativeModules.SettingsManager.settings.AppleLanguages[0],
    android: NativeModules.I18nManager.localeIdentifier,
  };

  return {
    locale: locales[Platform.OS],
  };
};
