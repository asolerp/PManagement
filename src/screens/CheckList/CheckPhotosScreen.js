import React, {useState} from 'react';
import {
  View,
  Modal,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AddButton from '../../components/Elements/AddButton';
import DeleteModal from '../../components/Modals/DeleteModal';
import PagetLayout from '../../components/PageLayout';

import {useGetFirebase} from '../../hooks/useGetFirebase';
import {useDeleteFirebase} from '../../hooks/useDeleteFirebase';
import {useUpdateFirebase} from '../../hooks/useUpdateFirebase';
import {PM_COLOR} from '../../styles/colors';
import {parseDeleteTextButton} from '../../utils/parsers';
import {firebase} from '@react-native-firebase/firestore';
import {useDeleteFirebaseImage} from '../../hooks/useDeleteFirebaseImage';

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

const CheckPhotosScreen = ({route, navigation}) => {
  const {title, checkId, checkItemId} = route.params;
  const [modal, setModal] = useState([]);
  const [photosSelected, setPhotosSelected] = useState([]);
  const [deleteModal, setDeleteModal] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);

  const {deleteImage} = useDeleteFirebaseImage();
  const {deleteFirebase} = useDeleteFirebase();
  const {updateFirebase} = useUpdateFirebase('checklists');

  const {list: photos, loading: loadingPhotos} = useGetFirebase(
    `checklists/${checkId}/checks/${checkItemId}/photos`,
  );

  const handleSelectDeletePhoto = ({id, ref}) => {
    const urlExists = photosSelected.some((photo) => photo.id === id);
    const selectedPhotos = photosSelected.filter((photo) => photo.id != id);
    if (urlExists) {
      setPhotosSelected([...selectedPhotos]);
    } else {
      setPhotosSelected([...selectedPhotos, {id, ref}]);
    }
  };

  const handleDeletePhoto = async (photo) => {
    setPhotosSelected(photosSelected.filter((p) => p.id != photo.id));
    await deleteImage(photo.ref);
    await deleteFirebase(
      `checklists/${checkId}/checks/${checkItemId}/photos`,
      photo.id,
    );
    await updateFirebase(`${checkId}/checks/${checkItemId}`, {
      numberOfPhotos: firebase.firestore.FieldValue.increment(-1),
    });
  };

  const Photo = ({photo, index}) => {
    return (
      <TouchableOpacity
        onLongPress={() =>
          handleSelectDeletePhoto({id: photo.id, ref: photo.ref})
        }
        onPress={() => {}}>
        <View style={styles.photo}>
          {photosSelected.some((p) => photo.id === p.id) && (
            <View style={styles.deleteMask}>
              <View style={styles.deleteMark}>
                <Icon name="check" color="white" size={20} />
              </View>
            </View>
          )}
          <ImageBackground
            source={{uri: photo.url}}
            style={styles.photo}
            imageStyle={{borderRadius: 5}}
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <PagetLayout
      backButton
      titleProps={{
        subPage: true,
        title: title,
        color: 'white',
      }}>
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
            Promise.all(photosSelected.map((photo) => handleDeletePhoto(photo)))
          }
        />
        <Modal
          visible={modal}
          transparent={true}
          onRequestClose={() => setModal(false)}>
          <ImageViewer
            index={imageIndex}
            imageUrls={photos?.map((photo) => ({url: photo.url}))}
            onSwipeDown={() => {
              setModal(false);
            }}
            enableSwipeDown={true}
          />
        </Modal>
        <View style={styles.container}>
          {photos?.map((photo, i) => (
            <Photo photo={photo} index={i} key={photo.id} />
          ))}
        </View>
      </View>
    </PagetLayout>
  );
};

export default CheckPhotosScreen;