import React from 'react';
import {View} from 'react-native';
import {useSelector} from 'react-redux';
import {userSelector} from '../../../Store/User/userSlice';
import {useTheme} from '../../../Theme';

import IncidencesList from '../../Lists/IncidencesList';
export const IncidencesTab = ({filters}) => {
  const {Layout} = useTheme();
  const user = useSelector(userSelector);
  return (
    <View style={[Layout.fill]}>
      <IncidencesList
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
