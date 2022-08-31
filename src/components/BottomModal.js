import React from 'react';
import Modal from 'react-native-modal';
import {View, StyleSheet} from 'react-native';
import {useTheme} from '../Theme';
import {Colors} from '../Theme/Variables';
import CustomButton from './Elements/CustomButton';
import theme from '../Theme/Theme';

export const BottomModal = ({
  isVisible,
  disabled,
  value,
  setValue,
  children,
  ctaText = 'Guardar',
  onCTA,
  ...props
}) => {
  const {Layout, Gutters} = useTheme();

  return (
    <Modal isVisible={isVisible} style={styles.modal} {...props}>
      <View style={[styles.modalContainer]}>
        <View style={styles.downLine} />
        <View style={[Gutters.smallHPadding, styles.pickerContainer]}>
          {children}
          {onCTA && (
            <View style={[Layout.row]}>
              <CustomButton
                title={ctaText}
                onPress={onCTA}
                disabled={disabled}
              />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 35,
    borderTopLeftRadius: 35,
    paddingBottom: 30,
  },
  closeContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
  pickerContainer: {
    width: '100%',
  },
  downLine: {
    width: 40,
    backgroundColor: Colors.grey,
    height: 2.5,
    borderRadius: 10,
  },
});
