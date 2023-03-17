import React from 'react';
import {Controller} from 'react-hook-form';
import {Text, TextInput, StyleSheet, View} from 'react-native';

import theme from '../../Theme/Theme';

const styles = StyleSheet.create({
  rightContainer: {
    position: 'absolute',
    right: 10,
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    height: 50,
  },
  inputContainer: {
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    borderColor: '#EAEAEA',
    justifyContent: 'center',
  },
  input: {
    height: 50,
    borderRadius: 10,
    padding: 10,
    color: 'white',
  },
});

export const TextInputController = ({
  name,
  control,
  rules,
  errors,
  placeholder,
  inputProps,
  right,
  style,
}) => {
  return (
    <>
      <Controller
        control={control}
        rules={rules}
        render={({field: {onChange, onBlur, value}}) => (
          <View style={[styles.inputContainer, style]}>
            <TextInput
              autoCapitalize="none"
              style={[styles.input]}
              placeholder={placeholder}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              {...inputProps}
            />
            {right && <View style={styles.rightContainer}>{right()}</View>}
          </View>
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
