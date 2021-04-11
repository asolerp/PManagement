import React from 'react';
import {Button} from 'react-native';
import {View, Text, StyleSheet} from 'react-native';
import {Divider} from 'react-native-elements';
import {TouchableOpacity} from 'react-native-gesture-handler';

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

const DeleteModal = ({
  visible,
  handleVisibility,
  handleDelete,
  info,
  onPress,
  textButton,
}) => {
  return (
    <Modal
      onBackdropPress={() => handleVisibility(false)}
      isVisible={visible}
      style={styles.view}>
      <View style={styles.content}>
        <InputGroup>
          <Text style={{padding: 10}}>{info}</Text>
          <Divider />
          <Button
            title={textButton}
            onPress={() => {
              handleDelete();
              handleVisibility(false);
            }}
            color="red"
          />
        </InputGroup>
        <InputGroup>
          <Button title="Cancelar" onPress={() => handleVisibility(false)} />
        </InputGroup>
      </View>
    </Modal>
  );
};

export default DeleteModal;
