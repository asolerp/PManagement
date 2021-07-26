import React from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';

import Modal from 'react-native-modal';
import {useTheme} from '../Theme';

const CustomModal = ({visible, setVisible, children, size = 1}) => {
  const {Layout, Gutters} = useTheme();

  return (
    <Modal
      height={0.5}
      isVisible={visible}
      onSwipeComplete={(event) => {
        setVisible(false);
      }}
      swipeDirection={['down']}
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
    width: 50,
    height: 5,
    borderRadius: 10,
    backgroundColor: 'black',
  },
  content: {
    paddingHorizontal: 10,
    backgroundColor: 'white',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
});

export default CustomModal;
