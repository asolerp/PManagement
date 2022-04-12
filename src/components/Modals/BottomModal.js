import React from 'react';
import {Dimensions, KeyboardAvoidingView, StyleSheet, View} from 'react-native';
import Modal from 'react-native-modal';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTheme} from '../../Theme';
import {Colors} from '../../Theme/Variables';

export const BottomModal = ({
  onClose,
  children,
  isVisible,
  swipeDirection = ['down'],
}) => {
  const {Layout} = useTheme();

  return (
    <Modal
      testID={'modal'}
      isVisible={isVisible}
      onBackdropPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection={swipeDirection}
      style={[Layout.justifyContentEnd, {margin: 0}]}>
      {/* <KeyboardAvoidingView behavior="padding"> */}
      <View style={styles.modalContainer}>
        <View style={[Layout.alignItemsCenter]}>
          <View style={styles.topSlider} />
        </View>
        <SafeAreaView edges={['bottom']}>{children}</SafeAreaView>
      </View>
      {/* </KeyboardAvoidingView> */}
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: 'white',
    paddingTop: 15,
    paddingHorizontal: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: Dimensions.get('window').height * 0.9,
  },
  topSlider: {
    width: 50,
    height: 5,
    backgroundColor: Colors.gray300,
    borderRadius: 100,
    marginBottom: 5,
  },
});
