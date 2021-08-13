import React from 'react';
import {View, TouchableOpacity, Text, StyleSheet} from 'react-native';
import {useTheme} from '../../Theme';
import {Colors} from '../../Theme/Variables';

const styles = StyleSheet.create({
  filterWrapper: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 10,
  },
  filterText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

const Filter = ({text, onPress, color, active}) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <View
        style={{
          ...styles.filterWrapper,
          ...{
            backgroundColor: color.backgroundColor,
            opacity: active ? 1 : 0.4,
          },
        }}>
        <Text style={{fontSize: 14, color: color.color, fontWeight: 'bold'}}>
          {text}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default Filter;
