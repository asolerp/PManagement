import React from 'react';
import {View, StyleSheet, Text, Switch} from 'react-native';

import IconCircle from './IconCirlce';

const styles = StyleSheet.create({
  inputRecurrenteWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 10,
  },
  inputRecurrente: {
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
});

const InputWithSwitch = ({title, icon, get, set, disabled = false}) => {
  return (
    <View style={styles.inputRecurrenteWrapper}>
      <View style={styles.inputRecurrente}>
        {icon && <IconCircle name={icon.name} color={icon.color} />}
        <Text style={disabled && {opacity: 0.2}}>{title}</Text>
      </View>
      <Switch
        disabled={disabled}
        style={{transform: [{scaleX: 0.8}, {scaleY: 0.8}]}}
        trackColor={{false: '#C9C9C9', true: '#81b0ff'}}
        thumbColor={get ? '#f5dd4b' : '#f4f3f4'}
        ios_backgroundColor="#3e3e3e"
        onValueChange={(e) => set(e)}
        value={get}
      />
    </View>
  );
};

export default InputWithSwitch;
