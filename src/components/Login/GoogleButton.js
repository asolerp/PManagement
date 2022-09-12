import React from 'react';

import {View, Text, Image, Pressable} from 'react-native';
import theme from '../../Theme/Theme';

export const GoogleButton = ({onPress}) => {
  return (
    <Pressable onPress={onPress}>
      <View
        style={[
          theme.flexRow,
          theme.bgWhite,
          theme.itemsCenter,
          theme.p2,
          theme.h12,
          theme.border,
          theme.borderGray500,
          theme.roundedSm,
        ]}>
        <Image
          source={require('../../assets/google.png')}
          resizeMode="contain"
          style={[theme.w5, theme.h5]}
        />
        <View style={[theme.flex1, theme.itemsCenter]}>
          <Text style={[theme.fontSansMedium]}>Continuar con Google</Text>
        </View>
      </View>
    </Pressable>
  );
};
