import React from 'react';
import {View, StyleSheet, KeyboardAvoidingView, Platform} from 'react-native';
import {GREY_1} from '../../styles/colors';

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 10,
    paddingTop: 5,
    paddingHorizontal: 10,
    paddingBottom: 5,
    borderWidth: 1,
    borderColor: GREY_1,
  },
  inputContainer: {},
  separator: {
    borderBottomColor: GREY_1,
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
