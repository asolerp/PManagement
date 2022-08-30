import React from 'react';
import {Dimensions, StyleSheet, View} from 'react-native';
import Modal from 'react-native-modal';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Colors} from '../../Theme/Variables';

export const NormalModal = ({
  onClose,
  children,
  isVisible,
  swipeDirection = ['down'],
}) => {
  return (
    <Modal
      testID={'modal'}
      isVisible={isVisible}
      onBackdropPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection={swipeDirection}>
      <View style={styles.modalContainer}>{children}</View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 20,
    minHeight: 200,
    maxHeight: Dimensions.get('window').height * 1,
  },
  topSlider: {
    width: 50,
    height: 5,
    backgroundColor: Colors.gray300,
    borderRadius: 100,
    marginBottom: 5,
  },
});
