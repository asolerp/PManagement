import React from 'react';
import {View} from 'react-native';
import {useSelector} from 'react-redux';
import {userSelector} from '../../../Store/User/userSlice';
import {useTheme} from '../../../Theme';
import JobsList from '../../Lists/JobsList';

export const JobsTab = ({filters}) => {
  const {Layout} = useTheme();
  const user = useSelector(userSelector);

  const isAdmin = user?.role === 'admin';

  return (
    <View style={[Layout.fill]}>
      <JobsList
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
