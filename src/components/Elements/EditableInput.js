import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const EditableInput = ({
  value,
  onPressAccept,
  placeholder = 'Añadir comentarios...'
}) => {
  const [text, onChangeText] = useState(value);
  const [showOptions, setShowOptions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    onChangeText(value);
  }, [value]);

  useEffect(() => {
    if (text !== value) {
      return setShowOptions(true);
    }
    return setShowOptions(false);
  }, [value, text]);

  const handleAccept = async () => {
    setIsSaving(true);
    try {
      await onPressAccept(text);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    onChangeText(value);
    setShowOptions(false);
  };

  const hasText = text && text.trim().length > 0;
  const characterCount = text?.length || 0;

  return (
    <View style={styles.container}>
      <View
        style={[styles.inputWrapper, isFocused && styles.inputWrapperFocused]}
      >
        <TextInput
          style={styles.input}
          value={text}
          multiline
          numberOfLines={4}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          editable={!isSaving}
        />

        {hasText && !showOptions && (
          <View style={styles.infoRow}>
            <Icon name="check-circle" size={14} color="#10B981" />
            <Text style={styles.savedText}>Guardado</Text>
          </View>
        )}
      </View>

      {showOptions && (
        <View style={styles.actionsContainer}>
          <View style={styles.leftActions}>
            <Text style={styles.characterCount}>
              {characterCount} caracteres
            </Text>
          </View>

          <View style={styles.rightActions}>
            <Pressable
              style={({ pressed }) => [
                styles.cancelButton,
                pressed && styles.buttonPressed
              ]}
              onPress={handleCancel}
              disabled={isSaving}
            >
              <Icon name="close" size={18} color="#EF4444" />
              <Text style={styles.cancelText}>Cancelar</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.acceptButton,
                pressed && styles.buttonPressed,
                isSaving && styles.buttonDisabled
              ]}
              onPress={handleAccept}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.acceptText}>Guardando...</Text>
                </>
              ) : (
                <>
                  <Icon name="check" size={18} color="#FFFFFF" />
                  <Text style={styles.acceptText}>Guardar</Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  acceptButton: {
    alignItems: 'center',
    backgroundColor: '#55A5AD',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10
  },
  acceptText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600'
  },
  actionsContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12
  },
  buttonDisabled: {
    opacity: 0.6
  },
  buttonPressed: {
    opacity: 0.7
  },
  cancelButton: {
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderColor: '#FEE2E2',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    marginRight: 8,
    paddingHorizontal: 16,
    paddingVertical: 10
  },
  cancelText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600'
  },
  characterCount: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '500'
  },
  container: {
    width: '100%'
  },
  infoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    marginTop: 8
  },
  input: {
    color: '#374151',
    fontSize: 14,
    lineHeight: 20,
    minHeight: 80,
    padding: 0,
    textAlignVertical: 'top'
  },
  inputWrapper: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderRadius: 10,
    borderWidth: 1,
    padding: 12
  },
  inputWrapperFocused: {
    borderColor: '#55A5AD',
    borderWidth: 2
  },
  leftActions: {
    flex: 1
  },
  rightActions: {
    flexDirection: 'row'
  },
  savedText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '600'
  }
});

export default EditableInput;
