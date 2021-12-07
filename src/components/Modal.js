import React from 'react';
import {View, StyleSheet, Dimensions, Text, Pressable} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import Modal from 'react-native-modal';
import {useTheme} from '../Theme';
import {Colors} from '../Theme/Variables';

const CustomModal = ({
  visible,
  setVisible,
  children,
  onClose,
  swipeDirection = ['down'],
  size = 1,
}) => {
  const {Layout, Gutters} = useTheme();

  return (
    <Modal
      isVisible={visible}
      onSwipeComplete={(event) => {
        setVisible(false);
      }}
      swipeDirection={swipeDirection}
      onBackdropPress={() => {
        setVisible(false);
      }}
      propagateSwipe={true}
      style={styles.view}>
      <View
        style={[
          styles.content,
          {height: Dimensions.get('window').height * size},
        ]}>
        <View style={[Layout.alignItemsCenter, Gutters.smallVMargin]}>
          <View style={styles.topBar} />
        </View>
        {!!onClose && (
          <View style={[Layout.row, Layout.justifyContentEnd]}>
            <Pressable onPress={onClose}>
              <View>
                <Icon name="close" size={25} />
              </View>
            </Pressable>
          </View>
        )}
        {children}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  view: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  topBar: {
    width: 80,
    height: 4,
    borderRadius: 10,
    backgroundColor: Colors.darkGrey,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 25,
    backgroundColor: 'white',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
});

export default CustomModal;
