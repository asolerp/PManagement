import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {Variants} from '../../Theme/Variables';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginTop: 0,
  },
  filterWrapper: {
    paddingHorizontal: 5,
    paddingVertical: 5,
    borderRadius: 5,
    marginRight: 10,
  },
  filterText: {
    color: 'white',
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
        <Text style={(styles.filterText, {color: color.color})}>{text}</Text>
      </View>
    </TouchableOpacity>
  );
};

const StatusIncidence = ({onChangeFilter, state}) => {
  return (
    <View style={styles.container}>
      <Filter
        text="Resuletas"
        color={Variants.success}
        active={state === true}
        onPress={() => onChangeFilter(true)}
      />
      <Filter
        text="Sin resolver"
        color={Variants.danger}
        active={state === false}
        onPress={() => onChangeFilter(false)}
      />
    </View>
  );
};

export default React.memo(StatusIncidence);
