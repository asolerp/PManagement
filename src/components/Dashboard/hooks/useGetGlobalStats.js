import { useQuery } from '@tanstack/react-query';
import { fetchChecklistsNotFinished } from '../../../Services/firebase/checklistServices';
import { fetchIncidences } from '../../../Services/firebase/indicendesServices';

export const useGetGlobalStats = ({ uid }) => {
  const { data: checksData } = useQuery({
    queryKey: ['checklistsNotFinished', uid, null],
    queryFn: context => fetchChecklistsNotFinished(context)
  });

  const { data: incidencesData } = useQuery({
    queryKey: ['incidencesNotFinished', uid, false],
    queryFn: context => fetchIncidences(context)
  });

  return {
    checks: checksData?.length || 0,
    incidences: incidencesData?.length || 0
  };
};
