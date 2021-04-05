import React from 'react';
import {TouchableOpacity} from 'react-native';
import {View, Text, StyleSheet} from 'react-native';

//UI
import {createIconSetFromFontello} from 'react-native-vector-icons';
import fontelloConfig from '../../assets/fonts/config.json';
const Icon = createIconSetFromFontello(fontelloConfig);

const sizeIcon = 70;

const styles = StyleSheet.create({
  container: {
    width: sizeIcon,
    marginHorizontal: 20,
    marginVertical: 10,
  },
  iconWrapper: {
    borderRadius: 100,
    marginBottom: 10,
    paddingBottom: 0,
    width: sizeIcon,
    height: sizeIcon,
    backgroundColor: '#54A5AD',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0,
    borderColor: 'white',
    elevation: 3,
    shadowOffset: {
      height: 0,
      width: 0,
    },
    shadowColor: 'black',
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  iconTitle: {
    textAlign: 'center',
    fontSize: 12,
  },
});

const TaskItem = ({icon, name, active, onPress}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View>
        <View
          style={{
            ...styles.iconWrapper,
            ...{backgroundColor: active ? 'white' : '#54A5AD'},
          }}>
          <Icon
            name={icon}
            color={active ? '#54A5AD' : 'white'}
            size={sizeIcon}
            style={{marginLeft: 0, marginTop: 0}}
          />
        </View>
        <Text style={styles.iconTitle}>{name}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default TaskItem;
