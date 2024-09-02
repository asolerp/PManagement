import { useContext, useEffect, useState } from 'react';

// Firebase
import { useUpdateFirebase } from '../../hooks/useUpdateFirebase';

import useAuth from '../../utils/useAuth';
import { error } from '../../lib/logging';
import { useCameraOrLibrary } from '../../hooks/useCamerOrLibrary';
import { imageActions } from '../../utils/imageActions';
import { useTheme } from '../../Theme';
import { LoadingModalContext } from '../../context/loadinModalContext';
import useUploadImageCheck from '../../hooks/useUploadImage';
import { HOUSES } from '../../utils/firebaseKeys';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchHouse } from '../../Services/firebase/houseServices';

export const useHouseScreen = ({ route }) => {
  const { Gutters } = useTheme();
  const [infoHouse, setInfoHouse] = useState();
  const [newImage, setNewImage] = useState();
  const { isAdmin } = useAuth();
  const { houseId } = route.params;

  const { setVisible } = useContext(LoadingModalContext);
  const { data: house } = useQuery({
    queryKey: ['house', houseId],
    queryFn: () => fetchHouse(houseId)
  });
  const { updateFirebase } = useUpdateFirebase('houses');

  const queryClient = useQueryClient();
  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const { onImagePress } = useCameraOrLibrary();
  const { uploadImages } = useUploadImageCheck(HOUSES);

  const handlePressImage = type => {
    onImagePress({
      type,
      options: { ...imageActions[type], selectionLimit: 1 },
      callback: async imgs => {
        setNewImage(
          imgs.map((image, i) => ({
            fileBase64: image?.base64,
            fileName: image?.fileName || `image-${i}`,
            fileUri: image?.uri,
            fileType: image?.type
          }))
        );
      }
    });
  };

  const handleEdit = async () => {
    setVisible(true);
    try {
      if (infoHouse) {
        await updateFirebase(houseId, {
          ...infoHouse
        });
      }
      if (newImage) {
        await uploadImages(newImage, null, houseId);
      }

      queryClient.invalidateQueries({ queryKey: [HOUSES] });
      queryClient.invalidateQueries({ queryKey: ['house', houseId] });
    } catch (err) {
      error({
        message: err.message,
        track: true,
        asToast: true
      });
    } finally {
      setNewImage(null);
      setVisible(false);
    }
  };

  useEffect(() => {
    if (house) {
      setInfoHouse(house);
    }
  }, [house]);

  return {
    house,
    Gutters,
    isAdmin,
    houseId,
    newImage,
    infoHouse,
    handleEdit,
    setNewImage,
    setInfoHouse,
    modalVisible,
    setModalVisible,
    handlePressImage
  };
};
