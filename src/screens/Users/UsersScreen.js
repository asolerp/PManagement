import React from 'react';

// UI
import AddButton from '../../components/Elements/AddButton';
import Container from './Container';
import PageLayout from '../../components/PageLayout';
import {useTranslation} from 'react-i18next';

const UsersScreen = () => {
  const {t} = useTranslation();
  return (
    <React.Fragment>
      {/* <AddButton iconName="add" /> */}
      <PageLayout
        titleProps={{
          subPage: false,
          title: t('users.title'),
          color: 'white',
        }}>
        <Container />
      </PageLayout>
    </React.Fragment>
  );
};

export default UsersScreen;
