import React from 'react';
import {View} from 'react-native';
import {useSelector} from 'react-redux';
import {userSelector} from '../../../Store/User/userSlice';

import theme from '../../../Theme/Theme';

import IncidencesList from '../../Lists/IncidencesList';
export const IncidencesTab = ({filters, scrollEnabled}) => {
  const user = useSelector(userSelector);

  const isAdmin = user?.role === 'admin';

  return (
    <View style={[theme.flex1]}>
      <IncidencesList
        scrollEnabled={scrollEnabled}
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
