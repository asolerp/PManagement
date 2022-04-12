import React from 'react';
import {View} from 'react-native';
import {useTheme} from '../../../Theme';
import JobsList from '../../Lists/JobsList';

export const JobsTab = ({filters}) => {
  const {Layout} = useTheme();
  return (
    <View style={[Layout.fill]}>
      <JobsList
        workers={filters?.workers}
        houses={filters?.houses}
        typeFilters={filters?.type}
        time={filters?.time}
        state={filters?.checklistState}
      />
    </View>
  );
};
