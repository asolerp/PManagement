import { useQuery } from '@tanstack/react-query';
import { fetchChecklistsNotFinished } from '../../../Services/firebase/checklistServices';
import { fetchIncidences } from '../../../Services/firebase/indicendesServices';

export const useGetGlobalStats = ({uid}) => {


  const { data: checks } = useQuery({ queryKey: ['checklistsNotFinished', uid, null], queryFn: fetchChecklistsNotFinished })
  const { data: incidences } = useQuery({ queryKey: ['incidencesNotFinished', uid, false], queryFn: fetchIncidences })


  return {
    checks: checks?.length,
    incidences: incidences?.length,
  };
};
