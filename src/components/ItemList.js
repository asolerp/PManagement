import React from 'react';

import {View, Text, Image, StyleSheet} from 'react-native';
import CheckBox from '@react-native-community/checkbox';

//Ui
import Avatar from './Avatar';

const ItemList = ({item, schema, handleChange, active}) => {
  return (
    <View style={styles.container}>
      <Avatar uri={item[schema?.img]} size="big" />
      <View style={styles.infoWrapper}>
        <Text style={styles.name}>{item[schema.name]}</Text>
      </View>
      <View style={styles.checkboxWrapper}>
        <CheckBox
          disabled={false}
          value={active}
          onValueChange={(newValue) => handleChange(newValue)}
        />
      </View>
    </View>
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
