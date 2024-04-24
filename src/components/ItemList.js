import React from 'react';

import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import {DEFAULT_IMAGE} from '../constants/general';

//Ui
import Avatar from './Avatar';
import theme from '../Theme/Theme';

const ItemList = ({item, schema, handleChange, active}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => handleChange(!active)}>
      <Avatar uri={item?.[schema?.img]?.small || DEFAULT_IMAGE} size="big" />
      <View style={styles.infoWrapper}>
        <Text style={[styles.name, theme.textBlack]}>{item?.[schema.name]}</Text>
        {
          schema?.lastname && (
            <Text style={[styles.name, theme.textBlack]}>{item?.[schema.lastname]}</Text>
          )
        }
      </View>
      <View style={styles.checkboxWrapper}>
        <CheckBox disabled={false} value={active} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'white',
    alignItems: 'center',
    padding: 10,
  },
  avatarWrapper: {
    flex: 1,
  },
  infoWrapper: {
    flex: 6,
    marginLeft: 10,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 100,
    resizeMode: 'cover',
  },
  name: {
    fontSize: 15,
  },
});

export default ItemList;
