import React from 'react';
import { View } from 'react-native';
import theme from '../../Theme/Theme';

export const Spacer = ({ space }) => {
  return <View style={theme?.[`mB${space}`]} />;
};
