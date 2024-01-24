import {useContext, useState} from 'react';
import {useCameraOrLibrary} from '../../../hooks/useCamerOrLibrary';
import {useGetFirebase} from '../../../hooks/useGetFirebase';
import {useAddFirebase} from '../../../hooks/useAddFirebase';
import {LoadingModalContext} from '../../../context/loadinModalContext';
import useUploadImageCheck from '../../../hooks/useUploadImage';
import {ENTRANCES} from '../../../utils/firebaseKeys';
import {imageActions} from '../../../utils/imageActions';
import {firebase} from '@react-native-firebase/firestore';

import Geolocation from '@react-native-community/geolocation';
import {useSelector} from 'react-redux';
import {userSelector} from '../../../Store/User/userSlice';
import {popScreen} from '../../../Router/utils/actions';
import {useUpdateFirebase} from '../../../hooks/useUpdateFirebase';

const collection = 'houses';
const searchBy = 'houseName';
const order = {field: 'houseName', type: 'asc'};

export const useConfirmEntrance = () => {
  const [search, setSearch] = useState();
  const [selected, setSelected] = useState();
  const {list} = useGetFirebase(collection, null);
  const {onImagePress} = useCameraOrLibrary();
  const user = useSelector(userSelector);

  const {updateFirebase} = useUpdateFirebase('entrances');
  const {addFirebase} = useAddFirebase();
  const {setVisible} = useContext(LoadingModalContext);
  const {uploadImages} = useUploadImageCheck(ENTRANCES);

  const fList = search
    ? list
        .sort((a, b) => a[order?.field]?.localeCompare(b[order?.field]))
        .filter((item) =>
          item[searchBy].toLowerCase().includes(search?.toLowerCase()),
        )
    : list &&
      list.sort((a, b) => a[order?.field]?.localeCompare(b[order?.field]));

  const updateEntrance = async (imgs, docId) => {
    try {
      setVisible(true);
      Geolocation.getCurrentPosition(async (info) => {
        await updateFirebase(docId, {
          action: 'exit',
          exitDate: firebase.firestore.Timestamp.fromDate(new Date()),
          exitLocation: {
            latitude: info.coords.latitude,
            longitude: info.coords.longitude,
          },
        });

        await uploadImages(imgs, null, docId, () => {
          setVisible(false);
        });
      });
    } catch (err) {
      console.log(err);
      setVisible(false);
    }
  };

  const saveEntrance = async (imgs) => {
    try {
      setVisible(true);
      Geolocation.getCurrentPosition(async (info) => {
        const house = selected[0];
        const data = {
          house,
          action: 'enter',
          worker: user,
          location: {
            latitude: info.coords.latitude,
            longitude: info.coords.longitude,
          },
          date: firebase.firestore.Timestamp.fromDate(new Date()),
        };

        const newEntrance = await addFirebase('entrances', data);
        await uploadImages(imgs, null, newEntrance.id, () => {
          setVisible(false);
          popScreen();
        });
      });
    } catch (err) {
      console.log(err);
      setVisible(false);
    }
  };

  const onRegisterEnter = () => {
    onImagePress({
      type: 'capture',
      options: {...imageActions['common']},
      callback: async (imgs) => {
        saveEntrance(imgs);
      },
    });
  };

  const onRegisterExit = (docId) => {
    onImagePress({
      type: 'capture',
      options: {...imageActions['common']},
      callback: async (imgs) => {
        updateEntrance(imgs, docId);
      },
    });
  };

  return {
    fList,
    search,
    selected,
    setSearch,
    onRegisterEnter,
    onRegisterExit,
    setSelected,
  };
};
