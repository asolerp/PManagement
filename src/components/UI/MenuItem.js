import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { HDivider } from '../UI/HDivider';

export const MenuItem = ({
  title,
  textStyle,
  onPress,
  iconName,
  iconColor = '#000000'
}) => {
  return (
    <>
      <TouchableOpacity onPress={onPress} style={styles.container}>
        <View style={styles.leftContent}>
          <Icon name={iconName} size={25} color={iconColor} />
          <Text style={[styles.title, textStyle]}>{title}</Text>
        </View>
        <Icon name="chevron-forward" size={25} color="#000000" />
      </TouchableOpacity>
      <HDivider />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12
  },
  leftContent: {
    alignItems: 'center',
    flexDirection: 'row'
  },
  title: {
    color: '#000000',
    fontSize: 14,
    marginLeft: 12
  }
});
