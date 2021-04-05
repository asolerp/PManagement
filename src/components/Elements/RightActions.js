import React from 'react';
import {View, TouchableOpacity, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#EB5B28',
    justifyContent: 'center',
    marginLeft: -15,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 10,
  },
  icon: {
    marginLeft: 10,
  },
});

const RightActions = (progress, dragX, deleteAction) => {
  return (
    <React.Fragment>
      <TouchableOpacity onPress={() => deleteAction()}>
        <View style={styles.container}>
          <Icon
            name="trash-outline"
            size={20}
            color="white"
            style={styles.icon}
          />
        </View>
      </TouchableOpacity>
    </React.Fragment>
  );
};

export default RightActions;
