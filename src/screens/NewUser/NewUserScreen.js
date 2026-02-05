import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { View, StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from '@codler/react-native-keyboard-aware-scroll-view';
import { useForm } from 'react-hook-form';

// UI
import PageLayout from '../../components/PageLayout';
import CustomButton from '../../components/Elements/CustomButton';
import { ScreenHeader } from '../../components/Layout/ScreenHeader';
import NewUserForm from '../../components/Forms/User/NewUserForm';

// Hooks
import { useNewUserForm } from './hooks/useNewUserForm';

// Theme
import { Colors, Spacing } from '../../Theme/Variables';

const NewUserScreen = ({ route }) => {
  const docId = route?.params?.docId;
  const { t } = useTranslation();

  const {
    user,
    setUser,
    newImage,
    setNewImage,
    createUser,
    editUser,
    loading
  } = useNewUserForm(docId);

  const {
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { errors }
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      name: '',
      surname: '',
      email: '',
      phone: '',
      role: '',
      gender: '',
      language: ''
    }
  });

  // Pre-cargar valores del usuario si estamos editando
  useEffect(() => {
    if (user && docId) {
      setValue('name', user.firstName || '');
      setValue('surname', user.lastName || '');
      setValue('email', user.email || '');
      setValue('phone', user.phone || '');
      setValue('role', user.role || '');
      setValue('gender', user.gender || '');
      setValue('language', user.language || '');
    }
  }, [user, docId, setValue]);

  const onSubmit = data => {
    if (docId) {
      editUser({
        userId: user?.id,
        form: {
          firstName: data.name,
          lastName: data.surname,
          email: data.email,
          phone: data.phone,
          role: data.role,
          gender: data.gender,
          language: data.language
        }
      });
    } else {
      createUser(data);
    }
  };

  return (
    <PageLayout
      safe
      backButton
      edges={['top', 'bottom']}
      footer={
        <View style={styles.footer}>
          <CustomButton
            loading={loading}
            disabled={loading}
            title={docId ? t('newUser.form.edit') : t('newUser.form.create')}
            onPress={handleSubmit(onSubmit)}
          />
        </View>
      }
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <ScreenHeader
            title={docId ? t('newUser.edit') : t('newUser.title')}
            subtitle={
              docId
                ? t('newUser.editSubtitle')
                : t('newUser.subtitle')
            }
          />
        </View>
        <KeyboardAwareScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <NewUserForm
            watch={watch}
            control={control}
            errors={errors}
            setValue={setValue}
            user={user}
            setUser={setUser}
            newImage={newImage}
            setNewImage={setNewImage}
          />
        </KeyboardAwareScrollView>
      </View>
    </PageLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  footer: {
    backgroundColor: Colors.white,
    borderTopColor: Colors.gray100,
    borderTopWidth: 1,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md
  },
  header: {
    marginBottom: Spacing.md
  },
  scrollContent: {
    paddingBottom: Spacing.xl
  }
});

export default NewUserScreen;
