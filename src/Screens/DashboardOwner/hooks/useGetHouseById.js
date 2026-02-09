import { useQuery } from '@tanstack/react-query';

import { CHECKLISTS, CHECKS, HOUSES } from '../../../utils/firebaseKeys';
import { fetchHouseByOwnerId } from '../../../Services/firebase/houseServices';
import {
  fetchChecklistsByHouseId,
  fetchChecksByChecklistId
} from '../../../Services/firebase/checklistServices';

export const useGetHouseById = userId => {
  const { data: house, isLoading: isLoadingHouse } = useQuery({
    queryKey: [HOUSES, userId],
    queryFn: () => fetchHouseByOwnerId(userId),
    enabled: !!userId
  });

  const { data: checklist, isLoading: isLoadingChecklists } = useQuery({
    queryKey: [CHECKLISTS, house?.id],
    queryFn: () => fetchChecklistsByHouseId(house?.id),
    enabled: !!house?.id
  });

  const { data: checks, isLoading: isLoadingChecks } = useQuery({
    queryKey: [CHECKS, checklist?.id],
    queryFn: () => fetchChecksByChecklistId(checklist?.id),
    enabled: !!checklist?.id
  });

  return {
    house,
    loading: isLoadingHouse || isLoadingChecklists || isLoadingChecks,
    checklist,
    checksFromChecklist: checks
  };
};
