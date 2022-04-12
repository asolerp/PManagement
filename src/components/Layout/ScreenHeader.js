import React from 'react';

import {Text} from 'react-native';
import {useTheme} from '../../Theme';
import {Colors} from '../../Theme/Variables';

export const ScreenHeader = ({title}) => {
  const {Gutters, Fonts} = useTheme();
  return (
    <Text
      style={[
        Fonts.textXl,
        Fonts.textBold,
        Gutters.regularTMargin,
        {colors: Colors.darkBlue},
      ]}>
      {title}
    </Text>
  );
};
