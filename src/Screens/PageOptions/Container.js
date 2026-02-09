import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { useTranslation } from 'react-i18next';
import { MenuItem } from '../../components/UI/MenuItem';
import { Colors, Spacing, BorderRadius } from '../../Theme/Variables';

const Container = ({
  showDelete,
  onDelete,
  duplicate,
  showRestorePassword,
  onRestorePassword,
  onDuplicate,
  editable = true,
  onEdit = () => {}
}) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      {/* Header - alineado con el botón de cerrar del modal */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Opciones</Text>
      </View>

      {/* Options List */}
      <View style={styles.optionsList}>
        {editable && (
          <MenuItem
            iconName="edit"
            title={t('options.edit')}
            subtitle="Modificar información"
            onPress={onEdit}
          />
        )}

        {duplicate && (
          <MenuItem
            iconName="content-copy"
            title={t('options.duplicate')}
            subtitle="Crear una copia"
            onPress={onDuplicate}
          />
        )}

        {showRestorePassword && (
          <MenuItem
            iconName="vpn-key"
            title={t('options.restorePassword')}
            subtitle="Enviar email de recuperación"
            onPress={onRestorePassword}
            variant="warning"
          />
        )}
      </View>

      {/* Danger Zone */}
      {showDelete && (
        <View style={styles.dangerZone}>
          <Text style={styles.dangerZoneLabel}>Zona de peligro</Text>
          <MenuItem
            iconName="delete-outline"
            title={t('options.delete')}
            subtitle="Esta acción no se puede deshacer"
            onPress={onDelete}
            variant="danger"
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg
  },
  dangerZone: {
    marginTop: Spacing.lg
  },
  dangerZoneLabel: {
    color: Colors.danger,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    textTransform: 'uppercase'
  },
  header: {
    // Altura alineada con el botón de cerrar (44px de altura + 12px top)
    alignItems: 'flex-start',
    height: 44,
    justifyContent: 'center',
    marginBottom: Spacing.md
  },
  headerTitle: {
    color: Colors.gray900,
    fontSize: 18,
    fontWeight: '600'
  },
  optionsList: {
    gap: Spacing.xs
  }
});

export default Container;
