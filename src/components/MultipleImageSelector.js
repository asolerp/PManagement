import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import PhotoCameraModal from './Modals/PhotoCameraModal';
import {
  Colors,
  Spacing,
  BorderRadius,
  Shadows
} from '../Theme/Variables';

const MultipleImageSelector = ({ images = [], setImages }) => {
  const [isVisible, setIsVisible] = useState(false);

  const handleSelectImages = imgs => {
    const formattedImages = imgs.map((image, i) => ({
      fileName: image?.fileName || `image-${i}`,
      fileUri: image?.uri,
      fileType: image?.type
    }));

    // Añadir a las existentes en lugar de reemplazar
    const currentImages = Array.isArray(images) ? images : [];
    setImages([...currentImages, ...formattedImages]);
  };

  const handleRemoveImage = fileName => {
    const currentImages = Array.isArray(images) ? images : [];
    setImages(currentImages.filter(p => p.fileName !== fileName));
  };

  return (
    <View style={styles.container}>
      <PhotoCameraModal
        visible={isVisible}
        handleVisibility={setIsVisible}
        onSelectImage={handleSelectImages}
      />

      {/* Botón añadir */}
      <Pressable
        onPress={() => setIsVisible(true)}
        style={({ pressed }) => [
          styles.addButton,
          pressed && styles.addButtonPressed
        ]}
      >
        <Icon name="add-a-photo" size={24} color={Colors.white} />
      </Pressable>

      {/* Lista de imágenes */}
      {Array.isArray(images) && images.map((photo, i) => (
        <View style={styles.imageContainer} key={photo.fileName || i}>
          <Pressable
            style={styles.removeButton}
            onPress={() => handleRemoveImage(photo.fileName)}
            hitSlop={8}
          >
            <Icon name="close" size={14} color={Colors.white} />
          </Pressable>
          <Image
            source={{ uri: photo?.fileUri }}
            style={styles.thumbnail}
          />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  addButton: {
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    height: 80,
    justifyContent: 'center',
    marginRight: Spacing.sm,
    width: 80,
    ...Shadows.sm
  },
  addButtonPressed: {
    opacity: 0.8
  },
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm
  },
  imageContainer: {
    position: 'relative'
  },
  removeButton: {
    alignItems: 'center',
    backgroundColor: Colors.danger,
    borderRadius: BorderRadius.full,
    height: 22,
    justifyContent: 'center',
    position: 'absolute',
    right: -6,
    top: -6,
    width: 22,
    zIndex: 2
  },
  thumbnail: {
    borderRadius: BorderRadius.lg,
    height: 80,
    width: 80
  }
});

export default MultipleImageSelector;
