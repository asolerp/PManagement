import React, {useState} from 'react';
import {useRoute} from '@react-navigation/native';

import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  StyleSheet,
} from 'react-native';

import ImageViewer from 'react-native-image-zoom-viewer';
import AddButton from '../Elements/AddButton';
//Firebase
import firestore from '@react-native-firebase/firestore';
import {useCollectionData, useDocument} from 'react-firebase-hooks/firestore';
import PhotoCameraModal from '../Modals/PhotoCameraModal';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: 20,
  },
  addPhoto: {
    position: 'absolute',
    right: 30,
    bottom: 40,
    zIndex: 10,
  },
  photo: {
    width: (Dimensions.get('window').width - 65 - 10) / 3,
    height: 100,
    resizeMode: 'cover',
    borderRadius: 10,
    marginRight: 10,
    marginBottom: 10,
  },
});

const Photos = () => {
  const route = useRoute();
  const {incidenceId} = route.params;
  const [photoCameraModal, setPhotoCameraModal] = useState(false);
  const [modal, setModal] = useState([]);
  const [imageIndex, setImageIndex] = useState(0);

  const handlePressPhoto = (i) => {
    setModal(true);
    setImageIndex(i);
  };

  const Photo = ({photo, index}) => {
    return (
      <TouchableOpacity onPress={() => handlePressPhoto(index)} key={index}>
        <ImageBackground
          source={{uri: photo}}
          style={styles.photo}
          imageStyle={{borderRadius: 5}}
        />
      </TouchableOpacity>
    );
  };

  const [values] = useCollectionData(
    firestore().collection('incidences').doc(incidenceId).collection('photos'),
    {
      idField: 'id',
    },
  );
  const [value, loading] = useDocument(
    firestore().doc(`incidences/${incidenceId}`),
    {
      snapshotListenOptions: {includeMetadataChanges: true},
    },
  );

  if (loading) {
    return (
      <View vtyle={styles.container}>
        <Text>Cargando imágenes..</Text>
      </View>
    );
  }

  return (
    <React.Fragment>
      <View style={styles.addPhoto}>
        <TouchableOpacity onPress={() => {}}>
          <AddButton iconName="camera" />
        </TouchableOpacity>
      </View>
      <PhotoCameraModal
        visible={photoCameraModal}
        handleVisibility={setPhotoCameraModal}
        handleClickCamera={() =>
          handleCamera((imgs) => {
            imageHandler(imgs);
            setPhotoCameraModal(false);
          })
        }
        handleClickLibrary={() =>
          handleImagePicker((imgs) => {
            imageHandler(imgs);
            setPhotoCameraModal(false);
          })
        }
      />
      <Modal
        visible={modal}
        transparent={true}
        onRequestClose={() => setModal(false)}>
        <ImageViewer
          index={imageIndex}
          imageUrls={value
            ?.data()
            ?.photos?.concat(values?.map((p) => p.image))
            .map((url) => ({url: url}))}
          onSwipeDown={() => {
            setModal(false);
          }}
          enableSwipeDown={true}
        />
      </Modal>
      <View style={styles.container}>
        {value
          ?.data()
          ?.photos?.concat(values?.map((p) => p.image))
          .map((photo, i) => (
            <View key={i}>
              <Photo photo={photo} index={photo} />
            </View>
          ))}
      </View>
    </React.Fragment>
  );
};

export default React.memo(Photos);
