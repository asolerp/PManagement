import React from 'react';
import {Touchable} from 'react-native';
import {View, StyleSheet} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';

import Label from './Label';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  labelWrapper: {
    width: 100,
  },
});

const PrioritySelector = ({set, get}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => set('low')} style={styles.labelWrapper}>
        <Label title="Baja" color="#58BFC0" active={get === 'low'} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => set('medium')}
        style={styles.labelWrapper}>
        <Label title="Media" color="#DDD363" active={get === 'medium'} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => set('height')}
        style={styles.labelWrapper}>
        <Label title="Alta" color="#DB6E6E" active={get === 'height'} />
      </TouchableOpacity>
    </View>
  );
};

export default PrioritySelector;
