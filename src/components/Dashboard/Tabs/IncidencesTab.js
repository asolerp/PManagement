import React from 'react';
import {View} from 'react-native';
import {useTheme} from '../../../Theme';

import IncidencesList from '../../Lists/IncidencesList';
export const IncidencesTab = ({filters}) => {
  const {Layout} = useTheme();
  return (
    <View style={[Layout.fill]}>
      <IncidencesList
        workers={filters?.workers}
        houses={filters?.houses}
        typeFilters={filters?.type}
        time={filters?.time}
        state={filters?.checklistState}
      />
    </View>
  );
};
