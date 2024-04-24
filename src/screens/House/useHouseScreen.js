import {useContext, useEffect, useState} from 'react';

// Firebase
import firestore from '@react-native-firebase/firestore';
import {useUpdateFirebase} from '../../hooks/useUpdateFirebase';

import useAuth from '../../utils/useAuth';
import {error} from '../../lib/logging';
import {useCameraOrLibrary} from '../../hooks/useCamerOrLibrary';
import {imageActions} from '../../utils/imageActions';
import {useTheme} from '../../Theme';
import {LoadingModalContext} from '../../context/loadinModalContext';
import {firebase} from '@react-native-firebase/firestore';
import {useDocumentData} from 'react-firebase-hooks/firestore';
import useUploadImageCheck from '../../hooks/useUploadImage';
import { HOUSES } from '../../utils/firebaseKeys';

export const useHouseScreen = ({route}) => {
  const {Gutters} = useTheme();
  const [infoHouse, setInfoHouse] = useState();
  const [newImage, setNewImage] = useState();
  const {isAdmin} = useAuth();
  const {houseId} = route.params;

  const houseQuery = firestore().collection('houses').doc(houseId);

  const {setVisible} = useContext(LoadingModalContext);
  const [house] = useDocumentData(houseQuery, {idField: 'id'});
  const {updateFirebase} = useUpdateFirebase('houses');

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const {onImagePress} = useCameraOrLibrary();
  const {uploadImages} = useUploadImageCheck(HOUSES);

  const handlePressImage = (type) => {
    onImagePress({
      type,
      options: {...imageActions[type], selectionLimit: 1},
      callback: async (imgs) => {
        setNewImage(
          imgs.map((image, i) => ({
            fileBase64: image?.base64,
            fileName: image?.fileName || `image-${i}`,
            fileUri: image?.uri,
            fileType: image?.type,
          })),
        );
      },
    });
  };

  const handleEdit = async () => {
    setVisible(true);
    try {
      if (infoHouse) {
        await updateFirebase(houseId, {
          ...infoHouse,
        });
      }
      if (newImage) {
        uploadImages(newImage, null, houseId)
      }
    } catch (err) {
      error({
        message: err.message,
        track: true,
        asToast: true,
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
    handlePressImage,
  };
};
