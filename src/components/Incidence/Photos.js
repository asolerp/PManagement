import React, { useState } from 'react';
import { useRoute } from '@react-navigation/native';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import ImageView from 'react-native-image-viewing';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Firebase
import {
  getFirestore,
  collection,
  doc
} from '@react-native-firebase/firestore';
import { useDocumentData } from 'react-firebase-hooks/firestore';

// Utils
import { INCIDENCES } from '../../utils/firebaseKeys';
import { usePhotos } from '../../utils/usePhotos';
import { parseImages } from './utils/parserImages';
import { useTranslation } from 'react-i18next';
import { parseRef } from '../../Screens/CheckPhotos/utils/parseRef';
import { useCameraOrLibrary } from '../../hooks/useCamerOrLibrary';

const windowWidth = Dimensions.get('window').width;
const PHOTO_SIZE = (windowWidth - 60) / 4; // 4 columnas con padding

const Photo = ({ photo, index, onPress, onLongPress, isSelected }) => (
  <TouchableOpacity
    onPress={() => onPress(index)}
    onLongPress={() => onLongPress({ id: photo.uri, ref: parseRef(photo.uri) })}
    style={styles.photoWrapper}
  >
    <ImageBackground
      source={{ uri: photo.uri }}
      style={styles.photo}
      imageStyle={styles.photoImage}
    >
      {isSelected && <View style={styles.selectedOverlay} />}
    </ImageBackground>
  </TouchableOpacity>
);

const AddPhotoButton = ({ onPress, loading, isDeleteMode }) => (
  <TouchableOpacity onPress={onPress} style={styles.photoWrapper}>
    <View style={[styles.addPhotoButton, isDeleteMode && styles.deleteButton]}>
      {loading ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <Icon
          name={isDeleteMode ? 'delete' : 'add-a-photo'}
          color="#FFFFFF"
          size={24}
        />
      )}
    </View>
  </TouchableOpacity>
);

const Photos = () => {
  const { t } = useTranslation();
  const route = useRoute();
  const { incidenceId } = route.params;
  const [modal, setModal] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const { uploadPhotos, removePhotos, loading } = usePhotos();
  const [deletePhotos, setDeletePhotos] = useState([]);
  const { onImagePress } = useCameraOrLibrary();

  const db = getFirestore();
  const incidenceQuery = doc(collection(db, INCIDENCES), incidenceId);

  const [incidence, loadingIncidence] = useDocumentData(incidenceQuery, {
    idField: 'id'
  });

  const photosSaved = incidence?.photos?.map(photo => ({
    uri: photo,
    id: photo
  }));

  const handlePressPhoto = i => {
    setImageIndex(i);
    setModal(true);
  };

  const handleLongPressPhoto = ({ id, ref }) => {
    const isSelected = deletePhotos.find(p => p.id === id);
    if (isSelected) {
      return setDeletePhotos([...deletePhotos.filter(p => p.id !== id)]);
    }
    setDeletePhotos([...deletePhotos, { id, uri: id, ref }]);
  };

  const handleAddOrDeletePhotos = () => {
    if (deletePhotos.length > 0) {
      return removePhotos(deletePhotos, setDeletePhotos, {
        collectionRef: incidenceQuery
      });
    }
    return onImagePress({
      type: 'library',
      callback: imgs => {
        if (!imgs) return;
        const mappedImages = parseImages(imgs);
        uploadPhotos(mappedImages, {
          collectionRef: incidenceQuery,
          cloudinaryFolder: `/PortManagement/${INCIDENCES}/${incidenceId}/Photos`,
          docId: incidenceId
        });
      }
    });
  };

  if (loadingIncidence) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#55A5AD" />
        <Text style={styles.loadingText}>Cargando imágenes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <ImageView
        visible={modal}
        imageIndex={imageIndex}
        images={photosSaved || []}
        onRequestClose={() => setModal(false)}
      />

      <View style={styles.sectionHeader}>
        <View style={styles.sectionHeaderLeft}>
          <View style={styles.iconContainer}>
            <Icon name="photo-library" size={18} color="#55A5AD" />
          </View>
          <View>
            <Text style={styles.sectionTitle}>{t('photos.title')}</Text>
            <Text style={styles.sectionSubtitle}>
              {photosSaved?.length > 0
                ? `${photosSaved.length} ${photosSaved.length === 1 ? 'foto' : 'fotos'}`
                : 'Sin fotos adjuntas'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.photosGrid}>
        <AddPhotoButton
          onPress={handleAddOrDeletePhotos}
          loading={loading}
          isDeleteMode={deletePhotos.length > 0}
        />
        {photosSaved?.map((photo, i) => (
          <Photo
            key={i}
            photo={photo}
            index={i}
            onPress={handlePressPhoto}
            onLongPress={handleLongPressPhoto}
            isSelected={deletePhotos.find(p => p.id === photo.id)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  addPhotoButton: {
    alignItems: 'center',
    backgroundColor: '#55A5AD',
    borderRadius: 10,
    height: PHOTO_SIZE,
    justifyContent: 'center',
    width: PHOTO_SIZE
  },
  deleteButton: {
    backgroundColor: '#EF4444'
  },
  iconContainer: {
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    borderRadius: 10,
    height: 40,
    justifyContent: 'center',
    width: 40
  },
  loadingContainer: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 20
  },
  loadingText: {
    color: '#9CA3AF',
    fontSize: 13
  },
  photo: {
    borderRadius: 10,
    height: PHOTO_SIZE,
    overflow: 'hidden',
    width: PHOTO_SIZE
  },
  photoImage: {
    borderRadius: 10
  },
  photoWrapper: {
    marginBottom: 10,
    marginRight: 10
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  section: {
    marginTop: 20
  },
  sectionHeader: {
    marginBottom: 16
  },
  sectionHeaderLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12
  },
  sectionSubtitle: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 2
  },
  sectionTitle: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '700'
  },
  selectedOverlay: {
    backgroundColor: '#EF4444',
    borderRadius: 10,
    height: '100%',
    opacity: 0.5,
    width: '100%'
  }
});

export default Photos;
