import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSize, FontWeight, Spacing } from '../../Theme/Variables';

export const ScreenHeader = ({ title, subtitle }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xs
  },
  subtitle: {
    color: Colors.gray500,
    fontSize: FontSize.base,
    lineHeight: 20
  },
  title: {
    color: Colors.gray900,
    fontSize: FontSize['3xl'],
    fontWeight: FontWeight.bold,
    lineHeight: 32
  }
});
