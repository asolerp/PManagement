import React, {useState} from 'react';
import {useRoute} from '@react-navigation/native';

import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from 'react-native';

import ImageView from 'react-native-image-viewing';

//Firebase
import firestore from '@react-native-firebase/firestore';
import {
  useCollectionData,
  useDocumentData,
} from 'react-firebase-hooks/firestore';
import {useTheme} from '../../Theme';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import {Colors} from '../../Theme/Variables';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {handleImagePicker} from '../../utils/imageFunctions';
import {INCIDENCES} from '../../utils/firebaseKeys';
import {usePhotos} from './utils/usePhotos';
import {parseImages} from './utils/parserImages';
import {useTranslation} from 'react-i18next';

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
  const {t} = useTranslation();
  const route = useRoute();
  const {incidenceId} = route.params;
  const {Layout, Fonts, Gutters} = useTheme();
  const [modal, setModal] = useState([]);
  const [imageIndex, setImageIndex] = useState(0);
  const {uploadPhotos, removePhotos, loading} = usePhotos({incidenceId});
  const [deletePhotos, setDeletePhotos] = useState([]);

  const handlePressPhoto = (i) => {
    setImageIndex(i);
    setModal(true);
  };

  const handleLongPressPhoto = (photo) => {
    const isSelected = deletePhotos.find((p) => p.id === photo.id);
    if (isSelected) {
      return setDeletePhotos([
        ...deletePhotos.filter((p) => p.id !== photo.id),
      ]);
    }
    setDeletePhotos([...deletePhotos, photo]);
  };

  const Photo = ({photo, index}) => {
    const isSelected = deletePhotos.find((p) => p.id === photo.id);
    return (
      <TouchableOpacity
        onPress={() => handlePressPhoto(index)}
        key={index}
        onLongPress={() => handleLongPressPhoto(photo)}>
        <ImageBackground
          source={{uri: photo.uri}}
          style={[styles.photo]}
          imageStyle={{borderRadius: 5}}>
          {isSelected && (
            <View
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: Colors.danger,
                opacity: 0.5,
                borderRadius: 5,
              }}
            />
          )}
        </ImageBackground>
      </TouchableOpacity>
    );
  };

  const [incidence, loadingIncidence] = useDocumentData(
    firestore().collection(INCIDENCES).doc(incidenceId),
    {
      idField: 'id',
    },
  );

  const photosSaved = incidence?.photos?.map((photo) => ({
    uri: photo,
    id: photo,
  }));

  if (loadingIncidence) {
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
        images={photosSaved}
        onRequestClose={() => setModal(false)}
      />
      <Text style={[Fonts.textTitle, Gutters.smallTMargin]}>
        {t('photos.title')}
      </Text>
      <View style={styles.container}>
        <TouchableWithoutFeedback
          onPress={() => {
            if (deletePhotos.length > 0) {
              return removePhotos(deletePhotos, setDeletePhotos);
            }
            return handleImagePicker((imgs) => {
              const mappedImages = parseImages(imgs);
              uploadPhotos(mappedImages);
            });
          }}>
          <View
            style={[
              Layout.colCenter,
              styles.photo,
              {
                backgroundColor:
                  deletePhotos.length > 0 ? Colors.danger : Colors.pm,
              },
            ]}>
            {loading ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : (
              <Icon
                name={deletePhotos.length > 0 ? 'delete' : 'add'}
                color={Colors.white}
                size={25}
              />
            )}
          </View>
        </TouchableWithoutFeedback>
        {photosSaved?.map((photo, i) => (
          <View key={i}>
            <Photo photo={photo} index={i} />
          </View>
        ))}
      </View>
    </React.Fragment>
  );
};

export default React.memo(Photos);
