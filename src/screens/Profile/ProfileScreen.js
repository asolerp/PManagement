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

// Redux
import { useSelector } from 'react-redux';

// Firebase
import { getAuth, signOut } from '@react-native-firebase/auth';

// Utils
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { userSelector } from '../../Store/User/userSlice';
import { error } from '../../lib/logging';
import { useTranslation } from 'react-i18next';
import { KeyboardAwareScrollView } from '@codler/react-native-keyboard-aware-scroll-view';
import { useProfileForm } from './hooks/useProfileForm';

import PageOptionsScreen from '../PageOptions/PageOptions';
import { USERS } from '../../utils/firebaseKeys';

import {
  genderOptions,
  languageOptions,
  roleOptions
} from '../../components/Forms/User/NewUserForm';
import { CustomPicker } from '../../components/CustomPicker';
import {
  Colors,
  FontSize,
  FontWeight,
  Spacing,
  BorderRadius,
  Shadows
} from '../../Theme/Variables';

import FastImage from 'react-native-fast-image';
import { DEFAULT_IMAGE } from '../../constants/general';
import PhotoCameraModal from '../../components/Modals/PhotoCameraModal';
import { useQuery } from '@tanstack/react-query';
import { fetchUser } from '../../Services/firebase/userServices';

// ============================================
// Sub-components
// ============================================

const SectionHeader = ({ icon, title }) => (
  <View style={styles.sectionHeader}>
    <View style={styles.sectionIconContainer}>
      <MaterialIcon name={icon} size={20} color={Colors.white} />
    </View>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

const FormCard = ({ children, style }) => (
  <View style={[styles.formCard, style]}>{children}</View>
);

const InputField = ({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  editable = true,
  onPress,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  secureTextEntry = false,
  rightIcon
}) => {
  const inputContent = (
    <View style={styles.inputWrapper}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            multiline && styles.inputMultiline,
            !editable && styles.inputDisabled
          ]}
          placeholder={placeholder}
          placeholderTextColor={Colors.gray400}
          value={value}
          onChangeText={onChangeText}
          multiline={multiline}
          editable={editable && !onPress}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          secureTextEntry={secureTextEntry}
        />
        {rightIcon && (
          <View style={styles.inputRightIcon}>
            <MaterialIcon name={rightIcon} size={20} color={Colors.gray400} />
          </View>
        )}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress}>
        <View pointerEvents="none">{inputContent}</View>
      </Pressable>
    );
  }

  return inputContent;
};

const AvatarSection = ({
  imageUri,
  newImage,
  onPressAvatar,
  onRemoveNewImage
}) => (
  <View style={styles.avatarSection}>
    <TouchableOpacity
      onPress={onPressAvatar}
      style={styles.avatarTouchable}
      activeOpacity={0.8}
    >
      <View style={styles.avatarOuterRing}>
        <FastImage
          source={{
            uri: newImage?.[0]?.uri || imageUri || DEFAULT_IMAGE,
            priority: FastImage.priority.normal
          }}
          style={styles.avatarImage}
        />
        <View style={styles.avatarOverlay}>
          <MaterialIcon name="camera-alt" size={24} color={Colors.white} />
          <Text style={styles.avatarOverlayText}>Cambiar</Text>
        </View>
      </View>
      {newImage && (
        <TouchableOpacity
          style={styles.removeImageButton}
          onPress={onRemoveNewImage}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="close" size={16} color={Colors.white} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  </View>
);

// ============================================
// Main Component
// ============================================

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

  const { t } = useTranslation();

  const isOwnProfile = currentUser.id === infoProfile?.id;

  const logOut = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
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

  const renderFooter = () => (
    <View style={styles.footerContainer}>
      <CustomButton
        styled="rounded"
        title={t('common.save')}
        onPress={() => handleEdit(infoProfile.id)}
      />
      {isOwnProfile && (
        <TouchableOpacity style={styles.logoutButton} onPress={logOut}>
          <MaterialIcon name="logout" size={20} color={Colors.danger} />
          <Text style={styles.logoutText}>{t('profile.logout')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <>
      <PhotoCameraModal
        visible={photoCameraModal}
        handleVisibility={setPhotoCameraModal}
        onSelectImage={imgs => setNewImage(imgs)}
      />

      {/* Pickers */}
      <CustomPicker
        isPickerVisible={isPickerVisibleRole}
        closePicker={() => setIsPickerVisibleRole(false)}
        value={infoProfile?.role}
        setValue={role => setInfoProfile({ ...infoProfile, role })}
        options={roleOptions}
      />
      <CustomPicker
        isPickerVisible={isPickerVisibleGender}
        closePicker={() => setIsPickerVisibleGender(false)}
        value={infoProfile?.gender}
        setValue={gender => setInfoProfile({ ...infoProfile, gender })}
        options={genderOptions}
      />
      <CustomPicker
        isPickerVisible={isPickerVisibleLanguage}
        closePicker={() => setIsPickerVisibleLanguage(false)}
        value={infoProfile?.language}
        setValue={language => setInfoProfile({ ...infoProfile, language })}
        options={languageOptions}
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
        footer={renderFooter()}
        titleLefSide={true}
        backButton={currentUser?.role === 'admin'}
      >
        <KeyboardAwareScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Avatar Section */}
          <AvatarSection
            imageUri={infoProfile?.profileImage?.original}
            newImage={newImage}
            onPressAvatar={() => setPhotoCameraModal(true)}
            onRemoveNewImage={() => setNewImage(null)}
          />

          {/* User Name Display */}
          <Text style={styles.userName}>
            {infoProfile?.firstName} {infoProfile?.lastName}
          </Text>
          <Text style={styles.userRole}>
            {roleOptions.find(r => r.value === infoProfile?.role)?.label ||
              infoProfile?.role}
          </Text>

          {/* Personal Information Section */}
          <SectionHeader icon="person" title={t('profile.personalInfo')} />
          <FormCard>
            <InputField
              label={t('profile.name')}
              placeholder={t('profile.name')}
              value={infoProfile?.firstName}
              onChangeText={text =>
                setInfoProfile({ ...infoProfile, firstName: text })
              }
            />
            <InputField
              label={t('profile.last_name')}
              placeholder={t('profile.last_name')}
              value={infoProfile?.lastName}
              onChangeText={text =>
                setInfoProfile({ ...infoProfile, lastName: text })
              }
            />
            <InputField
              label={t('profile.gender')}
              placeholder={t('profile.gender')}
              value={
                genderOptions?.find(g => g.value === infoProfile?.gender)
                  ?.label || ''
              }
              editable={false}
              onPress={() => setIsPickerVisibleGender(true)}
              rightIcon="keyboard-arrow-down"
            />
            <InputField
              label={t('profile.language')}
              placeholder={t('profile.language')}
              value={
                languageOptions.find(g => g.value === infoProfile?.language)
                  ?.label || ''
              }
              editable={false}
              onPress={() => setIsPickerVisibleLanguage(true)}
              rightIcon="keyboard-arrow-down"
            />
            {currentUser?.role === 'admin' && (
              <InputField
                label={t('profile.role')}
                placeholder={t('profile.role')}
                value={
                  roleOptions.find(g => g.value === infoProfile?.role)?.label ||
                  ''
                }
                editable={false}
                onPress={() => setIsPickerVisibleRole(true)}
                rightIcon="keyboard-arrow-down"
              />
            )}
          </FormCard>

          {/* Contact Information Section */}
          <SectionHeader icon="contact-mail" title={t('profile.contactInfo')} />
          <FormCard>
            <InputField
              label={t('profile.phone')}
              placeholder={t('profile.phone')}
              value={infoProfile?.phone}
              onChangeText={text =>
                setInfoProfile({ ...infoProfile, phone: text })
              }
              keyboardType="phone-pad"
            />
            <InputField
              label={t('profile.email')}
              placeholder={t('profile.email')}
              value={infoProfile?.email}
              onChangeText={text =>
                setInfoProfile({ ...infoProfile, email: text })
              }
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <InputField
              label={t('profile.aditionalEmail')}
              placeholder={t('profile.aditionalEmail')}
              value={infoProfile?.aditionalEmail}
              onChangeText={text =>
                setInfoProfile({ ...infoProfile, aditionalEmail: text })
              }
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </FormCard>

          {/* Password Section - Only for own profile */}
          {isOwnProfile && (
            <>
              <SectionHeader icon="lock" title={t('profile.security')} />
              <FormCard>
                <InputField
                  label={t('profile.oldPassword')}
                  placeholder={t('profile.oldPassword')}
                  value={infoProfile?.oldPassword}
                  onChangeText={text =>
                    setInfoProfile({ ...infoProfile, oldPassword: text })
                  }
                  secureTextEntry
                />
                <InputField
                  label={t('profile.newPassword')}
                  placeholder={t('profile.newPassword')}
                  value={infoProfile?.newPassword}
                  onChangeText={text =>
                    setInfoProfile({ ...infoProfile, newPassword: text })
                  }
                  secureTextEntry
                />
                <TouchableOpacity
                  style={styles.changePasswordButton}
                  onPress={() =>
                    changePassword(
                      infoProfile?.oldPassword,
                      infoProfile?.newPassword
                    )
                  }
                  disabled={loading}
                >
                  <MaterialIcon name="vpn-key" size={18} color={Colors.white} />
                  <Text style={styles.changePasswordText}>
                    {t('profile.changePassword')}
                  </Text>
                </TouchableOpacity>
              </FormCard>
            </>
          )}

          <View style={styles.bottomSpacer} />
        </KeyboardAwareScrollView>
      </PageLayout>
    </>
  );
};

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  avatarImage: {
    borderRadius: BorderRadius.full,
    height: 120,
    width: 120
  },
  avatarOuterRing: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderColor: Colors.pm,
    borderRadius: BorderRadius.full,
    borderWidth: 3,
    elevation: 8,
    justifyContent: 'center',
    overflow: 'hidden',
    padding: 4,
    shadowColor: Colors.pm,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8
  },
  avatarOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: BorderRadius.full,
    bottom: 4,
    justifyContent: 'center',
    left: 4,
    position: 'absolute',
    right: 4,
    top: 4
  },
  avatarOverlayText: {
    color: Colors.white,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    marginTop: 2
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
    marginTop: Spacing.md
  },
  avatarTouchable: {
    position: 'relative'
  },
  bottomSpacer: {
    height: Spacing.xl
  },
  changePasswordButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Colors.pmLight,
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm
  },
  changePasswordText: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    marginLeft: Spacing.sm
  },
  footerContainer: {
    gap: Spacing.md,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md
  },
  formCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.lg,
    padding: Spacing.base,
    ...Shadows.sm
  },
  input: {
    backgroundColor: Colors.gray50,
    borderColor: Colors.gray200,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    color: Colors.gray800,
    flex: 1,
    fontSize: FontSize.base,
    height: 48,
    paddingHorizontal: Spacing.md
  },
  inputContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    position: 'relative'
  },
  inputDisabled: {
    backgroundColor: Colors.gray100,
    color: Colors.gray600
  },
  inputLabel: {
    color: Colors.gray600,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    marginBottom: Spacing.xs
  },
  inputMultiline: {
    height: 80,
    paddingTop: Spacing.md,
    textAlignVertical: 'top'
  },
  inputRightIcon: {
    position: 'absolute',
    right: Spacing.md
  },
  inputWrapper: {
    marginBottom: Spacing.md
  },
  logoutButton: {
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    paddingVertical: Spacing.sm
  },
  logoutText: {
    color: Colors.danger,
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    marginLeft: Spacing.sm
  },
  removeImageButton: {
    alignItems: 'center',
    backgroundColor: Colors.danger,
    borderColor: Colors.white,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    height: 28,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    top: 0,
    width: 28
  },
  scrollContent: {
    paddingHorizontal: Spacing.base
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: Spacing.md,
    marginTop: Spacing.sm
  },
  sectionIconContainer: {
    alignItems: 'center',
    backgroundColor: Colors.pm,
    borderRadius: BorderRadius.md,
    height: 32,
    justifyContent: 'center',
    marginRight: Spacing.sm,
    width: 32
  },
  sectionTitle: {
    color: Colors.gray800,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold
  },
  userName: {
    color: Colors.gray800,
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.xs,
    textAlign: 'center'
  },
  userRole: {
    color: Colors.pm,
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    marginBottom: Spacing.xl,
    textAlign: 'center'
  }
});

export default ProfileScreen;
