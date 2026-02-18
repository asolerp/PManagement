import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as firestore from '@/services/firestore';

export function useHouses() {
  return useQuery({
    queryKey: ['houses'],
    queryFn: firestore.getHouses,
    staleTime: 1000 * 60 * 2,
  });
}

export function useHouse(id) {
  return useQuery({
    queryKey: ['house', id],
    queryFn: () => firestore.getHouse(id),
    enabled: !!id,
  });
}

export function useIncidences(filters = {}) {
  return useQuery({
    queryKey: ['incidences', filters],
    queryFn: () => firestore.getIncidences(filters),
    staleTime: 1000 * 60 * 2,
  });
}

export function useIncidence(id) {
  return useQuery({
    queryKey: ['incidence', id],
    queryFn: () => firestore.getIncidence(id),
    enabled: !!id,
  });
}

export function useChecklists(filters = {}) {
  return useQuery({
    queryKey: ['checklists', filters],
    queryFn: () => firestore.getChecklists({ ...filters, limitCount: 100 }),
    staleTime: 1000 * 60 * 2,
  });
}

export function useChecklist(id) {
  return useQuery({
    queryKey: ['checklist', id],
    queryFn: () => firestore.getChecklist(id),
    enabled: !!id,
  });
}

export function useChecks(checklistId) {
  return useQuery({
    queryKey: ['checks', checklistId],
    queryFn: () => firestore.getChecksByChecklistId(checklistId),
    enabled: !!checklistId,
  });
}

export function useSendChecklistEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (checklistId) => firestore.sendChecklistEmail(checklistId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklists'] });
    },
  });
}

export function useDeleteChecklist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (checklistId) => firestore.deleteChecklist(checklistId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklists'] });
    },
  });
}

export function useJobs() {
  return useQuery({
    queryKey: ['jobs'],
    queryFn: firestore.getJobs,
    staleTime: 1000 * 60 * 2,
  });
}

export function useJob(id) {
  return useQuery({
    queryKey: ['job', id],
    queryFn: () => firestore.getJob(id),
    enabled: !!id,
  });
}

export function useRecycleBin() {
  return useQuery({
    queryKey: ['recycleBin'],
    queryFn: firestore.getRecycleBinItems,
    staleTime: 1000 * 60 * 2,
  });
}

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: firestore.getUsers,
    staleTime: 1000 * 60 * 5,
  });
}

export function useOwners() {
  return useQuery({
    queryKey: ['owners'],
    queryFn: firestore.getOwners,
    staleTime: 1000 * 60 * 5,
  });
}

export function useWorkersFirestore() {
  return useQuery({
    queryKey: ['workers-firestore'],
    queryFn: firestore.getWorkersFromFirestore,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateHouse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: firestore.createHouse,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['houses'] }),
  });
}

export function useUploadHouseImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ houseId, file }) => firestore.uploadHouseImage(houseId, file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['houses'] }),
  });
}

export function useUpdateHouse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => firestore.updateHouse(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['houses'] }),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: firestore.createUserViaFunction,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => firestore.updateUser(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
}
