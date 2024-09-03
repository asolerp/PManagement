import React from 'react';
import { Controller } from 'react-hook-form';
import { Text, TextInput, StyleSheet, View } from 'react-native';

import theme from '../../Theme/Theme';

const styles = StyleSheet.create({
  input: {
    borderRadius: 10,
    height: 50,
    padding: 10
  },
  inputContainer: {
    borderColor: '#EAEAEA',
    borderRadius: 10,
    borderWidth: 1,
    height: 50,
    justifyContent: 'center',
    padding: 10
  },
  rightContainer: {
    alignItems: 'center',
    height: 50,
    justifyContent: 'center',
    position: 'absolute',
    right: 10,
    width: 50
  }
});

export const TextInputController = ({
  name,
  setValue,
  ref,
  errors,
  placeholder,
  inputProps,
  right,
  style
}) => {
  return (
    <>
      <View style={styles.inputContainer}>
        <TextInput
          ref={ref}
          autoCapitalize="none"
          style={[styles.input, style]}
          placeholder={placeholder}
          onChangeText={text => setValue(name, text)}
          {...inputProps}
        />
        {right && <View style={styles.rightContainer}>{right()}</View>}
      </View>
      {errors[name] && (
        <Text style={[theme.mY2, theme.textErrorDark]}>
          El campo es requerido.
        </Text>
      )}
    </>
  );
};
