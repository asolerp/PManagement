import {StyleSheet} from 'react-native';

export default function ({FontSize, Colors}) {
  return StyleSheet.create({
    alignCenter: {
      textAlign: 'center',
    },
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
      color: Colors.darkBlue,
      fontWeight: 'bold',
    },
    textRegular: {
      fontSize: FontSize.regular,
      fontWeight: 'bold',
      color: Colors.darkBlue,
    },
    textLarge: {
      fontSize: FontSize.large,
      color: Colors.text,
    },
  });
}
