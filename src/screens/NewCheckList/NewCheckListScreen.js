import React from 'react';
import { View, StyleSheet } from 'react-native';

import { KeyboardAwareScrollView } from '@codler/react-native-keyboard-aware-scroll-view';

import CheckListForm from '../../components/Forms/CheckList/CheckListForm';

// UI
import CustomButton from '../../components/Elements/CustomButton';
import PageLayout from '../../components/PageLayout';

import { useAddEditCheckist } from './utils/useAddEditCheckList';
import { useTranslation } from 'react-i18next';

import { ScreenHeader } from '../../components/Layout/ScreenHeader';

const NewCheckListScreen = ({ route }) => {
  const docId = route?.params?.docId;
  const edit = route?.params?.edit;
  const { loading, handleEdit, handleAdd, hasFilledForm } = useAddEditCheckist({
    docId,
    edit
  });
  const { t } = useTranslation();

  return (
    <PageLayout
      safe
      backButton
      footer={
        <CustomButton
          disabled={!hasFilledForm}
          loading={loading}
          styled="rounded"
          title={edit ? t('common.edit') : t('common.create')}
          onPress={() => (edit ? handleEdit() : handleAdd())}
        />
      }
    >
      <>
        <ScreenHeader
          title={edit ? t('edit_checklist.title') : t('new_checklist.title')}
        />
        <View style={styles.jobScreen}>
          <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
            <CheckListForm edit={edit} docId={docId} />
          </KeyboardAwareScrollView>
        </View>
      </>
    </PageLayout>
  );
};

const styles = StyleSheet.create({
  asignList: {
    flex: 1
  },
  container: {
    flex: 1
  },
  iconWrapper: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 100,
    height: 30,
    justifyContent: 'center',
    width: 30
  },
  inputRecurrente: {
    alignItems: 'center',
    flexDirection: 'row'
  },
  inputRecurrenteWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: 10
  },
  jobBackScreen: {
    flex: 1
  },
  jobScreen: {
    borderTopRightRadius: 50,
    flex: 1,
    height: '100%',

    paddingTop: 20
  },
  newJobScreen: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 20
  },
  tabBarLabelStyle: { color: 'black', fontWeight: 'bold' },
  tabBarStyle: {
    backgroundColor: 'transparent',
    color: 'black'
  },
  tabIndicator: {
    backgroundColor: '#2A7BA5',
    borderRadius: 100,
    height: 10,
    width: 10
  }
});

export default NewCheckListScreen;
