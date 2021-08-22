import React, {useState} from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import CheckBox from '@react-native-community/checkbox';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Avatar from '../components/Avatar';

import {handleCamera, handleImagePicker} from '../utils/imageFunctions';
import {GREY_1, PM_COLOR} from '../styles/colors';

import moment from 'moment';
import {firebase} from '@react-native-firebase/firestore';

import {Colors, FontSize} from '../Theme/Variables';
import {useTheme} from '../Theme';
import PhotoCameraModal from './Modals/PhotoCameraModal';
import Badge from './Elements/Badge';
import {useSelector} from 'react-redux';
import {userSelector} from '../Store/User/userSlice';
import {useUpdateFirebase} from '../hooks/useUpdateFirebase';
import {error} from '../lib/logging';

import {useTranslation} from 'react-i18next';
import {openScreenWithPush} from '../Router/utils/actions';
import {CHECK_PHOTO_SCREEN_KEY} from '../Router/utils/routerKeys';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'white',
    alignItems: 'center',
    padding: 10,
    borderBottomColor: GREY_1,
    borderBottomWidth: 1,
  },
  checkboxWrapper: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    flexDirection: 'row',
  },
  checkInfo: {
    maxWidth: 230,
  },
  infoWrapper: {
    marginLeft: 0,
    paddingRight: 20,
  },
  name: {
    fontSize: FontSize.small,
    width: '80%',
  },
  dateStyle: {
    color: Colors.darkBlue,
    fontSize: FontSize.tiny,
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

const ItemCheck = ({check, checklistId, disabled, imageHandler, loading}) => {
  const {Layout, Gutters} = useTheme();
  const [photoCameraModal, setPhotoCameraModal] = useState(false);
  const {updateFirebase} = useUpdateFirebase('checklists');

  const {t} = useTranslation();
  const user = useSelector(userSelector);

  const handleCheck = async (status) => {
    try {
      await updateFirebase(`${checklistId}/checks/${check?.id}`, {
        ...check,
        date: !status ? null : new Date(),
        done: status,
        worker: status ? user : null,
      });
      await updateFirebase(`${checklistId}`, {
        done: status
          ? firebase.firestore.FieldValue.increment(1)
          : firebase.firestore.FieldValue.increment(-1),
      });
    } catch (err) {
      error({
        message: err.message,
        track: true,
        asToast: true,
      });
    }
  };

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
      <View style={{...styles.container}}>
        <CheckBox
          disabled={disabled}
          value={check.done}
          onTintColor={Colors.leftBlue}
          onCheckColor={Colors.leftBlue}
          onValueChange={(e) => handleCheck(e)}
        />
        <TouchableOpacity
          onPress={
            check.numberOfPhotos > 0
              ? () =>
                  openScreenWithPush(CHECK_PHOTO_SCREEN_KEY, {
                    checkId: checklistId,
                    checkItemId: check.id,
                    title: check.title,
                    date: check.date,
                  })
              : null
          }>
          <View style={[styles.checkInfo, Gutters.smallLMargin, Layout.fill]}>
            <Text
              style={[
                styles.name,
                check.done && {textDecorationLine: 'line-through'},
              ]}>
              {check.title}
            </Text>
            {check?.date && (
              <Text style={styles.dateStyle}>
                {moment(check?.date?.toDate()).format('LL')}
              </Text>
            )}
            <View
              style={[
                Layout.row,
                Layout.alignItemsCenter,
                Gutters.tinyTMargin,
              ]}>
              {check?.worker && (
                <View style={[Gutters.tinyRMargin]}>
                  <Avatar
                    key={check?.worker?.uid}
                    uri={check?.worker?.profileImage}
                    size="small"
                  />
                </View>
              )}
              {check?.numberOfPhotos > 0 && (
                <View
                  style={[
                    Layout.fill,
                    Layout.column,
                    Layout.justifyContentStart,
                  ]}>
                  {check?.numberOfPhotos > 0 && (
                    <Badge
                      label={t('check.photos') + ': '}
                      text={check?.numberOfPhotos}
                      variant="warning"
                    />
                  )}
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
        <View style={styles.checkboxWrapper}>
          <TouchableOpacity onPress={() => setPhotoCameraModal(true)}>
            <View
              style={[
                styles.buttonStyle,
                {
                  backgroundColor:
                    check?.numberOfPhotos > 0 ? Colors.warning : Colors.pm,
                },
              ]}>
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Icon name="camera-alt" size={18} color="white" />
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </React.Fragment>
  );
};

export default ItemCheck;
