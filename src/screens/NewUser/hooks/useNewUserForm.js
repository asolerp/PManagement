import {useContext, useEffect, useState} from 'react';
import {LoadingModalContext} from '../../../context/loadinModalContext';
import {getUser} from '../../../firebase/getUser';

import {useAddFirebase} from '../../../hooks/useAddFirebase';
import {useUpdateFirebase} from '../../../hooks/useUpdateFirebase';
import {useUploadCloudinaryImage} from '../../../hooks/useUploadCloudinaryImage';
import {error} from '../../../lib/logging';
import {popScreen} from '../../../Router/utils/actions';

const DEFAULT_PHOTO_URL =
  'https://res.cloudinary.com/enalbis/image/upload/v1639415421/PortManagement/varios/port_logo_pv4jqk.png';

export const useNewUserForm = (docId) => {
  const [user, setUser] = useState({});
  const [newImage, setNewImage] = useState();
  const {addFirebase} = useAddFirebase();
  const [loading, setLoading] = useState(false);
  const {setVisible} = useContext(LoadingModalContext);
  const {updateFirebase} = useUpdateFirebase('users');
  const {upload} = useUploadCloudinaryImage();

  const isAllfilled =
    user?.firstName &&
    user?.lastName &&
    user?.email &&
    user?.phone &&
    user?.role &&
    user?.gender;

  const createUser = async () => {
    try {
      setLoading(true);
      addFirebase('users', {
        ...user,
        profileImage: DEFAULT_PHOTO_URL,
      });
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
      popScreen();
    }
  };

  const editUser = async (userId) => {
    try {
      setVisible(true);
      setLoading(true);
      if (newImage?.length > 0) {
        const uploadImage = await upload(
          newImage?.[0],
          `/PortManagement/Users/${userId}/Photos`,
        );
        await updateFirebase(userId, {
          ...user,
          profileImage: uploadImage,
        });
      } else {
        await updateFirebase(userId, {...user});
      }
    } catch (err) {
      error({
        message: err.message,
        track: true,
        asToast: true,
      });
    } finally {
      setVisible(false);
      setLoading(false);
      popScreen();
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
    setNewImage,
  };
};
