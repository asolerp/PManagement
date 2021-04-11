import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ImageBackground,
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons';

// Utils
import {handleImagePicker} from '../utils/imageFunctions';
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
  const ImagePickerView = () => {
    return (
      <TouchableOpacity
        onPress={() =>
          handleImagePicker((imgs) => {
            setImages(
              imgs.map((image, i) => ({
                fileName: image.filename || `image-${i}`,
                fileUri:
                  Platform.OS === 'android' ? image.path : image.sourceURL,
                fileType: image.mime,
              })),
            );
          })
        }>
        <View style={styles.imagePicker}>
          <Icon name="add" size={30} color={'white'} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
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
