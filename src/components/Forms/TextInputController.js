import React from 'react';
import {Controller} from 'react-hook-form';
import {Text, TextInput, StyleSheet} from 'react-native';

import theme from '../../Theme/Theme';

const styles = StyleSheet.create({
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    borderColor: '#EAEAEA',
  },
});

export const TextInputController = ({
  name,
  control,
  rules,
  errors,
  placeholder,
  inputProps,
  style,
}) => {
  return (
    <>
      <Controller
        control={control}
        rules={rules}
        render={({field: {onChange, onBlur, value}}) => (
          <TextInput
            style={[styles.input, style]}
            placeholder={placeholder}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            {...inputProps}
          />
        )}
        name={name}
      />
      {errors[name] && (
        <Text style={[theme.mY2, theme.textErrorDark]}>
          El campo es requerido.
        </Text>
      )}
    </>
  );
};
