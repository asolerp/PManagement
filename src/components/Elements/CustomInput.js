import React, {createRef, useState} from 'react';
import {View, TouchableOpacity, Text, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import IconCircle from './IconCirlce';

const CustomInput = ({title, subtitle, iconProps, switcher, onPress}) => {
  return (
    <React.Fragment>
      <TouchableOpacity style={styles.container} onPress={onPress}>
        <View style={styles.accordianContainer}>
          <View style={styles.iconContainer}>
            <IconCircle name={iconProps?.name} color={iconProps?.color} />
            <View style={styles.infoContainer}>
              <Text style={[styles.title, styles.font]}>{title}</Text>
              {subtitle && subtitle}
            </View>
          </View>
          <Icon name="keyboard-arrow-right" size={35} color="black" />
        </View>
      </TouchableOpacity>
    </React.Fragment>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 5,
  },
  title: {
    fontSize: 14,
    color: 'black',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    borderRadius: 100,
    marginRight: 10,
    padding: 5,
  },
  iconStyle: {},
  accordianContainer: {
    height: 40,
    paddingRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoContainer: {},
  separator: {
    borderBottomColor: '#EAEAEA',
    borderBottomWidth: 1,
    marginTop: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 56,
    paddingLeft: 25,
    paddingRight: 18,
    alignItems: 'center',
  },
  parentHr: {
    height: 1,
    color: 'white',
    width: '100%',
  },
  child: {
    paddingVertical: 10,
    paddingRight: 20,
    height: 'auto',
  },
});

export default CustomInput;
