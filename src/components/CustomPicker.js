import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView
} from 'react-native';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {
  Colors,
  FontSize,
  FontWeight,
  Spacing,
  BorderRadius
} from '../Theme/Variables';

const OptionItem = ({ label, isSelected, onPress, isLast }) => (
  <TouchableOpacity
    style={[styles.option, isLast && styles.optionLast]}
    onPress={onPress}
    activeOpacity={0.6}
  >
    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
      {label}
    </Text>
    {isSelected && <Icon name="check" size={22} color={Colors.pm} />}
  </TouchableOpacity>
);

export const CustomPicker = ({
  isPickerVisible,
  closePicker,
  value,
  setValue,
  options,
  title
}) => {
  const handleSelect = selectedValue => {
    setValue(selectedValue);
    closePicker();
  };

  return (
    <Modal
      isVisible={isPickerVisible}
      onBackdropPress={closePicker}
      onSwipeComplete={closePicker}
      swipeDirection={['down']}
      style={styles.modal}
      backdropOpacity={0.4}
      useNativeDriverForBackdrop
      animationIn="slideInUp"
      animationOut="slideOutDown"
    >
      <View style={styles.container}>
        {/* Handle */}
        <View style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>

        {/* Title */}
        {title && <Text style={styles.title}>{title}</Text>}

        {/* Options */}
        <ScrollView
          style={styles.optionsList}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {options?.map((option, index) => (
            <OptionItem
              key={option.value}
              label={option.label}
              isSelected={option.value === value}
              onPress={() => handleSelect(option.value)}
              isLast={index === options.length - 1}
            />
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '60%',
    paddingBottom: Platform.OS === 'ios' ? 34 : Spacing.lg
  },
  handle: {
    backgroundColor: Colors.gray300,
    borderRadius: 3,
    height: 5,
    width: 36
  },
  handleContainer: {
    alignItems: 'center',
    paddingBottom: Spacing.sm,
    paddingTop: Spacing.md
  },
  modal: {
    justifyContent: 'flex-end',
    margin: 0
  },
  option: {
    alignItems: 'center',
    borderBottomColor: Colors.gray100,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.base
  },
  optionLast: {
    borderBottomWidth: 0
  },
  optionText: {
    color: Colors.gray700,
    fontSize: FontSize.base,
    fontWeight: FontWeight.normal
  },
  optionTextSelected: {
    color: Colors.pm,
    fontWeight: FontWeight.medium
  },
  optionsList: {
    flexGrow: 0
  },
  title: {
    color: Colors.gray400,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    textTransform: 'uppercase'
  }
});
