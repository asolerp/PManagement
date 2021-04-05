import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  buttonWrapper: {
    backgroundColor: '#2A7BA5',
    borderRadius: 20,
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
  title,
  onPress,
  loading = false,
  disabled = false,
  type,
}) => {
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
      style={styles.container}
      onPress={onPress}
      disabled={disabled}>
      <View
        style={
          disabled
            ? {...styles[parseTypeStyle(type)], ...{opacity: 0.5}}
            : {...styles[parseTypeStyle(type)]}
        }>
        {loading ? (
          <ActivityIndicator
            size="small"
            color={type === 'clear' ? '#2A7BA5' : 'white'}
          />
        ) : (
          <Text
            style={{
              ...styles.titleStyle,
              ...{
                color: type === 'clear' ? '#2A7BA5' : 'white',
              },
            }}>
            {title}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default CustomButton;
