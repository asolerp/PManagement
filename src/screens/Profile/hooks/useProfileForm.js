import {useContext, useState} from 'react';
import auth from '@react-native-firebase/auth';
import {popScreen} from '../../../Router/utils/actions';
import {error, success} from '../../../lib/logging';
import {LoadingModalContext} from '../../../context/loadinModalContext';

import {useUpdateFirebase} from '../../../hooks/useUpdateFirebase';
import {timeout} from '../../../utils/timeout';

import uploadImage from '../../../utils/uploadImage';

export const useProfileForm = () => {
  const [loading, setLoading] = useState(false);
  const [infoProfile, setInfoProfile] = useState();
  const [newImage, setNewImage] = useState();
  const [notifications, setNotifications] = useState(false);

  const {setVisible} = useContext(LoadingModalContext);
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
        const downloadURL = await uploadImage(newImage[0].fileUri, `users/${userId}/photos/${userId}`)
        await updateFirebase(userId, {...infoProfile, notifications, profileImage: {
          original: downloadURL,
          small: downloadURL,
        }});
      } else {
        await timeout(1500);
        await updateFirebase(userId, {...infoProfile, notifications});
      }
      // setNewImage(null);
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
      });
  };

  return {
    loading,
    newImage,
    handleEdit,
    infoProfile,
    setNewImage,
    notifications,
    setInfoProfile,
    changePassword,
    setNotifications,
  };
};
