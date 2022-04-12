import React, {useContext} from 'react';

import {MenuItem} from '../UI/MenuItem';
import {imageActions} from '../../utils/imageActions';
import {useCameraOrLibrary} from '../../hooks/useCamerOrLibrary';
import {LoadingModalContext} from '../../context/loadinModalContext';

import useUploadImageCheck from '../../hooks/useUploadImage';
import {CHECKLISTS} from '../../utils/firebaseKeys';
import {BottomModal} from './BottomModal';
import {timeout} from '../../utils/timeout';

const CAPTURE_ACTION = 'capture';
const LIBRARY_ACTION = 'library';

const PhotoCameraModal = ({visible, check, checklistId, handleVisibility}) => {
  const {onImagePress} = useCameraOrLibrary();

  const {uploadImages} = useUploadImageCheck(CHECKLISTS, checklistId);
  const {setVisible} = useContext(LoadingModalContext);

  const handlePress = (type) => {
    onImagePress({
      type,
      options: {...imageActions[type], selectionLimit: 0},
      callback: async (imgs) => {
        try {
          handleVisibility(false);
          await timeout(400);
          setVisible(true);
          await uploadImages(imgs, check);
        } catch (err) {
          console.log(err);
        } finally {
          setVisible(false);
        }
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
        iconName="ios-camera"
        title="Usar cámara"
        onPress={() => handlePress(CAPTURE_ACTION)}
      />

      <MenuItem
        iconName="ios-folder"
        title="Acceder a fotos"
        onPress={() => handlePress(LIBRARY_ACTION)}
      />
    </BottomModal>
  );
};

export default PhotoCameraModal;
