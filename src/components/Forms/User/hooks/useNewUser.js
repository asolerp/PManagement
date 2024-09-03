import { useCameraOrLibrary } from '../../../../hooks/useCamerOrLibrary';
import { imageActions } from '../../../../utils/imageActions';

export const useNewUser = setNewImage => {
  const { onImagePress } = useCameraOrLibrary();
  const handlePressImage = type => {
    onImagePress({
      type,
      options: { ...imageActions[type], selectionLimit: 1 },
      callback: async imgs => {
        const images = imgs.map((image, i) => ({
          fileName: image?.fileName || `image-${i}`,
          fileUri: image?.uri,
          fileType: image?.type
        }));
        setNewImage(images);
      }
    });
  };
  return {
    handlePressImage
  };
};
