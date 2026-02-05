import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';

import { imageActions } from '../../utils/imageActions';
import { useCameraOrLibrary } from '../../hooks/useCamerOrLibrary';
import { BottomModal } from './BottomModal';

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
      <Icon name={icon} size={28} color="#FFFFFF" />
    </View>
    <View style={styles.actionTextContainer}>
      <Text style={styles.actionTitle}>{title}</Text>
      <Text style={styles.actionSubtitle}>{subtitle}</Text>
    </View>
    <Icon name="chevron-right" size={24} color="#CBD5E0" />
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
            color="#55A5AD"
            onPress={() => handlePress(CAPTURE_ACTION)}
          />

          <View style={styles.divider} />

          <ActionOption
            icon="photo-library"
            title={t('photos.from_gallery')}
            subtitle={t('photos.from_gallery_description')}
            color="#8B5CF6"
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
    gap: 16,
    paddingHorizontal: 4,
    paddingVertical: 16
  },
  actionOptionPressed: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12
  },
  actionSubtitle: {
    color: '#6B7280',
    fontSize: 13,
    marginTop: 2
  },
  actionTextContainer: {
    flex: 1
  },
  actionTitle: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600'
  },
  cancelButton: {
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    marginTop: 8,
    paddingVertical: 16
  },
  cancelButtonPressed: {
    backgroundColor: '#E5E7EB'
  },
  cancelText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600'
  },
  container: {
    paddingBottom: Platform.OS === 'ios' ? 8 : 16,
    paddingHorizontal: 20
  },
  divider: {
    backgroundColor: '#E5E7EB',
    height: 1,
    marginVertical: 4
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 8
  },
  headerSubtitle: {
    color: '#6B7280',
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center'
  },
  headerTitle: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '700'
  },
  iconContainer: {
    alignItems: 'center',
    borderRadius: 14,
    height: 56,
    justifyContent: 'center',
    width: 56
  },
  optionsContainer: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8
  }
});

export default PhotoCameraModal;
