import React from 'react';

import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons';

const ImageLoader = ({onPress, image}) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.container}>
        {!image?.[0]?.fileUri ? (
          <React.Fragment>
            <Icon name="home" size={40} color="black" />
            <Text>Selecciona una foto</Text>
          </React.Fragment>
        ) : (
          <ImageBackground
            source={{uri: image?.[0]?.fileUri}}
            imageStyle={{borderRadius: 10}}
            style={styles.houseImage}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 170,
    borderRadius: 10,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  selectImageStyle: {},
  houseImage: {
    height: 170,
    borderRadius: 10,
    resizeMode: 'cover',
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
});

export default ImageLoader;
