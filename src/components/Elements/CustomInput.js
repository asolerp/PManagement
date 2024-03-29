import React from 'react';
import {View, TouchableOpacity, Text, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import theme from '../../Theme/Theme';
import IconCircle from './IconCirlce';

const CustomInput = ({title, label, subtitle, iconProps, onPress, style}) => {
  return (
    <View style={[style]}>
      {label && <Text style={[theme.mB2, theme.fontSans]}>{label}</Text>}
      <TouchableOpacity style={styles.container} onPress={onPress}>
        <View style={styles.accordianContainer}>
          <View style={styles.iconContainer}>
            <IconCircle name={iconProps?.name} color={iconProps?.color} />
            <View style={styles.infoContainer}>
              {!subtitle && (
                <Text style={[styles.title, styles.font]}>{title}</Text>
              )}
              {subtitle && subtitle}
            </View>
          </View>
          <Icon name="keyboard-arrow-right" size={35} color="black" />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    paddingVertical: 5,
    borderColor: '#EAEAEA',
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
  infoContainer: {
    maxWidth: 200,
  },
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
