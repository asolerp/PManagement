import React from 'react';
import {View, StyleSheet, TouchableWithoutFeedback} from 'react-native';

import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

import Icon from 'react-native-vector-icons/MaterialIcons';

import CheckListForm from '../../components/Forms/CheckList/CheckListForm';

// UI
import CustomButton from '../../components/Elements/CustomButton';
import PageLayout from '../../components/PageLayout';

import {popScreen} from '../../Router/utils/actions';
import {Colors} from '../../Theme/Variables';
import {useAddEditCheckist} from './utils/useAddEditCheckList';

const NewCheckListScreen = ({route}) => {
  const {docId, edit} = route.params;
  const {loading, handleEdit, handleAdd} = useAddEditCheckist({docId});

  return (
    <PageLayout
      safe
      titleRightSide={
        <TouchableWithoutFeedback
          onPress={() => {
            popScreen();
          }}>
          <View>
            <Icon name="close" size={25} color={Colors.white} />
          </View>
        </TouchableWithoutFeedback>
      }
      footer={
        <CustomButton
          loading={loading}
          styled="rounded"
          title={edit ? 'Editar' : 'Crear'}
          onPress={() => (edit ? handleEdit() : handleAdd())}
        />
      }
      titleProps={{
        title: 'Nuevo checklist',
        subPage: true,
      }}>
      <View style={styles.jobScreen}>
        <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
          <CheckListForm edit={edit} docId={docId} />
        </KeyboardAwareScrollView>
      </View>
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
