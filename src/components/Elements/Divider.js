import React from 'react';

import {View, StyleSheet} from 'react-native';
import {Colors} from '../../Theme/Variables';

const styles = StyleSheet.create({
  divider: {
    borderBottomColor: Colors.grey,
    borderBottomWidth: 1,
  },
});

const Divider = () => {
  return <View style={styles.divider} />;
};

export default Divider;
