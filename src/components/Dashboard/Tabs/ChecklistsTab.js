import React from 'react';
import {View} from 'react-native';
import {useSelector} from 'react-redux';
import {userSelector} from '../../../Store/User/userSlice';
import {useTheme} from '../../../Theme';
import ChecklistList from '../../Lists/ChecklistList';
export const ChecklistsTab = ({filters}) => {
  const user = useSelector(userSelector);
  const {Layout} = useTheme();
  return (
    <View style={[Layout.grow]}>
      <ChecklistList
        uid={user?.id}
        workers={filters?.workers}
        houses={filters?.houses}
        typeFilters={filters?.type}
        time={filters?.time}
        state={filters?.checklistState}
      />
    </View>
  );
};
