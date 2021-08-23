import React, {useMemo, useState} from 'react';
import {
  View,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import ImageView from 'react-native-image-viewing';

import Icon from 'react-native-vector-icons/MaterialIcons';
import AddButton from '../../components/Elements/AddButton';
import DeleteModal from '../../components/Modals/DeleteModal';
import PageLayout from '../../components/PageLayout';

import {PM_COLOR} from '../../styles/colors';
import {parseDeleteTextButton} from '../../utils/parsers';

//Firestore
import firestore from '@react-native-firebase/firestore';
import {useUpdateFirebase} from '../../hooks/useUpdateFirebase';
import {useDeleteFirebase} from '../../hooks/useDeleteFirebase';

import {firebase} from '@react-native-firebase/firestore';
import {useDeleteFirebaseImage} from '../../hooks/useDeleteFirebaseImage';
import {
  useCollectionData,
  useDocumentData,
} from 'react-firebase-hooks/firestore';
import {usePhotos} from '../../utils/usePhotos';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    marginTop: 20,
  },
  deletePhotos: {
    position: 'absolute',
    right: 30,
    bottom: 20,
    zIndex: 5,
  },
  photo: {
    position: 'relative',
    width: (Dimensions.get('window').width - 65 - 10) / 3,
    height: 100,
    resizeMode: 'cover',
    borderRadius: 10,
    marginRight: 10,
    marginBottom: 10,
  },
  deleteMask: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    backgroundColor: '#FFFFFF60',
    borderRadius: 10,
    zIndex: 5,
  },
  deleteMark: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: PM_COLOR,
    borderRadius: 1000,
    marginLeft: 5,
    marginTop: 5,
  },
});

const CheckPhotosScreen = ({route}) => {
  const {title, checkId, checkItemId} = route.params;
  const [modal, setModal] = useState([]);
  const [photosSelected, setPhotosSelected] = useState([]);
  const [deleteModal, setDeleteModal] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);

  const {deleteImage} = useDeleteFirebaseImage();

  const {removePhotos} = usePhotos({
    collection: 'checklists',
    docId: checkId,
  });

  const query = useMemo(() => {
    return firestore()
      .collection('checklists')
      .doc(checkId)
      .collection('checks')
      .doc(checkItemId);
  }, [checkId, checkItemId]);

  const [values] = useDocumentData(query, {
    idField: 'id',
  });

  const handlePressPhoto = (i) => {
    setModal(true);
    setImageIndex(i);
  };
  const handleSelectDeletePhoto = ({id, ref}) => {
    const urlExists = photosSelected.some((photo) => photo === id);
    const selectedPhotos = photosSelected.filter((photo) => photo !== id);
    if (urlExists) {
      setPhotosSelected([...selectedPhotos]);
    } else {
      setPhotosSelected([...selectedPhotos, {id, ref}]);
    }
  };

  const handleDeletePhoto = async (photo) => {
    setPhotosSelected(photosSelected.filter((p) => p.id !== photo));
    await deleteImage(photo.ref);
    await removePhotos(photo);
  };

  const Photo = ({photo, index}) => {
    return (
      <TouchableOpacity
        onLongPress={() => handleSelectDeletePhoto({id: photo, ref: photo})}
        onPress={() => handlePressPhoto(index)}>
        <View style={styles.photo}>
          {photosSelected.some((p) => photo === p.id) && (
            <View style={styles.deleteMask}>
              <View style={styles.deleteMark}>
                <Icon name="check" color="white" size={20} />
              </View>
            </View>
          )}
          <ImageBackground
            source={{uri: photo}}
            style={styles.photo}
            imageStyle={{borderRadius: 5}}
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <PageLayout
      backButton
      titleProps={{
        subPage: true,
        title: title,
        color: 'white',
      }}>
      <React.Fragment>
        <ImageView
          visible={modal}
          imageIndex={imageIndex}
          images={values?.photos?.map((photo) => ({uri: photo}))}
          onRequestClose={() => setModal(false)}
        />
        <View style={{flex: 1}}>
          {photosSelected.length > 0 && (
            <View style={styles.deletePhotos}>
              <TouchableOpacity onPress={() => setDeleteModal(true)}>
                <AddButton iconName="delete" backColor={PM_COLOR} />
              </TouchableOpacity>
            </View>
          )}
          <DeleteModal
            visible={deleteModal}
            handleVisibility={setDeleteModal}
            info="Las fotos que se eliminen no se podrán recuperar"
            textButton={parseDeleteTextButton(photosSelected.length)}
            handleDelete={() =>
              Promise.all(
                photosSelected.map((photo) => handleDeletePhoto(photo)),
              )
            }
          />
          <View style={styles.container}>
            {values?.photos?.map((photo, i) => (
              <Photo photo={photo} index={i} key={photo} />
            ))}
          </View>
        </View>
      </React.Fragment>
    </PageLayout>
  );
};

export default CheckPhotosScreen;
