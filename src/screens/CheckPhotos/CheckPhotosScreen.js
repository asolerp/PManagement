import React, { useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
  Pressable,
  ScrollView
} from 'react-native';
import ImageView from 'react-native-image-viewing';

import Icon from 'react-native-vector-icons/MaterialIcons';
import AddButton from '../../components/Elements/AddButton';
import DeleteModal from '../../components/Modals/DeleteModal';
import PageLayout from '../../components/PageLayout';

import { PM_COLOR } from '../../styles/colors';
import { parseDeleteTextButton } from '../../utils/parsers';

//Firestore
import firestore from '@react-native-firebase/firestore';

import { useDocumentData } from 'react-firebase-hooks/firestore';
import { usePhotos } from '../../utils/usePhotos';
import { parseRef } from './utils/parseRef';
import { CHECKLISTS } from '../../utils/firebaseKeys';
import { ScreenHeader } from '../../components/Layout/ScreenHeader';
import { Spacer } from '../../components/Elements/Spacer';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginTop: 20
  },
  deleteMark: {
    alignItems: 'center',
    backgroundColor: PM_COLOR,
    borderRadius: 1000,
    height: 20,
    justifyContent: 'center',
    marginLeft: 5,
    marginTop: 5,
    width: 20
  },
  deleteMask: {
    backgroundColor: '#FFFFFF60',
    borderRadius: 10,
    height: '100%',
    position: 'absolute',
    width: '100%',
    zIndex: 5
  },
  deletePhotos: {
    bottom: 20,
    position: 'absolute',
    right: 30,
    zIndex: 100
  },
  photo: {
    borderRadius: 10,
    height: 100,
    marginBottom: 10,
    marginRight: 10,
    position: 'relative',
    resizeMode: 'cover',
    width: (Dimensions.get('window').width - 65 - 10) / 3
  }
});

const CheckPhotosScreen = ({ route }) => {
  const { title, checkId, checkItemId } = route.params;
  const [modal, setModal] = useState([]);
  const [photosSelected, setPhotosSelected] = useState([]);
  const [deleteModal, setDeleteModal] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);

  const { removePhotos } = usePhotos();

  const query = useMemo(() => {
    return firestore()
      .collection('checklists')
      .doc(checkId)
      .collection('checks')
      .doc(checkItemId);
  }, [checkId, checkItemId]);

  const [values] = useDocumentData(query, {
    idField: 'id'
  });

  const handlePressPhoto = i => {
    setModal(true);
    setImageIndex(i);
  };
  const handleSelectDeletePhoto = ({ id, ref }) => {
    const urlExists = photosSelected.some(photo => photo.id === id);
    const selectedPhotos = photosSelected.filter(photo => photo.id !== id);

    if (urlExists) {
      setPhotosSelected([...selectedPhotos]);
    } else {
      setPhotosSelected([...selectedPhotos, { id, ref }]);
    }
  };

  const handleDeletePhoto = async () => {
    const checkQuery = firestore()
      .collection(CHECKLISTS)
      .doc(checkId)
      .collection('checks')
      .doc(checkItemId);

    const photosWithUri = photosSelected.map(photo => ({
      uri: photo.id,
      ref: photo.ref
    }));

    await removePhotos(photosWithUri, setPhotosSelected, {
      collectionRef: checkQuery
    });
  };

  const Photo = ({ photo, index }) => {
    return (
      <TouchableOpacity
        onLongPress={() =>
          handleSelectDeletePhoto({ id: photo, ref: parseRef(photo) })
        }
        onPress={() => handlePressPhoto(index)}
      >
        <View style={styles.photo}>
          {photosSelected.some(p => photo === p.id) && (
            <View style={styles.deleteMask}>
              <View style={styles.deleteMark}>
                <Icon name="check" color="white" size={20} />
              </View>
            </View>
          )}
          <ImageBackground
            source={{ uri: photo }}
            style={styles.photo}
            imageStyle={{ borderRadius: 5 }}
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <PageLayout safe backButton>
      <React.Fragment>
        <ScreenHeader title={title} />
        <ImageView
          visible={modal}
          imageIndex={imageIndex}
          images={values?.photos?.map(photo => ({ uri: photo }))}
          onRequestClose={() => setModal(false)}
        />
        <View style={{ flex: 1 }}>
          {photosSelected.length > 0 && (
            <View style={styles.deletePhotos}>
              <AddButton
                iconName="delete"
                backColor={PM_COLOR}
                containerStyle={{ right: 0, zIndex: 10 }}
                onPress={() => setDeleteModal(true)}
              />
            </View>
          )}
          <DeleteModal
            visible={deleteModal}
            handleVisibility={setDeleteModal}
            info="Las fotos que se eliminen no se podrán recuperar"
            textButton={parseDeleteTextButton(photosSelected.length)}
            handleDelete={() => handleDeletePhoto()}
          />
          <Spacer space={5} />
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{
              flex: 1
            }}
            contentContainerStyle={{
              flexDirection: 'row',
              flexWrap: 'wrap'
            }}
          >
            {values?.photos?.map((photo, i) => (
              <Photo photo={photo} index={i} key={photo} />
            ))}
          </ScrollView>
        </View>
      </React.Fragment>
    </PageLayout>
  );
};

export default CheckPhotosScreen;
