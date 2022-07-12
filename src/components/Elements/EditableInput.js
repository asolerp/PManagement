import {set} from 'date-fns';
import React, {useState, useEffect} from 'react';

import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {useTheme} from '../../Theme';
import {Colors} from '../../Theme/Variables';
import Icon from 'react-native-vector-icons/MaterialIcons';

const styles = StyleSheet.create({
  input: {
    padding: 0,
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 0,
  },
  acceptButton: {
    backgroundColor: Colors.pm,
    padding: 5,
    borderRadius: 100,
  },
  closeButton: {
    backgroundColor: Colors.danger,
    padding: 5,
    borderRadius: 100,
  },
});

const EditableInput = ({value, onPressAccept}) => {
  const {Layout, Gutters, Fonts} = useTheme();
  const [text, onChangeText] = useState();
  const [showOptions, setShowOptions] = useState(false);
  useEffect(() => {
    onChangeText(value);
  }, [value]);

  useEffect(() => {
    if (text !== value) {
      return setShowOptions(true);
    }
    return setShowOptions(false);
  }, [value, text]);

  return (
    <View>
      <TextInput
        textAlignVertical="center"
        style={[styles.input, Gutters.tinyBMargin, Fonts.textInfo]}
        value={text}
        multiline
        onChangeText={(t) => onChangeText(t)}
      />
      {showOptions && (
        <View style={[Layout.rowCenter, Layout.justifyContentEnd]}>
          <TouchableOpacity
            style={[styles.acceptButton, Gutters.tinyRMargin]}
            onPress={() => onPressAccept(text)}>
            <Icon name="check" size={15} color={'white'} style={{}} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => onChangeText(value)}>
            <Icon name="close" size={15} color={'white'} style={{}} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default EditableInput;
