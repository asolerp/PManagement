import React from 'react';
import {useTranslation} from 'react-i18next';

// UI
import PageLayout from '../../components/PageLayout';

import CustomButton from '../../components/Elements/CustomButton';
import {ScreenHeader} from '../../components/Layout/ScreenHeader';

import NewUserForm from '../../components/Forms/User/NewUserForm';
import {useNewUserForm} from './hooks/useNewUserForm';
import {KeyboardAwareScrollView} from '@codler/react-native-keyboard-aware-scroll-view';
import {useForm} from 'react-hook-form';

const NewUserScreen = ({route}) => {
  const docId = route?.params?.docId;
  const {t} = useTranslation();

  const {user, setUser, newImage, setNewImage, createUser, editUser, loading} =
    useNewUserForm(docId);

  const {
    watch,
    control,
    setValue,
    register,
    handleSubmit,
    formState: {errors},
  } = useForm({
    defaultValues: {
      name: '',
      surname: '',
      email: '',
      phone: '',
      role: '',
      gender: '',
      language: '',
    },
  });

  const onSubmit = (data) =>
    docId ? editUser({userId: user?.id, form: data}) : createUser(data);

  return (
    <PageLayout
      safe
      backButton
      footer={
        <CustomButton
          loading={loading}
          styled="rounded"
          title={docId ? t('newUser.form.edit') : t('newUser.form.create')}
          onPress={handleSubmit(onSubmit)}
        />
      }>
      <>
        <ScreenHeader title={docId ? t('newUser.edit') : t('newUser.title')} />
        <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
          <NewUserForm
            register={register}
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
      </>
    </PageLayout>
  );
};

export default NewUserScreen;
