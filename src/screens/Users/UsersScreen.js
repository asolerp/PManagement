import React from 'react';

// UI
import Container from './Container';
import PageLayout from '../../components/PageLayout';
import {useTranslation} from 'react-i18next';
import AddButton from '../../components/Elements/AddButton';
import {openScreenWithPush} from '../../Router/utils/actions';
import {NEW_USER_SCREEN_KEY} from '../../Router/utils/routerKeys';

const UsersScreen = () => {
  const {t} = useTranslation();
  return (
    <React.Fragment>
      {/* <AddButton iconName="add" /> */}
      <PageLayout safe>
        <AddButton
          iconName="add"
          containerStyle={{right: 0, bottom: 30}}
          onPress={() => openScreenWithPush(NEW_USER_SCREEN_KEY)}
        />
        <Container />
      </PageLayout>
    </React.Fragment>
  );
};

export default UsersScreen;
