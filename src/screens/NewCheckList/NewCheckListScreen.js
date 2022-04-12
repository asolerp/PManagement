import React from 'react';
import {View, StyleSheet} from 'react-native';

import {KeyboardAwareScrollView} from '@codler/react-native-keyboard-aware-scroll-view';

import CheckListForm from '../../components/Forms/CheckList/CheckListForm';

// UI
import CustomButton from '../../components/Elements/CustomButton';
import PageLayout from '../../components/PageLayout';

import {useAddEditCheckist} from './utils/useAddEditCheckList';
import {useTranslation} from 'react-i18next';

import {ScreenHeader} from '../../components/Layout/ScreenHeader';

const NewCheckListScreen = ({route}) => {
  const docId = route?.params?.docId;
  const edit = route?.params?.edit;
  const {loading, handleEdit, handleAdd, hasFilledForm} = useAddEditCheckist({
    docId,
    edit,
  });
  const {t} = useTranslation();

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
      }>
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
  container: {
    flex: 1,
  },
  newJobScreen: {
    flex: 1,
    paddingTop: 20,
    justifyContent: 'flex-start',
  },
  jobBackScreen: {
    flex: 1,
  },
  jobScreen: {
    flex: 1,
    borderTopRightRadius: 50,
    paddingTop: 20,

    height: '100%',
  },
  iconWrapper: {
    width: 30,
    height: 30,
    borderRadius: 100,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  asignList: {
    flex: 1,
  },
  inputRecurrenteWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: 10,
  },
  inputRecurrente: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabBarStyle: {
    backgroundColor: 'transparent',
    color: 'black',
  },
  tabBarLabelStyle: {color: 'black', fontWeight: 'bold'},
  tabIndicator: {
    backgroundColor: '#2A7BA5',
    width: 10,
    height: 10,
    borderRadius: 100,
  },
});

export default NewCheckListScreen;
