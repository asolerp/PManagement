import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Pressable
} from 'react-native';

// UI
import PageLayout from '../../components/PageLayout';

import CustomButton from '../../components/Elements/CustomButton';

//Redux
import { useSelector } from 'react-redux';

//Firebase
import firestore from '@react-native-firebase/firestore';

import auth from '@react-native-firebase/auth';

//Utils
import Icon from 'react-native-vector-icons/Ionicons';
import { userSelector } from '../../Store/User/userSlice';
import { error } from '../../lib/logging';
import { useTranslation } from 'react-i18next';
import { KeyboardAwareScrollView } from '@codler/react-native-keyboard-aware-scroll-view';
import { useProfileForm } from './hooks/useProfileForm';
import { useTheme } from '../../Theme';

import PageOptionsScreen from '../PageOptions/PageOptions';
import { USERS } from '../../utils/firebaseKeys';

import {
  genderOptions,
  languageOptions,
  roleOptions
} from '../../components/Forms/User/NewUserForm';
import { CustomPicker } from '../../components/CustomPicker';
import { useChoseImage } from '../../hooks/useChoseImage';
import { Colors } from '../../Theme/Variables';

import FastImage from 'react-native-fast-image';
import theme from '../../Theme/Theme';
import { DEFAULT_IMAGE } from '../../constants/general';
import PhotoCameraModal from '../../components/Modals/PhotoCameraModal';
import { useQuery } from '@tanstack/react-query';
import { fetchUser } from '../../Services/firebase/userServices';

const styles = StyleSheet.create({
  avatarContainer: {
    alignItems: 'center',
    flex: 2,
    justifyContent: 'center'
  },
  avatarWrapper: {
    borderRadius: 100,
    height: 150,
    width: 150
  },
  comonTextStyle: {
    color: '#284748',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10
  },
  formContainer: {
    flex: 5,
    justifyContent: 'flex-start'
  },
  iconContainer: {
    alignItems: 'center',
    backgroundColor: '#ED7A7A',
    borderRadius: 100,
    justifyContent: 'center',
    padding: 5,
    position: 'absolute',
    right: 20,
    top: 0,
    zIndex: 5
  },
  input: {
    borderColor: '#EAEAEA',
    borderRadius: 10,
    borderWidth: 1,
    color: '#284748',
    height: 50,
    marginBottom: 10,
    padding: 10
  },
  inputLabel: {
    color: '#284748',
    fontSize: 15,
    marginBottom: 10
  },
  multipleLineInput: {
    borderColor: '#EAEAEA',
    borderRadius: 10,
    borderWidth: 1,
    color: '#284748',
    marginBottom: 10,
    padding: 10
  },
  titleStyle: {
    color: '#284748',
    fontSize: 20,
    fontWeight: 'bold'
  }
});

const ProfileScreen = ({ route }) => {
  const { user, mode } = route.params;

  const [isPickerVisibleRole, setIsPickerVisibleRole] = useState(false);
  const [isPickerVisibleGender, setIsPickerVisibleGender] = useState(false);
  const [isPickerVisibleLanguage, setIsPickerVisibleLanguage] = useState(false);
  const [photoCameraModal, setPhotoCameraModal] = useState(false);

  const currentUser = useSelector(userSelector);

  const { data } = useQuery({
    queryKey: ['users', currentUser.id],
    queryFn: () => fetchUser(currentUser.id),
    enabled: !user
  });

  const {
    changePassword,
    loading,
    newImage,
    setNewImage,
    setInfoProfile,
    infoProfile,
    handleEdit
  } = useProfileForm();

  const { Layout, Gutters } = useTheme();

  const { t } = useTranslation();

  const logOut = async () => {
    try {
      await auth().signOut();
    } catch (err) {
      error({
        message: err.message,
        track: true,
        asToast: true
      });
    }
  };

  useEffect(() => {
    if (user) {
      setInfoProfile(user);
    } else {
      setInfoProfile(data);
    }
  }, [user, data, setInfoProfile, currentUser.id]);

  return (
    <>
      <PhotoCameraModal
        visible={photoCameraModal}
        handleVisibility={setPhotoCameraModal}
        onSelectImage={imgs => setNewImage(imgs)}
      />
      <PageLayout
        safe
        edges={mode === 'admin' ? ['top', 'bottom'] : ['top']}
        titleRightSide={
          <PageOptionsScreen
            editable={false}
            collection={USERS}
            docId={infoProfile?.id}
            showRestorePassword={true}
            userEmail={infoProfile?.email}
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
                title="Guardar"
                onPress={() => handleEdit(infoProfile.id)}
              />
            </View>
          </>
        }
        titleLefSide={true}
        backButton={currentUser?.role === 'admin'}
      >
        <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
          <CustomPicker
            isPickerVisible={isPickerVisibleRole}
            closePicker={() => setIsPickerVisibleRole(false)}
            value={infoProfile?.role}
            setValue={role => {
              setInfoProfile({ ...infoProfile, role: role });
            }}
            options={roleOptions}
          />
          <CustomPicker
            isPickerVisible={isPickerVisibleGender}
            closePicker={() => setIsPickerVisibleGender(false)}
            value={user?.gender}
            setValue={gender => {
              setInfoProfile({ ...infoProfile, gender: gender });
            }}
            options={genderOptions}
          />
          <CustomPicker
            isPickerVisible={isPickerVisibleLanguage}
            closePicker={() => setIsPickerVisibleLanguage(false)}
            value={user?.language}
            setValue={language => {
              setInfoProfile({ ...infoProfile, language: language });
            }}
            options={languageOptions}
          />
          <View style={styles.pageContainer}>
            <View style={styles.avatarContainer}>
              <TouchableOpacity onPress={() => setPhotoCameraModal(true)}>
                {newImage && (
                  <View style={styles.iconContainer}>
                    <TouchableOpacity onPress={() => setNewImage(null)}>
                      <Icon name="close" size={20} color="white" />
                    </TouchableOpacity>
                  </View>
                )}
                <View
                  style={[
                    theme.border1,
                    theme.borderGray400,
                    theme.roundedFull,
                    theme.p2
                  ]}
                >
                  <FastImage
                    source={{
                      uri:
                        newImage?.[0]?.uri ||
                        infoProfile?.profileImage?.original ||
                        DEFAULT_IMAGE,
                      priority: FastImage.priority.normal
                    }}
                    style={styles.avatarWrapper}
                  />
                </View>
              </TouchableOpacity>
            </View>
            <View style={styles.formContainer}>
              <View
                style={[
                  Layout.row,
                  Layout.justifyContentSpaceBetween,
                  Layout.alignItemsCenter,
                  Gutters.mediumBMargin
                ]}
              />
              <Text style={styles.inputLabel}>{t('profile.name') + ': '}</Text>

              <TextInput
                style={styles.input}
                placeholder={t('profile.name')}
                onChangeText={text =>
                  setInfoProfile({ ...infoProfile, firstName: text })
                }
                value={infoProfile?.firstName}
              />

              <Text style={styles.inputLabel}>
                {t('profile.last_name') + ': '}
              </Text>

              <TextInput
                style={styles.input}
                placeholder={t('profile.last_name')}
                placeholderTextColor={Colors.gray600}
                onChangeText={text =>
                  setInfoProfile({ ...infoProfile, lastName: text })
                }
                value={infoProfile?.lastName}
              />

              <Text style={styles.inputLabel}>{t('profile.phone') + ': '}</Text>

              <TextInput
                style={styles.input}
                placeholder={t('profile.phone')}
                onChangeText={text =>
                  setInfoProfile({ ...infoProfile, phone: text })
                }
                value={infoProfile?.phone}
              />

              <Text style={styles.inputLabel}>{t('profile.email') + ': '}</Text>

              <TextInput
                multiline
                style={styles.multipleLineInput}
                placeholder={t('profile.email')}
                onChangeText={text =>
                  setInfoProfile({ ...infoProfile, email: text })
                }
                value={infoProfile?.email}
              />

              <Text style={styles.inputLabel}>
                {t('profile.aditionalEmail') + ': '}
              </Text>

              <TextInput
                multiline
                autoCapitalize="none"
                style={styles.multipleLineInput}
                placeholder={t('profile.aditionalEmail')}
                onChangeText={text =>
                  setInfoProfile({ ...infoProfile, aditionalEmail: text })
                }
                value={infoProfile?.aditionalEmail}
              />

              <Text style={styles.inputLabel}>
                {t('profile.gender') + ': '}
              </Text>
              <Pressable onPress={() => setIsPickerVisibleGender(true)}>
                <View pointerEvents="none">
                  <TextInput
                    editable={false}
                    style={styles.input}
                    placeholder={t('profile.gender')}
                    value={
                      genderOptions?.find(g => g.value === infoProfile?.gender)
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
                    style={styles.input}
                    placeholder={t('profile.language')}
                    value={
                      languageOptions.find(
                        g => g.value === infoProfile?.language
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
                        style={styles.input}
                        placeholder={t('profile.role')}
                        value={
                          roleOptions.find(g => g.value === infoProfile?.role)
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
                  style={styles.input}
                  placeholder="Contraseña antigua"
                  onChangeText={text =>
                    setInfoProfile({ ...infoProfile, oldPassword: text })
                  }
                  value={infoProfile?.oldPassword}
                />

                <Text style={styles.inputLabel}>Nueva contraseña:</Text>

                <TextInput
                  style={styles.input}
                  placeholder="Nueva contraseña"
                  onChangeText={text =>
                    setInfoProfile({ ...infoProfile, newPassword: text })
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
                      infoProfile?.newPassword
                    );
                  }}
                />
              </View>
            )}
          </View>
        </KeyboardAwareScrollView>
      </PageLayout>
    </>
  );
};

export default ProfileScreen;
