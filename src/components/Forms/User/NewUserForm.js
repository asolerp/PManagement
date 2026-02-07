import React, { useEffect, useState } from 'react';
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Controller } from 'react-hook-form';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FastImage from 'react-native-fast-image';

import { CustomSelect } from '../../CustomSelect';
import { CustomPicker } from '../../CustomPicker';
import { useNewUser } from './hooks/useNewUser';
import { TextInputController } from '../TextInputController';

import {
  Colors,
  FontSize,
  FontWeight,
  Spacing,
  BorderRadius,
  Shadows
} from '../../../Theme/Variables';

export const roleOptions = [
  { label: 'Administrador', value: 'admin' },
  { label: 'Trabajador', value: 'worker' },
  { label: 'Propietario', value: 'owner' }
];

export const languageOptions = [
  { label: 'Español', value: 'es' },
  { label: 'Inglés', value: 'en' }
];

export const genderOptions = [
  { label: 'Masculino', value: 'male' },
  { label: 'Femenino', value: 'female' }
];

const defaultImg =
  'https://firebasestorage.googleapis.com/v0/b/port-management-9bd53.appspot.com/o/other%2Fport.png?alt=media&token=41156ea7-76a2-4a28-8625-27f779433b78';

// ============================================
// Sub-components
// ============================================

const SectionHeader = ({ icon, title }) => (
  <View style={styles.sectionHeader}>
    <View style={styles.sectionIcon}>
      <Icon name={icon} size={18} color={Colors.white} />
    </View>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

const FormCard = ({ children }) => (
  <View style={styles.formCard}>{children}</View>
);

const ProfileImage = ({ newImage, setNewImage, handlePressImage }) => {
  const { t } = useTranslation();
  const hasImage = newImage?.[0]?.fileUri;

  return (
    <View style={styles.imageSection}>
      <TouchableOpacity
        onPress={() => handlePressImage('library')}
        style={styles.imageWrapper}
        activeOpacity={0.8}
      >
        <View style={styles.avatarRing}>
          <FastImage
            source={{
              uri: hasImage || defaultImg,
              priority: FastImage.priority.normal
            }}
            style={styles.avatar}
            resizeMode={FastImage.resizeMode.cover}
          />
          <View style={styles.avatarOverlay}>
            <Icon name="camera-alt" size={24} color={Colors.white} />
          </View>
        </View>
        {hasImage && (
          <TouchableOpacity
            onPress={() => setNewImage(null)}
            style={styles.removeButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="close" size={16} color={Colors.white} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
      <Text style={styles.imageHint}>{t('newUser.form.photoHint')}</Text>
    </View>
  );
};

// ============================================
// Main Component
// ============================================

const NewUserForm = ({
  user,
  watch,
  errors,
  control,
  setValue,
  newImage,
  setNewImage
}) => {
  const { t } = useTranslation();
  const [isPickerVisibleRole, setIsPickerVisibleRole] = useState(false);
  const [isPickerVisibleGender, setIsPickerVisibleGender] = useState(false);
  const [isPickerVisibleLanguage, setIsPickerVisibleLanguage] = useState(false);

  const [watches, setWatches] = useState({});

  const { handlePressImage } = useNewUser(setNewImage);

  useEffect(() => {
    const subscription = watch(value => setWatches(value));
    return () => subscription.unsubscribe();
  }, [watch]);

  // Pre-cargar valores del usuario si existe
  useEffect(() => {
    if (user) {
      setValue('name', user.firstName || '');
      setValue('surname', user.lastName || '');
      setValue('email', user.email || '');
      setValue('phone', user.phone || '');
      setValue('role', user.role || '');
      setValue('gender', user.gender || '');
      setValue('language', user.language || '');
    }
  }, [user, setValue]);

  return (
    <View style={styles.container}>
      {/* Pickers */}
      <CustomPicker
        isPickerVisible={isPickerVisibleRole}
        closePicker={() => setIsPickerVisibleRole(false)}
        value={watches?.role}
        setValue={role => setValue('role', role, { shouldValidate: true })}
        options={roleOptions}
        title={t('newUser.form.role')}
      />
      <CustomPicker
        isPickerVisible={isPickerVisibleGender}
        closePicker={() => setIsPickerVisibleGender(false)}
        value={watches?.gender}
        setValue={gender => setValue('gender', gender, { shouldValidate: true })}
        options={genderOptions}
        title={t('newUser.form.gender')}
      />
      <CustomPicker
        isPickerVisible={isPickerVisibleLanguage}
        closePicker={() => setIsPickerVisibleLanguage(false)}
        value={watches?.language}
        setValue={language =>
          setValue('language', language, { shouldValidate: true })
        }
        options={languageOptions}
        title={t('newUser.form.language')}
      />

      {/* Profile Image */}
      <ProfileImage
        newImage={newImage}
        setNewImage={setNewImage}
        handlePressImage={handlePressImage}
      />

      {/* Personal Info Section */}
      <SectionHeader icon="person" title={t('newUser.sections.personal')} />
      <FormCard>
        <View style={styles.inputGroup}>
          <TextInputController
            control={control}
            name="name"
            placeholder={t('newUser.form.name')}
            rules={{ required: true }}
            errors={errors}
          />
        </View>
        <View style={styles.inputGroup}>
          <TextInputController
            control={control}
            name="surname"
            placeholder={t('newUser.form.surname')}
            rules={{ required: true }}
            errors={errors}
          />
        </View>
        <View style={styles.inputRow}>
          <View style={styles.inputHalf}>
            <Controller
              control={control}
              name="gender"
              rules={{ required: true }}
              render={({ field: { value } }) => (
                <CustomSelect
                  placeHolder={t('newUser.form.gender')}
                  value={genderOptions?.find(r => r.value === value)?.label}
                  onPress={() => setIsPickerVisibleGender(true)}
                  hasError={errors.gender}
                />
              )}
            />
          </View>
          <View style={styles.inputHalf}>
            <Controller
              control={control}
              name="language"
              rules={{ required: true }}
              render={({ field: { value } }) => (
                <CustomSelect
                  placeHolder={t('newUser.form.language')}
                  value={languageOptions?.find(r => r.value === value)?.label}
                  onPress={() => setIsPickerVisibleLanguage(true)}
                  hasError={errors.language}
                />
              )}
            />
          </View>
        </View>
      </FormCard>

      {/* Contact Section */}
      <SectionHeader icon="contact-mail" title={t('newUser.sections.contact')} />
      <FormCard>
        <View style={styles.inputGroup}>
          <TextInputController
            control={control}
            name="email"
            placeholder={t('newUser.form.email')}
            rules={{ required: true }}
            errors={errors}
            inputProps={{ keyboardType: 'email-address', autoCapitalize: 'none' }}
          />
        </View>
        <View style={styles.inputGroupLast}>
          <TextInputController
            control={control}
            name="phone"
            placeholder={t('newUser.form.phone')}
            rules={{ required: true }}
            errors={errors}
            inputProps={{ keyboardType: 'phone-pad' }}
          />
        </View>
      </FormCard>

      {/* Role Section */}
      <SectionHeader icon="badge" title={t('newUser.sections.role')} />
      <FormCard>
        <Controller
          control={control}
          name="role"
          rules={{ required: true }}
          render={({ field: { value } }) => (
            <CustomSelect
              placeHolder={t('newUser.form.role')}
              value={roleOptions?.find(r => r.value === value)?.label}
              onPress={() => setIsPickerVisibleRole(true)}
              hasError={errors.role}
            />
          )}
        />
      </FormCard>
    </View>
  );
};

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  avatar: {
    borderRadius: BorderRadius.full,
    height: 112,
    width: 112
  },
  avatarOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: BorderRadius.full,
    bottom: 4,
    justifyContent: 'center',
    left: 4,
    position: 'absolute',
    right: 4,
    top: 4
  },
  avatarRing: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.full,
    borderWidth: 3,
    justifyContent: 'center',
    overflow: 'hidden',
    padding: 4,
    ...Shadows.md
  },
  container: {
    paddingBottom: Spacing.lg
  },
  formCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.lg,
    padding: Spacing.base,
    ...Shadows.sm
  },
  imageHint: {
    color: Colors.gray500,
    fontSize: FontSize.sm,
    marginTop: Spacing.md
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    marginTop: Spacing.md
  },
  imageWrapper: {
    position: 'relative'
  },
  inputGroup: {
    marginBottom: Spacing.md
  },
  inputGroupLast: {
    marginBottom: 0
  },
  inputHalf: {
    flex: 1
  },
  inputRow: {
    flexDirection: 'row',
    gap: Spacing.md
  },
  removeButton: {
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
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: Spacing.md
  },
  sectionIcon: {
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    height: 28,
    justifyContent: 'center',
    marginRight: Spacing.sm,
    width: 28
  },
  sectionTitle: {
    color: Colors.gray700,
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold
  }
});

export default NewUserForm;
