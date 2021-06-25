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
    titleCard: {
      fontSize: FontSize.small,
      fontWeight: 'bold',
      color: Colors.darkBlue,
      marginBottom: 10,
    },
    textInfo: {
      fontSize: FontSize.small,
      color: Colors.darkGrey,
      fontWeight: '400',
    },
    textWhite: {
      fontSize: FontSize.small,
      fontWeight: 'bold',
      color: Colors.white,
    },
    textTiny: {
      fontSize: FontSize.tiny,
      color: Colors.darkBlue,
      fontWeight: 'bold',
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
