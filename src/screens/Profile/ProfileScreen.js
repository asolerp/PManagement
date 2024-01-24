import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';

// UI
import PageLayout from '../../components/PageLayout';

import CustomButton from '../../components/Elements/CustomButton';

//Redux
import {useSelector} from 'react-redux';

//Firebase
import firestore from '@react-native-firebase/firestore';

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

import FastImage from 'react-native-fast-image';
import theme from '../../Theme/Theme';

const styles = StyleSheet.create({
  multipleLineInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    borderColor: '#EAEAEA',
    marginBottom: 10,
    color: '#284748',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    borderColor: '#EAEAEA',
    marginBottom: 10,
    color: '#284748',
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
  const {user, mode} = route.params;

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
  const currentUser = useSelector(userSelector);
  const {t} = useTranslation();

  const defaultImg =
    'https://res.cloudinary.com/enalbis/image/upload/v1645959807/PortManagement/varios/Captura_de_pantalla_2022-02-27_a_las_12.02.44_vttcma.jpg';

  const logOut = async () => {
    try {
      await auth().signOut();
    } catch (err) {
      error({
        message: err.message,
        track: true,
        asToast: true,
      });
    }
  };

  useEffect(() => {
    const getCurrentUserData = async () => {
      const userQuery = await firestore()
        .collection('users')
        .doc(currentUser.id)
        .get();
      const userResponse = {id: userQuery.id, ...userQuery.data()};
      setInfoProfile(userResponse);
    };
    if (user) {
      setInfoProfile(user);
    } else {
      getCurrentUserData();
    }
  }, [user, setInfoProfile, currentUser.id]);

  return (
    <PageLayout
      safe
      edges={mode === 'admin' ? ['top', 'bottom'] : ['top']}
      titleRightSide={
        <PageOptionsScreen
          editable={false}
          collection={USERS}
          docId={infoProfile?.id}
          showDelete={currentUser.id !== infoProfile?.id}
          duplicate={false}
        />
      }
      footer={
        <>
          {currentUser.id === infoProfile?.id && (
            <CustomButton
              type="clear"
              styled="rounded"
              title={t('profile.logout')}
              onPress={() => logOut()}
            />
          )}
          <View style={[Gutters.smallTMargin, theme.mB2]}>
            <CustomButton
              styled="rounded"
              title={t('profile.edit')}
              onPress={() => handleEdit(infoProfile.id)}
            />
          </View>
        </>
      }
      titleLefSide={true}
      backButton={currentUser?.role === 'admin'}>
      <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
        <CustomPicker
          isPickerVisible={isPickerVisibleRole}
          closePicker={() => setIsPickerVisibleRole(false)}
          value={infoProfile?.role}
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
              <FastImage
                source={{
                  uri:
                    newImage?.[0]?.fileUri ||
                    infoProfile?.profileImage?.original ||
                    defaultImg,
                  priority: FastImage.priority.normal,
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
              multiline
              style={[styles.multipleLineInput]}
              placeholder={t('profile.email')}
              onChangeText={(text) =>
                setInfoProfile({...infoProfile, email: text})
              }
              value={infoProfile?.email}
            />

            <Text style={styles.inputLabel}>{t('profile.gender') + ': '}</Text>
            <Pressable onPress={() => setIsPickerVisibleGender(true)}>
              <View pointerEvents="none">
                <TextInput
                  editable={false}
                  style={[styles.input]}
                  placeholder={t('profile.gender')}
                  value={
                    genderOptions?.find((g) => g.value === infoProfile?.gender)
                      ?.label || ''
                  }
                />
              </View>
            </Pressable>

            <Text style={styles.inputLabel}>
              {t('profile.language') + ': '}
            </Text>
            <Pressable onPress={() => setIsPickerVisibleLanguage(true)}>
              <View pointerEvents="none">
                <TextInput
                  editable={false}
                  style={[styles.input]}
                  placeholder={t('profile.language')}
                  value={
                    languageOptions.find(
                      (g) => g.value === infoProfile?.language,
                    )?.label || ''
                  }
                />
              </View>
            </Pressable>
            {infoProfile?.role === 'admin' && (
              <>
                <Text style={styles.inputLabel}>
                  {t('profile.role') + ': '}
                </Text>
                <Pressable onPress={() => setIsPickerVisibleRole(true)}>
                  <View pointerEvents="none">
                    <TextInput
                      editable={false}
                      style={[styles.input]}
                      placeholder={t('profile.role')}
                      value={
                        roleOptions.find((g) => g.value === infoProfile?.role)
                          ?.label || ''
                      }
                    />
                  </View>
                </Pressable>
              </>
            )}
          </View>
          {currentUser.id === infoProfile?.id && (
            <View>
              <Text style={[styles.titleStyle, Gutters.mediumBMargin]}>
                Contraseña
              </Text>
              <Text style={styles.inputLabel}>Contraseña antigua:</Text>

              <TextInput
                style={[styles.input]}
                placeholder="Contraseña antigua"
                onChangeText={(text) =>
                  setInfoProfile({...infoProfile, oldPassword: text})
                }
                value={infoProfile?.oldPassword}
              />

              <Text style={styles.inputLabel}>Nueva contraseña:</Text>

              <TextInput
                style={[styles.input]}
                placeholder="Nueva contraseña"
                onChangeText={(text) =>
                  setInfoProfile({...infoProfile, newPassword: text})
                }
                value={infoProfile?.newPassword}
              />

              <CustomButton
                loading={loading}
                type="clear"
                title="Cambiar contraseña"
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
