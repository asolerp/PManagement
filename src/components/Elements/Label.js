import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    padding: 5,
    marginHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: 'white',
  },
});

const Label = ({active, title, color}) => {
  return (
    <View
      style={[
        styles.container,
        {backgroundColor: color, opacity: active ? 1 : 0.4},
      ]}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

export default Label;
