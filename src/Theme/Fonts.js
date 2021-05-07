import {StyleSheet} from 'react-native';

export default function ({FontSize, Colors}) {
  return StyleSheet.create({
    textTitle: {
      fontSize: FontSize.regular,
      fontWeight: 'bold',
      color: Colors.darkBlue,
    },
    textWhite: {
      fontSize: FontSize.small,
      fontWeight: 'bold',
      color: Colors.white,
    },
    textSmall: {
      fontSize: FontSize.small,
      color: Colors.text,
    },
    textRegular: {
      fontSize: FontSize.regular,
      fontWeight: 'bold',
    },
    textLarge: {
      fontSize: FontSize.large,
      color: Colors.text,
    },
  });
}
