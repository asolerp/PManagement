import React, {useState} from 'react';
import {View, Text, ActivityIndicator, StyleSheet} from 'react-native';

import CheckBox from '@react-native-community/checkbox';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Avatar from '../components/Avatar';

import {TouchableOpacity} from 'react-native-gesture-handler';
import {handleCamera, handleImagePicker} from '../utils/imageFunctions';
import {GREY_1, PM_COLOR} from '../styles/colors';
import {marginBottom, marginTop} from '../styles/common';
import moment from 'moment';
import InfoIcon from './InfoIcon';
import {Colors} from '../Theme/Variables';
import {useTheme} from '../Theme';
import PhotoCameraModal from './Modals/PhotoCameraModal';

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
  const {Layout} = useTheme();
  const [photoCameraModal, setPhotoCameraModal] = useState(false);
  return (
    <React.Fragment>
      <PhotoCameraModal
        visible={photoCameraModal}
        handleVisibility={setPhotoCameraModal}
        handleClickCamera={() =>
          handleCamera((imgs) => {
            imageHandler(imgs);
            setPhotoCameraModal(false);
          })
        }
        handleClickLibrary={() =>
          handleImagePicker((imgs) => {
            imageHandler(imgs);
            setPhotoCameraModal(false);
          })
        }
      />
      <View style={{...styles.container, ...marginBottom(10)}}>
        <View style={styles.infoWrapper}>
          <Text style={styles.name}>{check.title}</Text>
          {check?.date && (
            <Text style={styles.dateStyle}>
              {moment(check?.date).format('LL')}
            </Text>
          )}
          <View
            style={[
              Layout.fill,
              Layout.rowCenter,
              Layout.justifyContentStart,
              {...marginTop(10)},
            ]}>
            {check?.worker && (
              <View>
                <Avatar
                  key={check?.worker?.uid}
                  uri={check?.worker?.profileImage}
                  size="medium"
                />
              </View>
            )}
            {check?.numberOfPhotos > 0 && (
              <View style={[Layout.rowCenter, Layout.justifyContentStart]}>
                <InfoIcon
                  info={`Fotos: ${check?.numberOfPhotos}`}
                  color={PM_COLOR}
                />
              </View>
            )}
          </View>
        </View>
        <View style={styles.checkboxWrapper}>
          <TouchableOpacity onPress={() => setPhotoCameraModal(true)}>
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
    </React.Fragment>
  );
};

export default ItemCheck;
