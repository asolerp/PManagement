import React from 'react';
import CustomButton from '../Elements/CustomButton';

import {View} from 'react-native';
import {useTheme} from '../../Theme';

import {useNavigation, useRoute} from '@react-navigation/core';
import {deleteCheckListAlert} from '../Alerts/checklist';

import {deleteIncidence} from '../../Services';

const Options = () => {
  const {Gutters, Colors} = useTheme();

  const route = useRoute();
  const {incidenceId} = route.params;
  const navigation = useNavigation();

  const handleDelete = () => {
    deleteIncidence(incidenceId);
    navigation.goBack();
  };

  return (
    <View style={[Gutters.largeTMargin]}>
      <CustomButton
        loading={false}
        styled="rounded"
        title="Eleminar incidencia"
        color={Colors.danger}
        onPress={() => {
          deleteCheckListAlert(() => handleDelete());
        }}
      />
    </View>
  );
};

export default Options;
