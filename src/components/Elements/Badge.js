import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const VARIANT_COLORS = {
  pm: {
    backgroundColor: '#E6F7F7',
    color: '#55A5AD'
  },
  success: {
    backgroundColor: '#E6F5ED',
    color: '#10B981'
  },
  warning: {
    backgroundColor: '#FEF3E6',
    color: '#F59E0B'
  },
  error: {
    backgroundColor: '#FEE6E6',
    color: '#EF4444'
  },
  info: {
    backgroundColor: '#E6F2FE',
    color: '#3B82F6'
  }
};

const Badge = ({
  type = 'normal',
  containerStyle,
  variant = 'pm',
  iconName,
  onPress,
  label,
  text,
  textStyle,
  iconSize = 18
}) => {
  const variantSelected = VARIANT_COLORS[variant] || VARIANT_COLORS.pm;
  const isTypeNormal = type === 'normal';

  const BadgeComponent = () => {
    return (
      <View
        style={[
          styles.container,
          {
            paddingHorizontal: isTypeNormal ? 10 : 0,
            paddingVertical: isTypeNormal ? 5 : 0,
            backgroundColor: isTypeNormal && variantSelected.backgroundColor
          },
          containerStyle
        ]}
      >
        {iconName && (
          <Icon
            name={iconName}
            size={iconSize}
            color={variantSelected.color}
            style={styles.icon}
          />
        )}
        <Text>
          {label && <Text style={[styles.label, textStyle]}>{label}</Text>}
          <Text
            style={[styles.text, { color: variantSelected.color }, textStyle]}
          >
            {text}
          </Text>
        </Text>
      </View>
    );
  };

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress}>
        <BadgeComponent />
      </TouchableOpacity>
    );
  }

  return <BadgeComponent />;
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: 5,
    flexDirection: 'row'
  },
  icon: {
    marginRight: 4
  },
  label: {
    color: '#1E3A8A',
    fontSize: 12,
    fontWeight: '500'
  },
  text: {
    fontSize: 12,
    fontWeight: 'bold'
  }
});

export default Badge;
