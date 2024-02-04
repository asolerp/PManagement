import React, {useState} from 'react';

import {View} from 'react-native';

import {MenuItem} from '../UI/MenuItem';
import {imageActions} from '../../utils/imageActions';
import {useCameraOrLibrary} from '../../hooks/useCamerOrLibrary';

import {useTheme} from '../../Theme';

import {BottomModal} from './BottomModal';

const CAPTURE_ACTION = 'capture';
const LIBRARY_ACTION = 'library';

export const IncidencesCameraModal = ({setImages, isVisible, setIsVisible}) => {
  const {Layout, Gutters} = useTheme();
  const {onImagePress} = useCameraOrLibrary();

  const handlePress = (type) => {
    onImagePress({
      type,
      options: {...imageActions[type], selectionLimit: 0},
      callback: async (imgs) => {
        setImages(
          imgs.map((image, i) => ({
            fileName: image?.fileName || `image-${i}`,
            fileUri: image?.uri,
            fileType: image?.type,
          })),
        );
        setIsVisible(false);
      },
    });
  };

  return (
    <BottomModal
      isVisible={isVisible}
      swipeDirection={null}
      onClose={() => {
        setIsVisible(false);
      }}>
      <MenuItem
        iconName="camera"
        title="Usar cámara"
        onPress={() => handlePress(CAPTURE_ACTION)}
      />

      <MenuItem
        iconName="folder"
        title="Acceder a fotos"
        onPress={() => handlePress(LIBRARY_ACTION)}
      />
    </BottomModal>
  );
};
