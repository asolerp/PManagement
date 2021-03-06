import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

// UI
import PageLayout from '../../components/PageLayout';

import CustomButton from '../../components/Elements/CustomButton';

import ImageBlurLoading from 'react-native-image-blur-loading';

//Redux
import {useSelector} from 'react-redux';

//Firebase
import {useGetDocFirebase} from '../../hooks/useGetDocFIrebase';

import auth from '@react-native-firebase/auth';

//Utils
import Icon from 'react-native-vector-icons/Ionicons';
import {userSelector} from '../../Store/User/userSlice';
import {error} from '../../lib/logging';
import {useTranslation} from 'react-i18next';
import {KeyboardAwareScrollView} from '@codler/react-native-keyboard-aware-scroll-view';
import {useProfileForm} from './hooks/useProfileForm';
import {useTheme} from '../../Theme';

import PageOptionsScreen from '../PageOptions/PageOptions';
import {USERS} from '../../utils/firebaseKeys';

import {
  genderOptions,
  languageOptions,
  roleOptions,
} from '../../components/Forms/User/NewUserForm';
import {CustomPicker} from '../../components/CustomPicker';
import {useChoseImage} from '../../hooks/useChoseImage';
import {Colors} from '../../Theme/Variables';

const styles = StyleSheet.create({
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    borderColor: '#EAEAEA',
    marginBottom: 10,
  },
  avatarContainer: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarWrapper: {
    width: 150,
    height: 150,
    borderRadius: 100,
  },
  iconContainer: {
    position: 'absolute',
    right: 20,
    top: 0,
    backgroundColor: '#ED7A7A',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
    padding: 5,
  },
  comonTextStyle: {
    fontSize: 20,
    color: '#284748',
    fontWeight: 'bold',
    marginTop: 10,
  },
  titleStyle: {
    fontSize: 20,
    color: '#284748',
    fontWeight: 'bold',
  },
  formContainer: {
    flex: 5,
    justifyContent: 'flex-start',
  },
  inputLabel: {
    fontSize: 15,
    marginBottom: 10,
    color: '#284748',
  },
});

const ProfileScreen = ({route}) => {
  const {userId, mode} = route.params;

  const [isPickerVisibleRole, setIsPickerVisibleRole] = useState(false);
  const [isPickerVisibleGender, setIsPickerVisibleGender] = useState(false);
  const [isPickerVisibleLanguage, setIsPickerVisibleLanguage] = useState(false);

  const {
    changePassword,
    loading,
    newImage,
    setNewImage,
    setInfoProfile,
    infoProfile,
    handleEdit,
  } = useProfileForm();

  const {Layout, Gutters} = useTheme();

  const {handlePressImage} = useChoseImage(setNewImage);
  const user = useSelector(userSelector);
  const {t} = useTranslation();

  const isModeAdmin = mode === 'admin';

  const defaultImg =
    'https://res.cloudinary.com/enalbis/image/upload/v1645959807/PortManagement/varios/Captura_de_pantalla_2022-02-27_a_las_12.02.44_vttcma.jpg';

  const {document: userLoggedIn} = useGetDocFirebase(
    'users',
    userId || user.id,
  );

  const logOut = async () => {
    try {
      await auth().signOut();
    } catch (err) {
      console.log(err);
      error({
        message: err.message,
        track: true,
        asToast: true,
      });
    }
  };

  useEffect(() => {
    if (userLoggedIn) {
      setInfoProfile(userLoggedIn);
    }
  }, [userLoggedIn, setInfoProfile]);

  return (
    <PageLayout
      safe
      titleRightSide={
        <PageOptionsScreen
          editable={false}
          collection={USERS}
          docId={userId || user?.id}
          showDelete={userId !== user?.id}
          duplicate={false}
        />
      }
      footer={
        <>
          {userId === user.id && (
            <CustomButton
              type="clear"
              styled="rounded"
              title={t('profile.logout')}
              onPress={() => logOut()}
            />
          )}
          <View style={[Gutters.smallTMargin]}>
            <CustomButton
              styled="rounded"
              title={t('profile.edit')}
              onPress={() => handleEdit(userId)}
            />
          </View>
        </>
      }
      titleLefSide={true}
      backButton={user?.role === 'admin'}>
      <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
        <CustomPicker
          isPickerVisible={isPickerVisibleRole}
          closePicker={() => setIsPickerVisibleRole(false)}
          value={user?.role}
          setValue={(role) => {
            setInfoProfile({...infoProfile, role: role});
          }}
          options={roleOptions}
        />
        <CustomPicker
          isPickerVisible={isPickerVisibleGender}
          closePicker={() => setIsPickerVisibleGender(false)}
          value={user?.gender}
          setValue={(gender) => {
            setInfoProfile({...infoProfile, gender: gender});
          }}
          options={genderOptions}
        />
        <CustomPicker
          isPickerVisible={isPickerVisibleLanguage}
          closePicker={() => setIsPickerVisibleLanguage(false)}
          value={user?.language}
          setValue={(language) => {
            setInfoProfile({...infoProfile, language: language});
          }}
          options={languageOptions}
        />
        <View style={styles.pageContainer}>
          <View style={styles.avatarContainer}>
            <TouchableOpacity onPress={() => handlePressImage('library')}>
              {newImage && (
                <View style={styles.iconContainer}>
                  <TouchableOpacity onPress={() => setNewImage(null)}>
                    <Icon name="close" size={20} color="white" />
                  </TouchableOpacity>
                </View>
              )}
              <ImageBlurLoading
                withIndicator
                thumbnailSource={{
                  uri: newImage?.[0]?.fileUri || infoProfile?.profileImage,
                }}
                source={{
                  uri:
                    newImage?.[0]?.fileUri ||
                    infoProfile?.profileImage ||
                    defaultImg,
                }}
                style={styles.avatarWrapper}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.formContainer}>
            <View
              style={[
                Layout.row,
                Layout.justifyContentSpaceBetween,
                Layout.alignItemsCenter,
                Gutters.mediumBMargin,
              ]}
            />
            <Text style={styles.inputLabel}>{t('profile.name') + ': '}</Text>

            <TextInput
              style={[styles.input]}
              placeholder={t('profile.name')}
              onChangeText={(text) =>
                setInfoProfile({...infoProfile, firstName: text})
              }
              value={infoProfile?.firstName}
            />

            <Text style={styles.inputLabel}>
              {t('profile.last_name') + ': '}
            </Text>

            <TextInput
              style={[styles.input]}
              placeholder={t('profile.last_name')}
              placeholderTextColor={Colors.gray600}
              onChangeText={(text) =>
                setInfoProfile({...infoProfile, lastName: text})
              }
              value={infoProfile?.lastName}
            />

            <Text style={styles.inputLabel}>{t('profile.phone') + ': '}</Text>

            <TextInput
              style={[styles.input]}
              placeholder={t('profile.phone')}
              onChangeText={(text) =>
                setInfoProfile({...infoProfile, phone: text})
              }
              value={infoProfile?.phone}
            />

            <Text style={styles.inputLabel}>{t('profile.email') + ': '}</Text>

            <TextInput
              style={[styles.input]}
              placeholder={t('profile.email')}
              onChangeText={(text) =>
                setInfoProfile({...infoProfile, email: text})
              }
              value={infoProfile?.email}
            />

            <Text style={styles.inputLabel}>{t('profile.gender') + ': '}</Text>

            <TextInput
              editable={false}
              style={[styles.input]}
              placeholder={t('profile.gender')}
              onPressIn={() => setIsPickerVisibleGender(true)}
              value={
                genderOptions?.find((g) => g.value === infoProfile?.gender)
                  ?.label || ''
              }
            />

            <Text style={styles.inputLabel}>
              {t('profile.language') + ': '}
            </Text>

            <TextInput
              editable={false}
              style={[styles.input]}
              placeholder={t('profile.language')}
              onPressIn={() => setIsPickerVisibleLanguage(true)}
              value={
                languageOptions.find((g) => g.value === infoProfile?.language)
                  ?.label || ''
              }
            />

            {/* <Text style={styles.inputLabel}>{t('profile.role') + ': '}</Text>
            <InputGroup>
              <TextInput
                editable={false}
                style={[styles.input]}
                placeholder={t('profile.role')}
                onPressIn={() => setIsPickerVisibleRole(true)}
                value={
                  roleOptions.find((g) => g.value === infoProfile?.role)
                    ?.label || ''
                }
              />
            </InputGroup> */}
          </View>
          {userId === user?.id && (
            <View>
              <Text style={[styles.titleStyle, Gutters.mediumBMargin]}>
                Contrase??a
              </Text>
              <Text style={styles.inputLabel}>Contrase??a antigua:</Text>

              <TextInput
                style={[styles.input]}
                placeholder="Contrase??a antigua"
                onChangeText={(text) =>
                  setInfoProfile({...infoProfile, oldPassword: text})
                }
                value={infoProfile?.oldPassword}
              />

              <Text style={styles.inputLabel}>Nueva contrase??a:</Text>

              <TextInput
                style={[styles.input]}
                placeholder="Nueva contrase??a"
                onChangeText={(text) =>
                  setInfoProfile({...infoProfile, newPassword: text})
                }
                value={infoProfile?.newPassword}
              />

              <CustomButton
                loading={loading}
                type="clear"
                title="Cambiar contrase??a"
                onPress={() => {
                  changePassword(
                    infoProfile?.oldPassword,
                    infoProfile?.newPassword,
                  );
                }}
              />
            </View>
          )}
        </View>
      </KeyboardAwareScrollView>
    </PageLayout>
  );
};

export default ProfileScreen;
