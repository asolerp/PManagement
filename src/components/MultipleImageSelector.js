import React, {useState, useCallback} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Modal,
  Text,
} from 'react-native';

import {useDispatch, useSelector, shallowEqual} from 'react-redux';

import ImagePicker from 'react-native-image-crop-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';

import ImageViewer from 'react-native-image-zoom-viewer';
import {setImages} from '../store/incidenceFormActions';

// Utils
import {launchImage} from '../utils/imageFunctions';
import {Platform} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  houseImage: {
    height: 170,
    borderRadius: 10,
    resizeMode: 'cover',
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
  imagePicker: {
    height: 80,
    width: 60,
    backgroundColor: '#4A8CA4',
    borderRadius: 10,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
  },
  removeImage: {
    width: 20,
    height: 20,
    borderRadius: 100,
    backgroundColor: '#ED7A7A',
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    right: 3,
    top: -10,
  },
  photoIncidence: {
    height: 80,
    width: 60,
    borderRadius: 10,
    marginRight: 10,
    marginBottom: 10,
    resizeMode: 'contain',
  },
});

const IncidencePhoto = (image) => {
  return (
    <ImageBackground
      source={{uri: image?.fileUri}}
      style={styles.photoIncidence}
    />
  );
};

const MultipleImageSelector = () => {
  const dispatch = useDispatch();
  const {incidenceImages} = useSelector(
    ({incidenceForm: {incidenceImages}}) => ({incidenceImages}),
    shallowEqual,
  );
  const setImagesAction = useCallback((images) => dispatch(setImages(images)), [
    dispatch,
  ]);

  const [modal, setModal] = useState([]);
  const [imageIndex, setImageIndex] = useState(0);
  const handleImagePicker = () => {
    ImagePicker.openPicker({
      multiple: true,
      waitAnimationEnd: false,
      includeExif: false,
      forceJpg: true,
      compressImageQuality: 0.3,
      maxFiles: 10,
      mediaType: 'photo',
      includeBase64: true,
    }).then((images) => {
      console.log(images);
      // setImages(images.map((image) => ({url: image.path})));
      setImagesAction(
        images.map((image, i) => ({
          fileName: image.filename || `image-${i}`,
          fileUri: Platform.OS === 'android' ? image.path : image.sourceURL,
          fileType: image.mime,
        })),
      );
    });
  };

  const ImagePickerView = () => {
    return (
      <TouchableOpacity onPress={() => handleImagePicker()}>
        <View style={styles.imagePicker}>
          <Icon name="add" size={30} color={'white'} />
        </View>
      </TouchableOpacity>
    );
  };

  const handleImageClick = (index) => {
    setModal(true);
    setImageIndex(index);
  };

  return (
    <View style={styles.container}>
      {/* <Modal
        visible={modal}
        transparent={true}
        onRequestClose={() => setModal(false)}>
        <ImageViewer
          index={imageIndex}
          imageUrls={images}
          onSwipeDown={() => {
            setModal(false);
          }}
          enableSwipeDown={true}
        />
      </Modal> */}
      <ImagePickerView />
      {incidenceImages?.length > 0 &&
        incidenceImages?.map((photo, i) => (
          <View style={styles.imageContainer} key={i}>
            <TouchableOpacity
              style={styles.removeImage}
              onPress={() => {
                setImagesAction(
                  incidenceImages?.filter((p) => p.fileName !== photo.fileName),
                );
              }}>
              <Icon name="close" size={18} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleImageClick(i)}>
              <ImageBackground
                source={{uri: photo?.fileUri}}
                imageStyle={{borderRadius: 10}}
                style={styles.photoIncidence}
              />
            </TouchableOpacity>
          </View>
        ))}
    </View>
  );
};

export default MultipleImageSelector;
