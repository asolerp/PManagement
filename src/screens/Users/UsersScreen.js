import React from 'react';

// UI
import Container from './Container';
import PageLayout from '../../components/PageLayout';

import AddButton from '../../components/Elements/AddButton';
import {openScreenWithPush} from '../../Router/utils/actions';
import {NEW_USER_SCREEN_KEY} from '../../Router/utils/routerKeys';

const UsersScreen = () => {
  return (
    <React.Fragment>
      <PageLayout safe edges={['top']}>
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
