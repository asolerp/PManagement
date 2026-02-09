import React from 'react';
import { View, StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from '@codler/react-native-keyboard-aware-scroll-view';
import { useTranslation } from 'react-i18next';

// UI
import PageLayout from '../../components/PageLayout';
import CustomButton from '../../components/Elements/CustomButton';
import { ScreenHeader } from '../../components/Layout/ScreenHeader';
import CheckListForm from '../../components/Forms/CheckList/CheckListForm';

// Hooks
import { useAddEditCheckist } from './utils/useAddEditCheckList';

const NewCheckListScreen = ({ route }) => {
  const { t } = useTranslation();
  const docId = route?.params?.docId;
  const edit = route?.params?.edit;

  const { loading, handleEdit, handleAdd, hasFilledForm } = useAddEditCheckist({
    docId,
    edit
  });

  const renderFooterButton = () => (
    <CustomButton
      disabled={!hasFilledForm}
      loading={loading}
      styled="rounded"
      title={edit ? t('common.edit') : t('common.create')}
      onPress={() => (edit ? handleEdit() : handleAdd())}
    />
  );

  return (
    <PageLayout
      safe
      backButton
      titleProps={{
        subPage: true
      }}
      footer={renderFooterButton()}
    >
      <View style={styles.container}>
        <ScreenHeader
          title={edit ? t('edit_checklist.title') : t('new_checklist.title')}
          subtitle={
            edit
              ? 'Modifica los detalles del checklist'
              : 'Crea un nuevo checklist para gestionar tareas'
          }
        />
        <KeyboardAwareScrollView
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <CheckListForm edit={edit} docId={docId} />
        </KeyboardAwareScrollView>
      </View>
    </PageLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10
  },
  scrollContent: {
    paddingBottom: 30
  },
  scrollView: {
    flex: 1,
    marginTop: 20
  }
});

export default NewCheckListScreen;
