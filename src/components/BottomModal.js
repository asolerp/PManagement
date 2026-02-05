import React from 'react';
import Modal from 'react-native-modal';
import { View, StyleSheet } from 'react-native';
import CustomButton from './Elements/CustomButton';

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
  return (
    <Modal isVisible={isVisible} style={styles.modal} {...props}>
      <View style={styles.modalContainer}>
        <View style={styles.downLine} />
        <View style={styles.pickerContainer}>
          {children}
          {onCTA && (
            <View style={styles.buttonRow}>
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
  buttonRow: {
    flexDirection: 'row'
  },
  downLine: {
    backgroundColor: '#9CA3AF',
    borderRadius: 10,
    height: 2.5,
    width: 40
  },
  modal: {
    justifyContent: 'flex-end',
    margin: 0
  },
  modalContainer: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    justifyContent: 'center',
    padding: 10,
    paddingBottom: 30
  },
  pickerContainer: {
    paddingHorizontal: 12,
    width: '100%'
  }
});
