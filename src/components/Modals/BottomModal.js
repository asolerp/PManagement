import React from 'react';
import {
  Dimensions,
  KeyboardAvoidingView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Modal from 'react-native-modal';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTheme} from '../../Theme';
import {Colors} from '../../Theme/Variables';
import Icon from 'react-native-vector-icons/MaterialIcons';
import theme from '../../Theme/Theme';

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
      style={[theme.bgWhite, theme.p0, theme.m0]}>
      {/* <KeyboardAvoidingView behavior="padding"> */}
      <SafeAreaView edges={['top', 'bottom']} style={{flex: 1}}>
        <View style={styles.modalContainer}>
          <View style={[theme.flex, theme.flexRow, theme.itemsCenter]}>
            <View style={[theme.w14, theme.h10]} />
            <View style={[theme.flexGrow, theme.itemsCenter]}>
              <View style={styles.topSlider} />
            </View>
            <View style={[theme.w14, theme.h10]}>
              <TouchableOpacity
                onPress={onClose}
                style={(theme.flex1, theme.selfEnd)}>
                <Icon name="close" size={30} color={Colors.black} />
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
    paddingHorizontal: 15,
  },
  topSlider: {
    width: 50,
    height: 5,
    backgroundColor: Colors.gray300,
    borderRadius: 100,
  },
});
