import React from 'react';
import {View, StyleSheet} from 'react-native';
import {useTheme} from '../../Theme';

import {Colors} from '../../Theme/Variables';

const H_SIZE = 1;

export const HDivider = ({style}) => {
  const {Layout, Gutters} = useTheme();
  return (
    <View
      style={[
        Layout.flex,
        Gutters.smallBMargin,
        {height: H_SIZE},
        styles.container,
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.black,
    opacity: 0.1,
  },
});
