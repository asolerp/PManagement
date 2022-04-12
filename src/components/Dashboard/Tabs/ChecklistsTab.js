import React from 'react';
import {View} from 'react-native';
import {useTheme} from '../../../Theme';
import ChecklistList from '../../Lists/ChecklistList';
export const ChecklistsTab = ({filters}) => {
  const {Layout} = useTheme();
  return (
    <View style={[Layout.grow]}>
      <ChecklistList
        workers={filters?.workers}
        houses={filters?.houses}
        typeFilters={filters?.type}
        time={filters?.time}
        state={filters?.checklistState}
      />
    </View>
  );
};
