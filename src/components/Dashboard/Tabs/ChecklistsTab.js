import React from 'react';
import {View} from 'react-native';
import {useSelector} from 'react-redux';
import {userSelector} from '../../../Store/User/userSlice';

import theme from '../../../Theme/Theme';
import ChecklistList from '../../Lists/ChecklistList';
export const ChecklistsTab = ({filters}) => {
  const user = useSelector(userSelector);

  const isAdmin = user?.role === 'admin';

  return (
    <View style={[theme.flex1]}>
      <ChecklistList
        uid={!isAdmin && user?.id}
        workers={filters?.workers}
        houses={filters?.houses}
        typeFilters={filters?.type}
        time={filters?.time}
        state={filters?.checklistState}
      />
    </View>
  );
};
