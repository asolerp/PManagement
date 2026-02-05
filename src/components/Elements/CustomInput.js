import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import IconCircle from './IconCirlce';

const CustomInput = ({ title, label, subtitle, iconProps, onPress, style }) => {
  return (
    <View style={[style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity style={styles.container} onPress={onPress}>
        <View style={styles.accordianContainer}>
          <View style={styles.iconContainer}>
            <IconCircle name={iconProps?.name} color={iconProps?.color} />
            <View style={styles.infoContainer}>
              {!subtitle && <Text style={styles.title}>{title}</Text>}
              {subtitle && subtitle}
            </View>
          </View>
          <Icon name="keyboard-arrow-right" size={35} color="#000000" />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  accordianContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 40,
    justifyContent: 'space-between',
    paddingRight: 10
  },
  container: {
    borderColor: '#EAEAEA',
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    paddingVertical: 5
  },
  iconContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center'
  },
  infoContainer: {
    maxWidth: 200
  },
  label: {
    fontFamily: 'sans-serif',
    marginBottom: 8
  },
  title: {
    color: '#000000',
    fontSize: 14
  }
});

export default CustomInput;
