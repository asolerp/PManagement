import React from 'react';

import {MenuItem} from '../UI/MenuItem';
import {imageActions} from '../../utils/imageActions';
import {useCameraOrLibrary} from '../../hooks/useCamerOrLibrary';

import {BottomModal} from './BottomModal';

const CAPTURE_ACTION = 'capture';
const LIBRARY_ACTION = 'library';

const PhotoCameraModal = ({visible, handleVisibility, onSelectImage}) => {
  const {onImagePress} = useCameraOrLibrary();

  const handlePress = (type) => {
    onImagePress({
      type,
      options: {...imageActions[type], selectionLimit: 0},
      callback: async (imgs) => {
        onSelectImage(imgs);
        handleVisibility(false);
      },
    });
  };

  return (
    <BottomModal
      isVisible={visible}
      swipeDirection={null}
      onClose={() => {
        handleVisibility(false);
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

export default PhotoCameraModal;
