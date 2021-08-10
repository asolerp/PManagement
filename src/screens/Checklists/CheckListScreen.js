import React from 'react';
import {useTranslation} from 'react-i18next';

import {StyleSheet} from 'react-native';

import AddButton from '../../components/Elements/AddButton';

import PageLayout from '../../components/PageLayout';

import {openScreenWithPush} from '../../Router/utils/actions';
import {NEW_CHECKLIST_SCREEN} from '../../Router/utils/routerKeys';
import Container from './Container';

const CheckListScreen = () => {
  const {t} = useTranslation();
  const handleNewCheckList = () => {
    openScreenWithPush(NEW_CHECKLIST_SCREEN);
  };
  return (
    <React.Fragment>
      <AddButton iconName="add" onPress={() => handleNewCheckList()} />
      <PageLayout
        titleLefSide={true}
        titleProps={{
          title: t('checklists.title'),
          subPage: false,
        }}>
        <Container />
      </PageLayout>
    </React.Fragment>
  );
};

export default CheckListScreen;
