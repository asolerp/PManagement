import React from 'react';
import {useSelector} from 'react-redux';
import {userSelector} from '../../../Store/User/userSlice';

import ChecklistList from '../../Lists/ChecklistList';
export const ChecklistsTab = ({filters, scrollEnabled}) => {
  const user = useSelector(userSelector);

  const isAdmin = user?.role === 'admin';

  return (
    <ChecklistList
      scrollEnabled={scrollEnabled}
      uid={!isAdmin && user?.id}
      workers={filters?.workers}
      houses={filters?.houses}
      typeFilters={filters?.type}
      time={filters?.time}
      state={filters?.checklistState}
    />
  );
};
