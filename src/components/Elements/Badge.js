import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Colors, Variants} from '../../Theme/Variables';

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  label: {
    color: Colors.darkBlue,
    fontWeight: '500',
    fontSize: 12,
  },
  text: {
    fontWeight: 'bold',
    fontSize: 12,
  },
});

const Badge = ({containerStyle, label, text, variant = 'pm'}) => {
  const variantSelected = Variants[variant];
  return (
    <View
      style={[
        styles.container,
        {backgroundColor: variantSelected.backgroundColor},
        {...containerStyle},
      ]}>
      <Text>
        {label && <Text style={styles.label}>{label}</Text>}
        <Text style={[styles.text, {color: variantSelected.color}]}>
          {text}
        </Text>
      </Text>
    </View>
  );
};

export default Badge;
