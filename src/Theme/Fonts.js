import {StyleSheet} from 'react-native';

export default function ({FontSize, Colors}) {
  return StyleSheet.create({
    chip: {
      fontSize: FontSize.tiny,
      fontWeight: '500',
    },
    textXs: {
      fontSize: FontSize.xs,
    },
    textSm: {
      fontSize: FontSize.small,
    },
    textMd: {
      fontSize: FontSize.md,
    },
    textMd2: {
      fontSize: FontSize.md2,
    },
    textXl: {
      fontSize: FontSize.xl,
    },
    textMBold: {
      fontWeight: '500',
    },
    textBold: {
      fontWeight: 'bold',
    },
    textLight: {
      fontWeight: '100',
    },
    alignCenter: {
      textAlign: 'center',
    },
    textTitle: {
      letterSpacing: 1,
      fontSize: FontSize.small,
      fontWeight: 'bold',
      color: Colors.darkBlue,
    },
    titleCard: {
      fontSize: FontSize.small,
      fontWeight: 'bold',
      color: Colors.darkBlue,
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
