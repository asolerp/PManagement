import React from 'react';
import CustomButton from '../Elements/CustomButton';

import {View} from 'react-native';
import {useTheme} from '../../Theme';
import duplicateCheckList from '../../Services/duplicateCheckList';
import {useNavigation, useRoute} from '@react-navigation/core';
import {deleteCheckListAlert, sendOwnerChecklist} from '../Alerts/checklist';

import {useDispatch} from 'react-redux';
import {deleteCheckListAction} from '../../Store/App/appSlice';

const Options = () => {
  const {Gutters, Colors} = useTheme();
  const dispatch = useDispatch();
  const route = useRoute();
  const {checkId} = route.params;
  const navigation = useNavigation();

  const handleSubmit = () => {
    duplicateCheckList(checkId);
    navigation.goBack();
  };

  const handleDelete = () => {
    dispatch(deleteCheckListAction(checkId));
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
