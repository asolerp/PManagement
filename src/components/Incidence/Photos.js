import React, {useState} from 'react';
import {useRoute} from '@react-navigation/native';

import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  StyleSheet,
} from 'react-native';

import ImageView from 'react-native-image-viewing';

//Firebase
import firestore from '@react-native-firebase/firestore';
import {useDocumentData} from 'react-firebase-hooks/firestore';
import {useTheme} from '../../Theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
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
    width: (Dimensions.get('window').width - 65 - 10) / 5,
    height: 60,
    resizeMode: 'cover',
    borderRadius: 10,
    marginRight: 10,
    marginBottom: 10,
  },
});

const Photos = () => {
  const route = useRoute();
  const {incidenceId} = route.params;
  const {Fonts} = useTheme();
  const [modal, setModal] = useState([]);
  const [imageIndex, setImageIndex] = useState(0);

  const handlePressPhoto = (i) => {
    setImageIndex(i);
    setModal(true);
  };

  const Photo = ({photo, index}) => {
    return (
      <TouchableOpacity onPress={() => handlePressPhoto(index)} key={index}>
        <ImageBackground
          source={{uri: photo.uri}}
          style={styles.photo}
          imageStyle={{borderRadius: 5}}
        />
      </TouchableOpacity>
    );
  };

  const [incidence, loading] = useDocumentData(
    firestore().doc(`incidences/${incidenceId}`),
    {
      idField: 'id',
    },
  );

  const photos = incidence?.photos?.map((photo) => ({uri: photo}));

  console.log(photos, '[[photos]]');

  if (loading) {
    return (
      <View vtyle={styles.container}>
        <Text>Cargando imágenes..</Text>
      </View>
    );
  }

  return (
    <React.Fragment>
      <ImageView
        visible={modal}
        imageIndex={imageIndex}
        images={photos}
        onRequestClose={() => setModal(false)}
      />
      <Text style={[Fonts.textTitle]}>📷 Fotos</Text>
      <View style={styles.container}>
        {photos?.map((photo, i) => (
          <View key={i}>
            <Photo photo={photo} index={i} />
          </View>
        ))}
      </View>
    </React.Fragment>
  );
};

export default React.memo(Photos);
