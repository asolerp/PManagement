import React from 'react';
import {View, StyleSheet} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons';

const styles = StyleSheet.create({
  iconCircle: {
    borderRadius: 100,
    marginRight: 10,
    padding: 5,
  },
});

const IconCircle = ({name, color}) => {
  return (
    <View style={[styles.iconCircle, {backgroundColor: color}]}>
      <Icon name={name} size={20} color="white" style={styles.iconStyle} />
    </View>
  );
};

export default IconCircle;
