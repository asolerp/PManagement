import {useCameraOrLibrary} from './useCamerOrLibrary';
import {imageActions} from '../utils/imageActions';

export const useChoseImage = (setNewImage) => {
  const {onImagePress} = useCameraOrLibrary();
  const handlePressImage = (type) => {
    onImagePress({
      type,
      options: {...imageActions[type]},
      callback: async (imgs) => {
        const images = imgs.map((image, i) => ({
          fileBase64: image?.base64,
          fileName: image?.fileName || `image-${i}`,
          fileUri: image?.uri,
          fileType: image?.type,
        }));
        setNewImage(images);
      },
    });
  };
  return {
    handlePressImage,
  };
};
