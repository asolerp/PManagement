import {useContext, useState} from 'react';
import auth from '@react-native-firebase/auth';
import {popScreen} from '../../../Router/utils/actions';
import {success, error} from '../../../lib/logging';
import {LoadingModalContext} from '../../../context/loadinModalContext';
import {useUploadCloudinaryImage} from '../../../hooks/useUploadCloudinaryImage';
import {useUpdateFirebase} from '../../../hooks/useUpdateFirebase';
import {timeout} from '../../../utils/timeout';

export const useProfileForm = () => {
  const [loading, setLoading] = useState(false);
  const [infoProfile, setInfoProfile] = useState();
  const [newImage, setNewImage] = useState();

  const {setVisible} = useContext(LoadingModalContext);
  const {upload} = useUploadCloudinaryImage();

  const {updateFirebase} = useUpdateFirebase('users');

  const reauthenticate = (currentPassword) => {
    var user = auth().currentUser;
    var cred = auth.EmailAuthProvider.credential(user.email, currentPassword);
    return user.reauthenticateWithCredential(cred);
  };

  const handleEdit = async (userId) => {
    try {
      setVisible(true);
      if (newImage) {
        const uploadImage = await upload(
          newImage?.[0],
          `/PortManagement/Users/${userId}/Photos`,
        );
        await updateFirebase(userId, {
          ...infoProfile,
          profileImage: uploadImage,
        });
      } else {
        await timeout(1500);
        await updateFirebase(userId, {...infoProfile});
      }
      // setInfoProfile(null);
      setNewImage(null);
    } catch (err) {
      error({
        message: err.message,
        track: true,
        asToast: true,
      });
    } finally {
      setVisible(false);
    }
  };

  const changePassword = (currentPassword, newPassword) => {
    reauthenticate(currentPassword)
      .then(() => {
        setLoading(true);
        var user = auth().currentUser;
        user
          .updatePassword(newPassword)
          .then(() => {
            console.log('Password updated!');
          })
          .catch((error) => {
            console.log(error);
          });
      })
      .catch((error) => {
        error({
          message: 'Algo ocurrió, inténtalo más tarde',
          asToast: true,
        });
      })
      .finally(() => {
        setLoading(false);
        success({
          message: 'Contraseña actualizada correctamente',
          asToast: true,
        });
        popScreen();
      });
  };

  return {
    loading,
    newImage,
    handleEdit,
    infoProfile,
    setNewImage,
    setInfoProfile,
    changePassword,
  };
};
