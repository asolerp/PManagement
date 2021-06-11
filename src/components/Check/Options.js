import React from 'react';
import CustomButton from '../Elements/CustomButton';

import {View} from 'react-native';
import {useTheme} from '../../Theme';
import duplicateCheckList from '../../Services/duplicateCheckList';
import {useNavigation, useRoute} from '@react-navigation/core';
import {deleteCheckListAlert, sendOwnerChecklist} from '../Alerts/checklist';

import {useDispatch} from 'react-redux';
import {deleteCheckListAction} from '../../Store/App/appSlice';
import deleteCheckList from '../../Services/deleteCheckList';

const Options = () => {
  const {Gutters, Colors} = useTheme();
  const dispatch = useDispatch();
  const route = useRoute();
  const {docId} = route.params;
  const navigation = useNavigation();

  const handleSubmit = () => {
    duplicateCheckList(docId);
    navigation.goBack();
  };

  const handleDelete = () => {
    deleteCheckList(`checklists/${docId}/checks`);
    navigation.goBack();
  };

  return (
    <View style={[Gutters.largeTMargin]}>
      <CustomButton
        loading={false}
        styled="rounded"
        title="Duplicar checklikst"
        onPress={() => {
          sendOwnerChecklist(() => handleSubmit());
        }}
        containerStyle={[Gutters.tinyBMargin]}
      />
      <CustomButton
        loading={false}
        styled="rounded"
        title="Eleminar"
        color={Colors.danger}
        onPress={() => {
          deleteCheckListAlert(() => handleDelete());
        }}
      />
    </View>
  );
};

export default Options;
