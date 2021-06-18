import React from 'react';

import {StyleSheet} from 'react-native';

import AddButton from '../../components/Elements/AddButton';

import PageLayout from '../../components/PageLayout';

import {openScreenWithPush} from '../../Router/utils/actions';
import {NEW_CHECKLIST_SCREEN} from '../../Router/utils/routerKeys';
import Container from './Container';

const CheckListScreen = () => {
  const handleNewCheckList = () => {
    openScreenWithPush(NEW_CHECKLIST_SCREEN);
  };
  return (
    <React.Fragment>
      <AddButton iconName="add" onPress={() => handleNewCheckList()} />
      <PageLayout
        titleLefSide={true}
        titleProps={{
          title: 'CheckList',
          subPage: false,
        }}>
        <Container />
      </PageLayout>
    </React.Fragment>
  );
};

export default CheckListScreen;
