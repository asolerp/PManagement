import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { format } from 'date-fns';
import {
  Colors,
  FontSize,
  FontWeight,
  Spacing,
  BorderRadius,
  Shadows
} from '../../Theme/Variables';
import { HDivider } from '../UI/HDivider';

const EntranceCard = ({ entrance, onRegisterExit }) => {
  if (!entrance) return null;

  const entranceTime = format(
    entrance?.date?.seconds * 1000 + entrance?.date?.nanoseconds / 1000000,
    'HH:mm'
  );

  return (
    <>
      <View style={styles.container}>
        <View style={styles.card}>
          {/* Icono y estado */}
          <View style={styles.iconContainer}>
            <Icon name="login" size={24} color={Colors.white} />
          </View>

          {/* Info */}
          <View style={styles.infoContainer}>
            <Text style={styles.title}>Entrada registrada</Text>
            <View style={styles.timeRow}>
              <Icon name="schedule" size={16} color={Colors.gray500} />
              <Text style={styles.timeText}>{entranceTime}</Text>
            </View>
          </View>

          {/* Botón salida */}
          <Pressable
            onPress={() => onRegisterExit(entrance.id)}
            style={({ pressed }) => [
              styles.exitButton,
              pressed && styles.exitButtonPressed
            ]}
          >
            <Icon name="logout" size={18} color={Colors.white} />
            <Text style={styles.exitButtonText}>Salida</Text>
          </Pressable>
        </View>
      </View>
      <HDivider style={styles.divider} />
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    flexDirection: 'row',
    padding: Spacing.md,
    ...Shadows.md
  },
  container: {
    marginHorizontal: Spacing.base
  },
  divider: {
    marginVertical: Spacing.md
  },
  exitButton: {
    alignItems: 'center',
    backgroundColor: Colors.danger,
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm
  },
  exitButtonPressed: {
    opacity: 0.8
  },
  exitButtonText: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold
  },
  iconContainer: {
    alignItems: 'center',
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.lg,
    height: 44,
    justifyContent: 'center',
    marginRight: Spacing.md,
    width: 44
  },
  infoContainer: {
    flex: 1
  },
  timeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: Spacing.xs
  },
  timeText: {
    color: Colors.gray600,
    fontSize: FontSize.sm
  },
  title: {
    color: Colors.gray800,
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold
  }
});

export default EntranceCard;
