import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { useTheme } from '../../Theme';

import { Colors, Variants } from '../../Theme/Variables';

const styles = StyleSheet.create({
  buttonWrapper: {
    padding: 12
  },
  clearStyle: {
    padding: 12
  },
  container: {
    width: '100%'
  },
  titleStyle: {
    fontSize: 15,
    textAlign: 'center'
  }
});

const CustomButton = ({
  styled,
  title,
  onPress,
  color,
  loading = false,
  disabled = false,
  containerStyle = [],
  type
}) => {
  const { Fonts, Layout } = useTheme();

  const parseStyled = () => {
    switch (styled) {
      default:
        return 12;
    }
  };

  const parseTypeStyle = () => {
    switch (type) {
      case 'clear':
        return 'clearStyle';
      default:
        return 'buttonWrapper';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, containerStyle]}
      onPress={onPress}
      disabled={disabled}
    >
      <View
        style={[
          Layout.rowCenter,
          {
            backgroundColor:
              type === 'clear' ? 'white' : color || Variants.pm.color,
            borderRadius: parseStyled(),
            borderColor: color || Colors.pm,
            borderWidth: 1
          },
          disabled
            ? { ...styles[parseTypeStyle(type)], ...{ opacity: 0.5 } }
            : { ...styles[parseTypeStyle(type)] }
        ]}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={type === 'clear' ? '#2A7BA5' : 'white'}
          />
        ) : (
          <Text
            style={[
              Fonts.textWhite,
              {
                ...{
                  color: type === 'clear' ? '#2A7BA5' : 'white'
                }
              }
            ]}
          >
            {title}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default CustomButton;
