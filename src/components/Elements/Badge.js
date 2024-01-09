import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';

import {Colors, Variants} from '../../Theme/Variables';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useTheme} from '../../Theme';

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    borderRadius: 5,
  },
  label: {
    color: Colors.darkBlue,
    fontWeight: '500',
    fontSize: 12,
  },
  text: {
    fontWeight: 'bold',
    fontSize: 12,
  },
});

const Badge = ({
  type = 'normal',
  containerStyle,
  variant = 'pm',
  iconName,
  onPress,
  label,
  text,
}) => {
  const {Layout, Gutters} = useTheme();
  const variantSelected = Variants[variant];

  const isTypeNormal = type === 'normal';

  const BadgeComponent = () => {
    return (
        <View
        style={[
          Layout.row,
          Layout.alignItemsCenter,
          styles.container,
          {
            paddingHorizontal: isTypeNormal ? 10 : 0,
            paddingVertical: isTypeNormal ? 5 : 0,
            backgroundColor: isTypeNormal && variantSelected.backgroundColor,
          },
          containerStyle,
        ]}>
        {iconName && (
          <Icon
            name={iconName}
            size={18}
            color={variantSelected.color}
            style={[Gutters.tinyRMargin]}
          />
        )}
        <Text>
          {label && <Text style={styles.label}>{label}</Text>}
          <Text style={[styles.text, {color: variantSelected.color}]}>
            {text}
          </Text>
        </Text>
      </View>
    )
  }

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress}>
        <BadgeComponent />
      </TouchableOpacity>
    )
  }

  return (
    <BadgeComponent />
  );
};

export default Badge;
