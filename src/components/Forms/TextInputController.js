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

/**
 * TextInputController - Input controlado por react-hook-form
 *
 * @param {string} variant - 'default' | 'glass' (para fondos con gradiente)
 */
export const TextInputController = ({
  name,
  control,
  errors,
  placeholder,
  inputProps,
  right,
  left,
  style,
  rules,
  label,
  variant = 'default'
}) => {
  const { t } = useTranslation();
  const hasError = errors?.[name];
  const isGlass = variant === 'glass';

  return (
    <View>
      {label && (
        <Text style={[styles.label, isGlass && styles.labelGlass]}>
          {label}
        </Text>
      )}
      <View
        style={[
          styles.inputContainer,
          isGlass && styles.inputContainerGlass,
          hasError && styles.inputContainerError,
          hasError && isGlass && styles.inputContainerGlassError
        ]}
      >
        {left && <View style={styles.leftContainer}>{left()}</View>}
        <Controller
          control={control}
          name={name}
          rules={rules}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              autoCapitalize="none"
              style={[
                styles.input,
                isGlass && styles.inputGlass,
                left && styles.inputWithLeft,
                style
              ]}
              placeholder={placeholder}
              placeholderTextColor={isGlass ? 'rgba(255,255,255,0.6)' : Colors.gray400}
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
        <Text style={[styles.errorText, isGlass && styles.errorTextGlass]}>
          {t('validation.required')}
        </Text>
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
  errorTextGlass: {
    color: '#ffcccb'
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
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    paddingHorizontal: Spacing.md
  },
  inputContainerError: {
    borderColor: Colors.danger
  },
  inputContainerGlass: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: BorderRadius.lg
  },
  inputContainerGlassError: {
    borderColor: '#ff6b6b'
  },
  inputGlass: {
    color: Colors.white
  },
  inputWithLeft: {
    marginLeft: Spacing.sm
  },
  label: {
    color: Colors.gray600,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    marginBottom: Spacing.xs
  },
  labelGlass: {
    color: 'rgba(255, 255, 255, 0.9)'
  },
  leftContainer: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  rightContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.sm
  }
});
