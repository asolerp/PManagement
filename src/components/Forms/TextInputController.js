import React from 'react';
import { Controller } from 'react-hook-form';
import { Text, TextInput, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import {
  Colors,
  FontSize,
  FontWeight,
  Spacing,
  BorderRadius
} from '../../Theme/Variables';

export const TextInputController = ({
  name,
  control,
  errors,
  placeholder,
  inputProps,
  right,
  style,
  rules,
  label
}) => {
  const { t } = useTranslation();
  const hasError = errors?.[name];

  return (
    <View>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputContainer, hasError && styles.inputContainerError]}>
        <Controller
          control={control}
          name={name}
          rules={rules}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              autoCapitalize="none"
              style={[styles.input, style]}
              placeholder={placeholder}
              placeholderTextColor={Colors.gray400}
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              {...inputProps}
            />
          )}
        />
        {right && <View style={styles.rightContainer}>{right()}</View>}
      </View>
      {hasError && (
        <Text style={styles.errorText}>{t('validation.required')}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  errorText: {
    color: Colors.danger,
    fontSize: FontSize.xs,
    marginTop: Spacing.xs
  },
  input: {
    color: Colors.gray800,
    flex: 1,
    fontSize: FontSize.base,
    height: '100%',
    padding: 0
  },
  inputContainer: {
    backgroundColor: Colors.gray50,
    borderColor: Colors.gray200,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: Spacing.md
  },
  inputContainerError: {
    borderColor: Colors.danger
  },
  label: {
    color: Colors.gray600,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    marginBottom: Spacing.xs
  },
  rightContainer: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'center',
    position: 'absolute',
    right: Spacing.md
  }
});
