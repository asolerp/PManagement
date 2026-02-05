import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { userSelector } from '../../../Store/User/userSlice';
import IncidencesList from '../../Lists/IncidencesList';

export const IncidencesTab = ({ filters, scrollEnabled }) => {
  const user = useSelector(userSelector);
  const isAdmin = user?.role === 'admin';

  return (
    <View style={styles.container}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
