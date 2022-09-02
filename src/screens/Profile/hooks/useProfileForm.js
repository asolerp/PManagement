import {useContext, useState} from 'react';
import auth from '@react-native-firebase/auth';
import {popScreen} from '../../../Router/utils/actions';
import {error, success} from '../../../lib/logging';
import {LoadingModalContext} from '../../../context/loadinModalContext';

import {useUpdateFirebase} from '../../../hooks/useUpdateFirebase';
import {timeout} from '../../../utils/timeout';

import {firebase} from '@react-native-firebase/firestore';

export const useProfileForm = () => {
  const [loading, setLoading] = useState(false);
  const [infoProfile, setInfoProfile] = useState();
  const [newImage, setNewImage] = useState();

  const {setVisible} = useContext(LoadingModalContext);
  const uploadProfilePhoto = firebase
    .functions()
    .httpsCallable('uploadProfilePhoto');
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
        await uploadProfilePhoto({
          user: {
            id: userId,
            ...infoProfile,
          },
          imageBase64: newImage?.[0],
        });
      } else {
        await timeout(1500);
        console.log('INFO', infoProfile);
        await updateFirebase(userId, {...infoProfile});
      }
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
