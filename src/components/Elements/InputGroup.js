import React from 'react';
import {View, StyleSheet, KeyboardAvoidingView, Platform} from 'react-native';

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    paddingTop: 5,
    paddingHorizontal: 10,
    paddingBottom: 5,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  inputContainer: {},
  separator: {
    borderBottomColor: '#EAEAEA',
    borderBottomWidth: 1,
  },
});

const InputGroup = ({children}) => {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.container}>
        {Array.isArray(children) ? (
          <View style={styles.inputContainer}>
            {children.map((elemnt, i) => (
              <View key={i}>
                {elemnt}
                {i !== children.length - 1 && <View style={styles.separator} />}
              </View>
            ))}
          </View>
        ) : (
          children
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

export default InputGroup;
