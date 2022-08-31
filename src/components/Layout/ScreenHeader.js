import React from 'react';

import {Text} from 'react-native';
import {useTheme} from '../../Theme';
import {Colors} from '../../Theme/Variables';

export const ScreenHeader = ({title, subtitle}) => {
  const {Fonts} = useTheme();
  return (
    <>
      <Text style={[Fonts.textXl, Fonts.textBold, {colors: Colors.darkBlue}]}>
        {title}
      </Text>
      {subtitle && (
        <Text style={[Fonts.textXs, {color: Colors.gray800}]}>{subtitle}</Text>
      )}
    </>
  );
};
