import React from 'react';
import {
  Dimensions,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import Modal from 'react-native-modal';

import { Colors } from '../../Theme/Variables';
import Icon from 'react-native-vector-icons/MaterialIcons';
import theme from '../../Theme/Theme';

export const BottomModal = ({
  onClose,
  children,
  isVisible,
  isFixedBottom = true,
  swipeDirection = ['down']
}) => {
  return (
    <Modal
      testID={'modal'}
      isVisible={isVisible}
      onBackdropPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection={swipeDirection}
      style={
        isFixedBottom
          ? [theme.justifyEnd, theme.m0]
          : [theme.bgWhite, theme.p0, theme.m0]
      }
    >
      {/* <KeyboardAvoidingView behavior="padding"> */}
      <SafeAreaView style={isFixedBottom ? [theme.bgWhite] : [theme.flex1]}>
        <View
          style={
            isFixedBottom ? styles.modalContainerFixed : styles.modalContainer
          }
        >
          <View
            style={[
              theme.flex,
              theme.flexRow,
              theme.itemsCenter,
              theme.mT2,
              theme.mB4
            ]}
          >
            <View style={theme.w14} />
            <View style={[theme.flexGrow, theme.itemsCenter]}>
              <View style={styles.topSlider} />
            </View>
            <View style={theme.w14}>
              <TouchableOpacity
                onPress={onClose}
                style={(theme.flex1, theme.selfEnd)}
              >
                <Icon name="close" size={20} color={Colors.black} />
              </TouchableOpacity>
            </View>
          </View>
          {children}
        </View>
      </SafeAreaView>
      {/* </KeyboardAvoidingView> */}
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: 'white',
    flexGrow: 1,
    marginTop: 10,
    paddingHorizontal: 15
  },
  modalContainerFixed: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: Dimensions.get('window').height * 1,
    paddingHorizontal: 15,
    paddingTop: 15
  },
  topSlider: {
    backgroundColor: Colors.gray300,
    borderRadius: 100,
    height: 5,
    width: 50
  }
});
