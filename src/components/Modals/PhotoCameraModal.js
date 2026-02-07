import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';

import { imageActions } from '../../utils/imageActions';
import { useCameraOrLibrary } from '../../hooks/useCamerOrLibrary';
import { BottomModal } from './BottomModal';
import {
  Colors,
  FontSize,
  FontWeight,
  Spacing,
  BorderRadius
} from '../../Theme/Variables';

const CAPTURE_ACTION = 'capture';
const LIBRARY_ACTION = 'library';

// Opción de acción con icono grande
const ActionOption = ({ icon, title, subtitle, onPress, color }) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      styles.actionOption,
      pressed && styles.actionOptionPressed
    ]}
  >
    <View style={[styles.iconContainer, { backgroundColor: color }]}>
      <Icon name={icon} size={28} color={Colors.white} />
    </View>
    <View style={styles.actionTextContainer}>
      <Text style={styles.actionTitle}>{title}</Text>
      <Text style={styles.actionSubtitle}>{subtitle}</Text>
    </View>
    <Icon name="chevron-right" size={24} color={Colors.gray300} />
  </Pressable>
);

const PhotoCameraModal = ({ visible, handleVisibility, onSelectImage }) => {
  const { onImagePress } = useCameraOrLibrary();
  const { t } = useTranslation();

  const handlePress = type => {
    onImagePress({
      type,
      options: { ...imageActions[type], selectionLimit: 0 },
      callback: async imgs => {
        onSelectImage(imgs);
        handleVisibility(false);
      }
    });
  };

  const handleClose = () => {
    handleVisibility(false);
  };

  return (
    <BottomModal
      isVisible={visible}
      isFixedBottom
      swipeDirection={['down']}
      onClose={handleClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('photos.add_photo')}</Text>
          <Text style={styles.headerSubtitle}>
            {t('photos.add_photo_description')}
          </Text>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          <ActionOption
            icon="camera-alt"
            title={t('photos.take_photo')}
            subtitle={t('photos.take_photo_description')}
            color={Colors.primary}
            onPress={() => handlePress(CAPTURE_ACTION)}
          />

          <View style={styles.divider} />

          <ActionOption
            icon="photo-library"
            title={t('photos.from_gallery')}
            subtitle={t('photos.from_gallery_description')}
            color={Colors.purple}
            onPress={() => handlePress(LIBRARY_ACTION)}
          />
        </View>

        {/* Cancel Button */}
        <Pressable
          onPress={handleClose}
          style={({ pressed }) => [
            styles.cancelButton,
            pressed && styles.cancelButtonPressed
          ]}
        >
          <Text style={styles.cancelText}>{t('alerts.cancel')}</Text>
        </Pressable>
      </View>
    </BottomModal>
  );
};

const styles = StyleSheet.create({
  actionOption: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.base,
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.base
  },
  actionOptionPressed: {
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.lg
  },
  actionSubtitle: {
    color: Colors.gray500,
    fontSize: FontSize.sm,
    marginTop: 2
  },
  actionTextContainer: {
    flex: 1
  },
  actionTitle: {
    color: Colors.gray900,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold
  },
  cancelButton: {
    alignItems: 'center',
    backgroundColor: Colors.gray100,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.sm,
    paddingVertical: Spacing.base
  },
  cancelButtonPressed: {
    backgroundColor: Colors.gray200
  },
  cancelText: {
    color: Colors.gray600,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold
  },
  container: {
    paddingBottom: Platform.OS === 'ios' ? Spacing.sm : Spacing.base,
    paddingHorizontal: Spacing.lg
  },
  divider: {
    backgroundColor: Colors.gray200,
    height: 1,
    marginVertical: Spacing.xs
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    paddingTop: Spacing.sm
  },
  headerSubtitle: {
    color: Colors.gray500,
    fontSize: FontSize.base,
    marginTop: Spacing.xs,
    textAlign: 'center'
  },
  headerTitle: {
    color: Colors.gray900,
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold
  },
  iconContainer: {
    alignItems: 'center',
    borderRadius: BorderRadius.xl,
    height: 56,
    justifyContent: 'center',
    width: 56
  },
  optionsContainer: {
    backgroundColor: Colors.white,
    borderColor: Colors.gray200,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm
  }
});

export default PhotoCameraModal;
