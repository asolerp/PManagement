import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { DEFAULT_IMAGE } from '../constants/general';

// UI
import Avatar from './Avatar';

const ItemList = ({ item, schema, handleChange, active }) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        active && styles.containerActive,
        pressed && styles.containerPressed
      ]}
      onPress={() => handleChange(!active)}
    >
      <Avatar uri={item?.[schema?.img]?.small || DEFAULT_IMAGE} size="big" />

      <View style={styles.infoWrapper}>
        <Text style={styles.name} numberOfLines={1}>
          {item?.[schema.name]}
        </Text>
        {schema?.lastname && item?.[schema.lastname] && (
          <Text style={styles.lastname} numberOfLines={1}>
            {item?.[schema.lastname]}
          </Text>
        )}
      </View>

      <View style={styles.checkboxWrapper}>
        <View style={[styles.radioButton, active && styles.radioButtonActive]}>
          {active && <View style={styles.radioButtonInner} />}
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  checkboxWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
    minWidth: 30
  },
  container: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 14
  },
  containerActive: {
    backgroundColor: '#F0FDFA'
  },
  containerPressed: {
    backgroundColor: '#F9FAFB'
  },
  infoWrapper: {
    flex: 1,
    marginLeft: 12
  },
  lastname: {
    color: '#9CA3AF',
    fontSize: 13,
    marginTop: 2
  },
  name: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '500'
  },
  radioButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E0',
    borderRadius: 12,
    borderWidth: 2,
    height: 24,
    justifyContent: 'center',
    width: 24
  },
  radioButtonActive: {
    borderColor: '#55A5AD'
  },
  radioButtonInner: {
    backgroundColor: '#55A5AD',
    borderRadius: 8,
    height: 12,
    width: 12
  }
});

export default ItemList;
