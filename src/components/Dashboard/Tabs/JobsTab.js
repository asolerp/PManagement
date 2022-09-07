import React from 'react';
import {View} from 'react-native';
import {useSelector} from 'react-redux';
import {userSelector} from '../../../Store/User/userSlice';

import theme from '../../../Theme/Theme';
import JobsList from '../../Lists/JobsList';

export const JobsTab = ({filters, scrollEnabled}) => {
  const user = useSelector(userSelector);

  const isAdmin = user?.role === 'admin';

  return (
    <View style={[theme.flexGrow]}>
      <JobsList
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
