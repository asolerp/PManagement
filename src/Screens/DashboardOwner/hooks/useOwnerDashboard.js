import { useQuery } from '@tanstack/react-query';

import { CHECKLISTS, CHECKS, HOUSES, INCIDENCES } from '../../../utils/firebaseKeys';
import { fetchHouseByOwnerId } from '../../../Services/firebase/houseServices';
import {
  fetchChecklistsByHouseId,
  fetchChecksByChecklistId
} from '../../../Services/firebase/checklistServices';
import { fetchIncidencesByHouseId } from '../../../Services/firebase/indicendesServices';

export const useOwnerDashboard = userId => {
  const {
    data: house,
    isLoading: isLoadingHouse,
    isError: isErrorHouse
  } = useQuery({
    queryKey: [HOUSES, userId],
    queryFn: () => fetchHouseByOwnerId(userId),
    enabled: !!userId
  });

  const {
    data: checklist,
    isLoading: isLoadingChecklist
  } = useQuery({
    queryKey: [CHECKLISTS, house?.id],
    queryFn: () => fetchChecklistsByHouseId(house?.id),
    enabled: !!house?.id
  });

  const {
    data: checks,
    isLoading: isLoadingChecks
  } = useQuery({
    queryKey: [CHECKS, checklist?.id],
    queryFn: () => fetchChecksByChecklistId(checklist?.id),
    enabled: !!checklist?.id
  });

  const {
    data: incidences,
    isLoading: isLoadingIncidences
  } = useQuery({
    queryKey: [INCIDENCES, 'byHouse', house?.id],
    queryFn: () => fetchIncidencesByHouseId(house?.id),
    enabled: !!house?.id
  });

  return {
    house,
    checklist,
    checks,
    incidences: incidences || [],
    loading:
      isLoadingHouse ||
      isLoadingChecklist ||
      isLoadingChecks ||
      isLoadingIncidences,
    isErrorHouse
  };
};
