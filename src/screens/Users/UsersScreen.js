import React from 'react';

// UI
import Container from './Container';
import PageLayout from '../../components/PageLayout';
import {useTranslation} from 'react-i18next';

const UsersScreen = () => {
  const {t} = useTranslation();
  return (
    <React.Fragment>
      {/* <AddButton iconName="add" /> */}
      <PageLayout
        safe
        titleProps={{
          title: t('users.title'),
        }}>
        <Container />
      </PageLayout>
    </React.Fragment>
  );
};

export default UsersScreen;
