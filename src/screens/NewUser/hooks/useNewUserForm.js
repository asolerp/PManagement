import { useContext, useEffect, useState } from 'react';
import { LoadingModalContext } from '../../../context/loadinModalContext';
import { getUser } from '../../../firebase/getUser';
import { firebase } from '@react-native-firebase/firestore';
import '@react-native-firebase/functions';

import { useUpdateFirebase } from '../../../hooks/useUpdateFirebase';
import { useUploadCloudinaryImage } from '../../../hooks/useUploadCloudinaryImage';
import { error } from '../../../lib/logging';
import { Logger } from '../../../lib/logging';
import { popScreen } from '../../../Router/utils/actions';
import { REGION } from '../../../firebase/utils';

export const useNewUserForm = docId => {
  const [user, setUser] = useState({});
  const [newImage, setNewImage] = useState();

  const [loading, setLoading] = useState(false);
  const { setVisible } = useContext(LoadingModalContext);
  const { updateFirebase } = useUpdateFirebase('users');
  const { upload } = useUploadCloudinaryImage();

  const createNewUser = firebase
    .app()
    .functions(REGION)
    .httpsCallable('createNewUser');

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
      // Cerrar el modal y esperar un momento antes de navegar
      setLoading(false);
      setVisible(false);
      // Usar setTimeout para asegurar que el modal se cierre antes de navegar
      setTimeout(() => {
        popScreen();
      }, 100);
    } catch (err) {
      Logger.error('Error creating new user', err, {form});
      setLoading(false);
      setVisible(false);
      error({
        message: 'Comprueba que el email es correcto y no está en uso',
        track: true,
        asToast: true
      });
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
      // Cerrar el modal y esperar un momento antes de navegar
      setLoading(false);
      setVisible(false);
      // Usar setTimeout para asegurar que el modal se cierre antes de navegar
      setTimeout(() => {
        popScreen();
      }, 100);
    } catch (err) {
      setLoading(false);
      setVisible(false);
      error({
        message: 'Comprueba que el email es correcto y no está en uso',
        track: true,
        asToast: true
      });
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
