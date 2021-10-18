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
    borderWidth: 1,
  },
  filterText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

const Filter = ({text, onPress, color, active}) => {
  const {Fonts} = useTheme();

  return (
    <TouchableOpacity onPress={onPress}>
      <View
        style={[
          styles.filterWrapper,
          {
            borderColor: color.borderColor,
            backgroundColor: active ? color.backgroundColor : null,
          },
        ]}>
        <Text style={[Fonts.chip]}>{text}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default Filter;
