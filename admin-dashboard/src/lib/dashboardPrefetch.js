import { format, startOfMonth, endOfMonth } from 'date-fns';
import * as api from '@/services/api';
import {
  WORK_SHIFT_STATS_STALE_MS,
  WORK_SHIFTS_STALE_MS,
  DASHBOARD_SHIFTS_GC_MS,
} from '@/lib/dashboardCacheConfig';

/** Mismo rango por defecto que el dashboard (mes actual). */
export function getDefaultDashboardMonthRange() {
  const today = new Date();
  const monthDate = new Date(today.getFullYear(), today.getMonth(), 1);
  return {
    startDate: format(startOfMonth(monthDate), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(monthDate), 'yyyy-MM-dd'),
  };
}

export function todayYyyyMmDd() {
  return format(new Date(), 'yyyy-MM-dd');
}

/**
 * Precalienta stats + jornadas del mes (vista por defecto del dashboard) y jornadas de hoy
 * (panel «Estado del día»). Se ejecuta tras el login para que la primera visita a / sea rápida.
 */
export function prefetchDashboardQueries(queryClient) {
  const month = getDefaultDashboardMonthRange();
  const today = todayYyyyMmDd();

  const shiftsMonthFilters = { startDate: month.startDate, endDate: month.endDate, limit: 500 };
  const shiftsTodayFilters = { startDate: today, endDate: today, limit: 500 };

  return Promise.all([
    queryClient.prefetchQuery({
      queryKey: ['workShiftStats', month.startDate],
      queryFn: () => api.getWorkShiftStats({ date: month.startDate }),
      staleTime: WORK_SHIFT_STATS_STALE_MS,
      gcTime: DASHBOARD_SHIFTS_GC_MS,
    }),
    queryClient.prefetchQuery({
      queryKey: ['workShifts', shiftsMonthFilters],
      queryFn: () => api.getWorkShifts(shiftsMonthFilters),
      staleTime: WORK_SHIFTS_STALE_MS,
      gcTime: DASHBOARD_SHIFTS_GC_MS,
    }),
    queryClient.prefetchQuery({
      queryKey: ['workShifts', shiftsTodayFilters],
      queryFn: () => api.getWorkShifts(shiftsTodayFilters),
      staleTime: WORK_SHIFTS_STALE_MS,
      gcTime: DASHBOARD_SHIFTS_GC_MS,
    }),
  ]);
}
