import React from 'react';
import {View, StyleSheet, Text} from 'react-native';

const PriorityResume = ({color, label, value}) => {
  return (
    <View
      style={{
        width: '100%',
        flexDirection: 'row',
        width: 120,
        justifyContent: 'space-between',
        marginBottom: 15,
      }}>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <View
          style={{
            width: 20,
            height: 20,
            backgroundColor: color,
            borderRadius: 100,
            marginRight: 8,
          }}
        />
        <Text>{label}</Text>
      </View>
      <Text style={{fontWeight: 'bold'}}>{value}</Text>
    </View>
  );
};

export default PriorityResume;
