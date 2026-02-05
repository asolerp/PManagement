import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export const CustomSelect = ({
  backgroundColor = '#FFFFFF',
  withBubbles = false,
  onPressBubble,
  disabled = false,
  onPress,
  iconName = 'chevron-forward-outline',
  label,
  placeHolder,
  value
}) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Pressable
        onPress={!disabled && onPress}
        style={styles.pressableContainer}
      >
        <View style={styles.row}>
          <View style={[styles.inputContainer, { backgroundColor }]}>
            <View style={styles.contentRow}>
              {value ? (
                <Text style={styles.valueText}>{value}</Text>
              ) : (
                <Text style={styles.placeHolder}>{placeHolder}</Text>
              )}
              <Icon name={iconName} size={30} color="#000000" />
            </View>
          </View>
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%'
  },
  contentRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%'
  },
  inputContainer: {
    borderColor: '#EAEAEA',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    width: '100%'
  },
  label: {
    color: '#FFFFFF',
    marginBottom: 8
  },
  placeHolder: {
    opacity: 0.5
  },
  pressableContainer: {
    width: '100%'
  },
  row: {
    flexDirection: 'row'
  },
  valueText: {
    color: '#000000',
    fontSize: 14
  }
});
