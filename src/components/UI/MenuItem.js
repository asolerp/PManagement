import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors, Spacing, BorderRadius } from '../../Theme/Variables';

// Mapeo de iconos antiguos (Ionicons) a nuevos (MaterialIcons)
const ICON_MAP = {
  pencil: 'edit',
  duplicate: 'content-copy',
  trash: 'delete-outline',
  key: 'vpn-key',
  'chevron-forward': 'chevron-right'
};

export const MenuItem = ({
  title,
  subtitle,
  textStyle,
  onPress,
  iconName,
  iconColor,
  variant = 'default', // 'default' | 'danger' | 'warning'
  showChevron = false
}) => {
  // Determinar colores según variante
  const getColors = () => {
    switch (variant) {
      case 'danger':
        return {
          bg: Colors.danger + '10',
          icon: Colors.danger,
          text: Colors.danger
        };
      case 'warning':
        return {
          bg: Colors.warning + '10',
          icon: Colors.warning,
          text: Colors.warning
        };
      default:
        return {
          bg: Colors.gray100,
          icon: iconColor || Colors.gray600,
          text: Colors.gray900
        };
    }
  };

  const colors = getColors();
  const mappedIcon = ICON_MAP[iconName] || iconName;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.container}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: colors.bg }]}>
        <Icon name={mappedIcon} size={20} color={colors.icon} />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: colors.text }, textStyle]}>
          {title}
        </Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {showChevron && (
        <Icon name="chevron-right" size={20} color={Colors.gray400} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    marginBottom: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md
  },
  iconContainer: {
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    height: 40,
    justifyContent: 'center',
    width: 40
  },
  subtitle: {
    color: Colors.gray500,
    fontSize: 12,
    marginTop: 2
  },
  textContainer: {
    flex: 1,
    marginLeft: Spacing.md
  },
  title: {
    fontSize: 15,
    fontWeight: '500'
  }
});
