import React, {useEffect, useRef} from 'react';
import {View, Text, StyleSheet, Animated} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 20,
  },
  icon: {
    marginLeft: 5,
  },
  textStyle: {
    color: 'white',
  },
});

const InfoIcon = ({info, icon, color, style}) => {
  return (
    <View
      style={{
        ...style,
        ...styles.container,
        ...{backgroundColor: color},
      }}>
      <Text style={styles.textStyle}>{info}</Text>
      {icon && (
        <Icon name={icon} size={15} color={'white'} style={styles.icon} />
      )}
    </View>
  );
};

export default InfoIcon;
