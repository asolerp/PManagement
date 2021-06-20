import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useTheme} from '../Theme';
import {Colors} from '../Theme/Variables';
const Counter = ({count, customStyles, size = 'small'}) => {
  const parseSize = {
    small: {
      width: 15,
      height: 15,
    },
    big: {
      width: 20,
      height: 20,
    },
  };

  const {Layout} = useTheme();
  return (
    <View
      style={[
        Layout.colCenter,
        styles.container,
        parseSize[size],
        {...customStyles},
      ]}>
      <Text style={{color: Colors.white, fontSize: 10, fontWeight: 'bold'}}>
        {count}
      </Text>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    width: 15,
    height: 15,
    borderRadius: 100,
    backgroundColor: Colors.danger,
  },
});

export default Counter;
