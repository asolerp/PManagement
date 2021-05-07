import * as DefaultVariables from '../Variables';
import Layout from '../Layout';
import Fonts from '../Fonts';
import Gutters from '../Gutters';
import {DefaultTheme} from '@react-navigation/native';

export default function () {
  const themeVariables = DefaultVariables ;
  const darkMode = false;

  const baseTheme = {
    Fonts: Fonts(themeVariables),
    Gutters: Gutters(themeVariables),
    Layout: Layout(themeVariables),
    ...themeVariables,
  };

  return {
    ...(Object.entries(baseTheme).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: {
          ...value,
        },
      }),
      {},
    )),
    darkMode,
    NavigationTheme: {
      ...DefaultTheme,
      colors: {
        ...DefaultTheme.colors,
        ...baseTheme.NavigationColors,
      },
    },
  };
}
