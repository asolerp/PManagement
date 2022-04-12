import React, {useState} from 'react';
import {ImageBackground} from 'react-native';
import {View, StyleSheet, TouchableOpacity} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons';
import {useCameraOrLibrary} from '../hooks/useCamerOrLibrary';
import {imageActions} from '../utils/imageActions';
import {IncidencesCameraModal} from './Modals/IncidenceCameraModal';

const LIBRARY_ACTION = 'library';

// Utils
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

const MultipleImageSelector = ({images, setImages}) => {
  const [isVisible, setIsVisible] = useState(false);

  const ImagePickerView = () => {
    return (
      <TouchableOpacity onPress={() => setIsVisible(true)}>
        <View style={styles.imagePicker}>
          <Icon name="add" size={30} color={'white'} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <IncidencesCameraModal
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        setImages={setImages}
      />
      <ImagePickerView />
      {images?.length > 0 &&
        images?.map((photo, i) => (
          <View style={styles.imageContainer} key={i}>
            <TouchableOpacity
              style={styles.removeImage}
              onPress={() => {
                setImages(images?.filter((p) => p.fileName !== photo.fileName));
              }}>
              <Icon name="close" size={18} color="white" />
            </TouchableOpacity>
            <ImageBackground
              source={{uri: photo?.fileUri}}
              imageStyle={{borderRadius: 10}}
              style={styles.photoIncidence}
            />
          </View>
        ))}
    </View>
  );
};

export default MultipleImageSelector;
