import React from 'react';
import {View, StyleSheet} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons';

const AddButton = ({iconName, backColor = '#3E93A8'}) => {
  return (
    <View style={{...styles.container, ...{backgroundColor: backColor}}}>
      <Icon name={iconName} size={30} color={'white'} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 50,
    elevation: 3,
    height: 50,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
});

export default AddButton;
