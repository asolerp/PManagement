import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import {
  Colors,
  FontSize,
  FontWeight,
  Spacing,
  BorderRadius
} from '../../Theme/Variables';

const CustomButton = ({
  styled,
  title,
  onPress,
  color,
  loading = false,
  disabled = false,
  containerStyle = [],
  type,
  variant = 'primary' // primary, secondary, outline, danger
}) => {
  const borderRadius = styled || BorderRadius.lg;
  const isClearType = type === 'clear' || variant === 'outline';

  // Colores según variante
  const getColors = () => {
    if (isClearType) {
      return {
        backgroundColor: Colors.white,
        borderColor: color || Colors.pm,
        textColor: color || Colors.pm
      };
    }
    if (variant === 'secondary') {
      return {
        backgroundColor: Colors.gray100,
        borderColor: Colors.gray200,
        textColor: Colors.gray700
      };
    }
    if (variant === 'danger') {
      return {
        backgroundColor: Colors.danger,
        borderColor: Colors.danger,
        textColor: Colors.white
      };
    }
    // primary
    return {
      backgroundColor: color || Colors.pm,
      borderColor: color || Colors.pm,
      textColor: Colors.white
    };
  };

  const { backgroundColor, borderColor, textColor } = getColors();

  return (
    <TouchableOpacity
      style={[styles.container, containerStyle]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      <View
        style={[
          styles.buttonBase,
          {
            backgroundColor,
            borderRadius,
            borderColor,
            opacity: disabled ? 0.5 : 1
          }
        ]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={textColor} />
        ) : (
          <Text style={[styles.title, { color: textColor }]}>{title}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonBase: {
    alignItems: 'center',
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    padding: Spacing.md
  },
  container: {
    width: '100%'
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    textAlign: 'center'
  }
});

export default CustomButton;
