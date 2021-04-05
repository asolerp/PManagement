import React from 'react';
import {View, StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  wrapper: {
    padding: 10,
    backgroundColor: '#f4f4f4',
    borderRadius: 10,
    marginBottom: 20,
  },
});

const TextWrapper = ({children}) => {
  return <View style={styles.wrapper}>{children}</View>;
};

export default TextWrapper;
