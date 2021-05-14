import React from 'react';
import {View, Text, ActivityIndicator, StyleSheet} from 'react-native';

import CheckBox from '@react-native-community/checkbox';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Avatar from '../components/Avatar';

import {TouchableOpacity} from 'react-native-gesture-handler';
import {handleImagePicker} from '../utils/imageFunctions';
import {GREY_1, PM_COLOR} from '../styles/colors';
import {marginBottom, marginTop, width} from '../styles/common';
import moment from 'moment';
import InfoIcon from './InfoIcon';
import {Colors} from '../Theme/Variables';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'white',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: GREY_1,
    borderRadius: 10,
  },
  checkboxWrapper: {
    flexDirection: 'row',
  },
  infoWrapper: {
    flex: 6,
    marginLeft: 0,
    paddingRight: 20,
  },
  name: {
    fontSize: 15,
  },
  dateStyle: {
    color: '#2A7BA5',
  },
  buttonStyle: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: PM_COLOR,
    borderRadius: 100,
    marginRight: 10,
  },
});

const ItemCheck = ({check, handleCheck, imageHandler, loading}) => {
  return (
    <View style={{...styles.container, ...marginBottom(10)}}>
      {/* {check?.worker && <Avatar uri={check?.worker?.profileImage} size="big" />} */}
      <View style={styles.infoWrapper}>
        <Text style={styles.name}>{check.title}</Text>
        {check?.date && (
          <Text style={styles.dateStyle}>
            {moment(check?.date).format('LL')}
          </Text>
        )}
        {check?.numberOfPhotos > 0 && (
          <View style={{...marginTop(10), ...width(30)}}>
            <InfoIcon
              info={`Fotos: ${check?.numberOfPhotos}`}
              color={PM_COLOR}
            />
          </View>
        )}
      </View>
      <View style={styles.checkboxWrapper}>
        <TouchableOpacity
          onPress={() => handleImagePicker((imgs) => imageHandler(imgs))}>
          <View style={styles.buttonStyle}>
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Icon name="camera-alt" size={18} color="white" />
            )}
          </View>
        </TouchableOpacity>
        <CheckBox
          disabled={false}
          value={check.done}
          onTintColor={Colors.leftBlue}
          onCheckColor={Colors.leftBlue}
          onValueChange={() => handleCheck()}
        />
      </View>
    </View>
  );
};

export default ItemCheck;
