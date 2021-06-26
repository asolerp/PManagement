import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {useTheme} from '../../Theme';

import {Colors, Variants} from '../../Theme/Variables';

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  buttonWrapper: {
    padding: 12,
  },
  clearStyle: {
    padding: 12,
  },
  titleStyle: {
    textAlign: 'center',
    fontSize: 15,
  },
});

const CustomButton = ({
  styled,
  color = Colors.pm,
  title,
  onPress,
  loading = false,
  disabled = false,
  containerStyle = [],
  type,
}) => {
  const {Fonts, Layout} = useTheme();

  const parseStyled = () => {
    switch (styled) {
      default:
        return 5;
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
      style={containerStyle.concat([styles.container])}
      onPress={onPress}
      disabled={disabled}>
      <View
        style={[
          Layout.rowCenter,
          {
            backgroundColor: Variants.pm.color,
            borderRadius: parseStyled(),
          },
          disabled
            ? {...styles[parseTypeStyle(type)], ...{opacity: 0.5}}
            : {...styles[parseTypeStyle(type)]},
        ]}>
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
                  color: type === 'clear' ? '#2A7BA5' : 'white',
                },
              },
            ]}>
            {title}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default CustomButton;
