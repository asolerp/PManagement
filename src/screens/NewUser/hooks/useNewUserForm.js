import { useContext, useEffect, useState } from 'react';
import { LoadingModalContext } from '../../../context/loadinModalContext';
import { getUser } from '../../../firebase/getUser';
import { firebase } from '@react-native-firebase/firestore';

import { useUpdateFirebase } from '../../../hooks/useUpdateFirebase';
import { useUploadCloudinaryImage } from '../../../hooks/useUploadCloudinaryImage';
import { error } from '../../../lib/logging';
import { popScreen } from '../../../Router/utils/actions';

export const useNewUserForm = docId => {
  const [user, setUser] = useState({});
  const [newImage, setNewImage] = useState();

  const [loading, setLoading] = useState(false);
  const { setVisible } = useContext(LoadingModalContext);
  const { updateFirebase } = useUpdateFirebase('users');
  const { upload } = useUploadCloudinaryImage();

  const createNewUser = firebase.functions().httpsCallable('createNewUser');

  const isAllfilled =
    user?.firstName &&
    user?.lastName &&
    user?.email &&
    user?.phone &&
    user?.role &&
    user?.language &&
    user?.gender;

  const createUser = async form => {
    try {
      setVisible(true);
      setLoading(true);
      await createNewUser({
        name: form?.name,
        surname: form?.surname,
        language: form?.language,
        gender: form?.gender,
        email: form?.email,
        phone: form?.phone,
        role: form?.role
      });
      popScreen();
    } catch (err) {
      error({
        message: 'Comprueba que el email es correcto y no está en uso',
        track: true,
        asToast: true
      });
    } finally {
      setLoading(false);
      setVisible(false);
    }
  };

  const editUser = async ({ userId, form }) => {
    try {
      setVisible(true);
      setLoading(true);
      if (newImage?.length > 0) {
        const uploadImage = await upload(
          newImage?.[0],
          `/PortManagement/Users/${userId}/Photos`
        );
        await updateFirebase(userId, {
          ...form,
          profileImage: uploadImage
        });
      } else {
        await updateFirebase(userId, { ...user });
      }
      popScreen();
    } catch (err) {
      error({
        message: 'Comprueba que el email es correcto y no está en uso',
        track: true,
        asToast: true
      });
    } finally {
      setVisible(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleGetUser = async () => {
      const userRef = await getUser(docId);
      setUser(userRef.data());
    };
    if (docId) {
      handleGetUser();
    }
  }, [docId]);

  return {
    user,
    setUser,
    newImage,
    loading,
    editUser,
    createUser,
    isAllfilled,
    setNewImage
  };
};
