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

//Firebase
import firestore from '@react-native-firebase/firestore';
import {
  useCollection,
  useDocument,
  useDocumentOnce,
} from 'react-firebase-hooks/firestore';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: 20,
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

  const [modal, setModal] = useState([]);
  const [imageIndex, setImageIndex] = useState(0);

  const handlePressPhoto = (i) => {
    setModal(true);
    setImageIndex(i);
  };

  const Photo = ({photo, index}) => {
    return (
      <TouchableOpacity onPress={() => handlePressPhoto(index)}>
        <ImageBackground
          source={{uri: photo}}
          style={styles.photo}
          imageStyle={{borderRadius: 5}}
        />
      </TouchableOpacity>
    );
  };

  const [value, loading, error] = useDocument(
    firestore().doc(`incidences/${incidenceId}`),
    {
      snapshotListenOptions: {includeMetadataChanges: true},
    },
  );

  console.log(value?.data()?.photos);

  if (loading) {
    return (
      <View vtyle={styles.container}>
        <Text>Cargando imágenes..</Text>
      </View>
    );
  }

  return (
    <React.Fragment>
      <Modal
        visible={modal}
        transparent={true}
        onRequestClose={() => setModal(false)}>
        <ImageViewer
          index={imageIndex}
          imageUrls={value?.data()?.photos?.map((url) => ({url: url}))}
          onSwipeDown={() => {
            setModal(false);
          }}
          enableSwipeDown={true}
        />
      </Modal>
      <View style={styles.container}>
        {value?.data()?.photos?.map((photo, i) => (
          <Photo photo={photo} index={i} key={photo} />
        ))}
      </View>
    </React.Fragment>
  );
};

export default React.memo(Photos);
