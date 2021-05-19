import React from 'react';
import {Button} from 'react-native';
import {View, StyleSheet} from 'react-native';
import {Divider} from 'react-native-elements';

import Modal from 'react-native-modal';
import InputGroup from '../Elements/InputGroup';

const styles = StyleSheet.create({
  view: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  content: {
    padding: 22,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
});

const PhotoCameraModal = ({
  visible,
  handleVisibility,
  handleClickCamera,
  handleClickLibrary,
}) => {
  return (
    <Modal
      onBackdropPress={() => handleVisibility(false)}
      isVisible={visible}
      style={styles.view}>
      <View style={styles.content}>
        <InputGroup>
          <Button title="Abrir fotos" onPress={handleClickLibrary} />
          <Divider />
          <Button title="Abrir cámara" onPress={handleClickCamera} />
        </InputGroup>
        <InputGroup>
          <Button title="Cancelar" onPress={() => handleVisibility(false)} />
        </InputGroup>
      </View>
    </Modal>
  );
};

export default PhotoCameraModal;
