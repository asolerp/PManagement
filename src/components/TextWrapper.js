import React from 'react';
import {View, StyleSheet} from 'react-native';
import {GREY_1} from '../styles/colors';

const styles = StyleSheet.create({
  wrapper: {
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: GREY_1,
  },
});

const TextWrapper = ({children}) => {
  return <View style={styles.wrapper}>{children}</View>;
};

export default TextWrapper;
