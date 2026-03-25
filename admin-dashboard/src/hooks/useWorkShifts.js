import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '@/services/api';
import {
  WORK_SHIFT_STATS_STALE_MS,
  WORK_SHIFTS_STALE_MS,
  DASHBOARD_SHIFTS_GC_MS,
} from '@/lib/dashboardCacheConfig';

export { WORK_SHIFT_STATS_STALE_MS, WORK_SHIFTS_STALE_MS } from '@/lib/dashboardCacheConfig';

export function useWorkShifts(filters = {}) {
  return useQuery({
    queryKey: ['workShifts', filters],
    queryFn: () => api.getWorkShifts(filters),
    staleTime: WORK_SHIFTS_STALE_MS,
    gcTime: DASHBOARD_SHIFTS_GC_MS,
  });
}

export function useWorkShiftStats(date) {
  return useQuery({
    queryKey: ['workShiftStats', date],
    queryFn: () => api.getWorkShiftStats({ date }),
    staleTime: WORK_SHIFT_STATS_STALE_MS,
    gcTime: DASHBOARD_SHIFTS_GC_MS,
  });
}

export function useWorkers() {
  return useQuery({
    queryKey: ['workers'],
    queryFn: api.getWorkers,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function useCreateWorkShift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.createWorkShift,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workShifts'] });
      queryClient.invalidateQueries({ queryKey: ['workShiftStats'] });
    },
  });
}

export function useUpdateWorkShift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.updateWorkShift,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workShifts'] });
      queryClient.invalidateQueries({ queryKey: ['workShiftStats'] });
    },
  });
}

export function useDeleteWorkShift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.deleteWorkShift,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workShifts'] });
      queryClient.invalidateQueries({ queryKey: ['workShiftStats'] });
    },
  });
}

export function useMigrateEntrances() {
  return useMutation({
    mutationFn: api.migrateEntrances,
  });
}
