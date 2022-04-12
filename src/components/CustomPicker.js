import React, {useState} from 'react';

import {Picker} from '@react-native-picker/picker';
import {View, StyleSheet} from 'react-native';

import {BottomModal} from './BottomModal';

export const CustomPicker = ({
  isPickerVisible,
  closePicker,
  value,
  setValue,
  options,
}) => {
  const [localValue, setLocalValue] = useState(value);

  return (
    <BottomModal
      isVisible={isPickerVisible}
      onBackdropPress={closePicker}
      style={styles.modal}
      onCTA={() => {
        setValue(localValue);
        closePicker();
      }}>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={localValue}
          onValueChange={(itemValue, itemIndex) => setLocalValue(itemValue)}>
          {options?.map((option) => (
            <Picker.Item
              key={option.label}
              label={option.label}
              value={option.value}
            />
          ))}
        </Picker>
      </View>
    </BottomModal>
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
  },
  closeContainer: {
    position: 'absolute',
    top: 10,
    zIndex: 10,
  },
  pickerContainer: {
    width: '100%',
  },
});
