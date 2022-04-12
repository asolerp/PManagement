import React from 'react';
import {useTranslation} from 'react-i18next';

// UI
import PageLayout from '../../components/PageLayout';

import CustomButton from '../../components/Elements/CustomButton';
import {ScreenHeader} from '../../components/Layout/ScreenHeader';

import NewUserForm from '../../components/Forms/User/NewUserForm';
import {useNewUserForm} from './hooks/useNewUserForm';
import {KeyboardAwareScrollView} from '@codler/react-native-keyboard-aware-scroll-view';

const NewUserScreen = ({route}) => {
  const docId = route?.params?.docId;
  const {t} = useTranslation();

  const {
    user,
    setUser,
    newImage,
    setNewImage,
    createUser,
    editUser,
    loading,
    isAllfilled,
  } = useNewUserForm(docId);

  return (
    <PageLayout
      safe
      backButton
      footer={
        <CustomButton
          disabled={!isAllfilled && !docId}
          loading={loading}
          styled="rounded"
          title={docId ? t('newUser.form.edit') : t('newUser.form.create')}
          onPress={() => (docId ? editUser(user?.id) : createUser())}
        />
      }>
      <>
        <ScreenHeader title={docId ? t('newUser.edit') : t('newUser.title')} />
        <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
          <NewUserForm
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
