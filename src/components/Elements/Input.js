import React from 'react';
import {View, Text, TextInput, StyleSheet} from 'react-native';

const Input = ({
  placeholder,
  name,
  value,
  onChange,
  inputStyles,
  labelStyle,
  error,
  ...args
}) => {
  return (
    <TextInput
      placeholder={error ? 'El campo es obligatorio' : placeholder}
      placeholderTextColor={error && '#ED7A7A'}
      autoCapitalize="none"
      value={value}
      style={
        error
          ? {...styles.input, ...styles.inputError, ...inputStyles}
          : {...styles.input, ...inputStyles}
      }
      {...args}
    />
  );
};

const styles = StyleSheet.create({
  label: {
    marginBottom: 10,
    fontSize: 15,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    borderColor: '#EAEAEA',
    marginBottom: 20,
  },
  inputError: {
    borderWidth: 2,
    borderColor: '#ED7A7A',
  },
});

export default Input;
