import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as firestore from '@/services/firestore';
import { useAuth } from '@/hooks/useAuth.jsx';

export function useUpdateCompany() {
  const queryClient = useQueryClient();
  const { userData, refreshCompany } = useAuth();
  const companyId = userData?.companyId;
  return useMutation({
    mutationFn: (data) => firestore.updateCompany(companyId, data),
    onSuccess: () => {
      refreshCompany?.();
    },
  });
}

export function useHouses() {
  const { userData } = useAuth();
  const companyId = userData?.companyId;
  return useQuery({
    queryKey: ['properties', companyId],
    queryFn: () => firestore.getHouses(companyId),
    enabled: !!companyId,
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
  const { userData } = useAuth();
  const companyId = userData?.companyId;
  return useQuery({
    queryKey: ['incidents', companyId, filters],
    queryFn: () => firestore.getIncidences({ ...filters, companyId }),
    enabled: !!companyId,
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

export function useCreateIncidence() {
  const queryClient = useQueryClient();
  const { userData } = useAuth();
  const companyId = userData?.companyId;
  return useMutation({
    mutationFn: (payload) => firestore.createIncidence(companyId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
    },
  });
}

export function useUpdateIncidence() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => firestore.updateIncidence(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['incidence', id] });
    },
  });
}

export function useDeleteIncidence() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => firestore.deleteIncidence(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['incidence', id] });
    },
  });
}

export function useInspectionReports() {
  const { userData } = useAuth();
  const companyId = userData?.companyId;
  return useQuery({
    queryKey: ['inspectionReports', companyId],
    queryFn: () => firestore.getInspectionReports(companyId),
    enabled: !!companyId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useInspectionReport(id) {
  return useQuery({
    queryKey: ['inspectionReport', id],
    queryFn: () => firestore.getInspectionReport(id),
    enabled: !!id,
  });
}

export function useUpdateInspectionReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => firestore.updateInspectionReport(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['inspectionReports'] });
      queryClient.invalidateQueries({ queryKey: ['inspectionReport', id] });
    },
  });
}

export function useDeleteInspectionReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => firestore.deleteInspectionReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspectionReports'] });
    },
  });
}

// ——— Mensajes y actividad (timeline) ———
export function useMessages(collectionName, docId) {
  return useQuery({
    queryKey: ['messages', collectionName, docId],
    queryFn: () => firestore.getMessages(collectionName, docId),
    enabled: !!collectionName && !!docId,
    staleTime: 1000 * 60,
  });
}

export function useActivity(collectionName, docId) {
  return useQuery({
    queryKey: ['activity', collectionName, docId],
    queryFn: () => firestore.getActivity(collectionName, docId),
    enabled: !!collectionName && !!docId,
    staleTime: 1000 * 60,
  });
}

export function useAddMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ collectionName, docId, text, user }) =>
      firestore.addMessage(collectionName, docId, { text, user }),
    onSuccess: (_, { collectionName, docId }) => {
      queryClient.invalidateQueries({ queryKey: ['messages', collectionName, docId] });
      queryClient.invalidateQueries({ queryKey: ['timeline', collectionName, docId] });
    },
  });
}

export function useAddActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ collectionName, docId, ...payload }) =>
      firestore.addActivity(collectionName, docId, payload),
    onSuccess: (_, { collectionName, docId }) => {
      queryClient.invalidateQueries({ queryKey: ['activity', collectionName, docId] });
      queryClient.invalidateQueries({ queryKey: ['timeline', collectionName, docId] });
    },
  });
}

export function useUpdateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => firestore.updateJob(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['job', id] });
    },
  });
}

export function useChecklists(filters = {}) {
  const { userData } = useAuth();
  const companyId = userData?.companyId;
  return useQuery({
    queryKey: ['checklists', companyId, filters],
    queryFn: () => firestore.getChecklists({ ...filters, companyId, limitCount: 100 }),
    enabled: !!companyId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useChecklistsPaginated(filters = {}) {
  const { userData } = useAuth();
  const companyId = userData?.companyId;
  return useInfiniteQuery({
    queryKey: ['checklists-paginated', companyId, filters],
    queryFn: ({ pageParam }) =>
      firestore.getChecklistsPage({ filters: { ...filters, companyId }, pageParam }),
    initialPageParam: null,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.lastDoc : undefined,
    enabled: !!companyId,
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

export function useUpdateCheck() {
  const queryClient = useQueryClient();
  const { user, userData } = useAuth();
  return useMutation({
    mutationFn: ({ checklistId, checkId, check, done }) => {
      const worker = done && user && userData
        ? {
            uid: user.uid,
            firstName: userData.firstName || '',
            lastName: userData.lastName || ''
          }
        : null;
      return firestore.updateCheck(checklistId, checkId, check, done, worker);
    },
    onSuccess: (_, { checklistId }) => {
      queryClient.invalidateQueries({ queryKey: ['checks', checklistId] });
      queryClient.invalidateQueries({ queryKey: ['checklist', checklistId] });
      queryClient.invalidateQueries({ queryKey: ['checklists'] });
      queryClient.invalidateQueries({ queryKey: ['checklists-paginated'] });
    },
  });
}

export function useCreateChecklist() {
  const queryClient = useQueryClient();
  const { userData } = useAuth();
  const companyId = userData?.companyId;
  return useMutation({
    mutationFn: (payload) => firestore.createChecklist(companyId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklists'] });
      queryClient.invalidateQueries({ queryKey: ['checklists-paginated'] });
    },
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
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['checklists'] });
      queryClient.invalidateQueries({ queryKey: ['checklists-paginated'] });
      await queryClient.refetchQueries({ queryKey: ['checklists'] });
      await queryClient.refetchQueries({ queryKey: ['checklists-paginated'] });
    },
  });
}

export function useJobs() {
  const { userData } = useAuth();
  const companyId = userData?.companyId;
  return useQuery({
    queryKey: ['jobs', companyId],
    queryFn: () => firestore.getJobs(companyId),
    enabled: !!companyId,
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

export function useCreateJob() {
  const queryClient = useQueryClient();
  const { userData } = useAuth();
  const companyId = userData?.companyId;
  return useMutation({
    mutationFn: (payload) => firestore.createJob(companyId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}

export function useDeleteJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => firestore.deleteJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}

export function useRecycleBin() {
  const { userData } = useAuth();
  const companyId = userData?.companyId;
  return useQuery({
    queryKey: ['recycleBin', companyId],
    queryFn: () => firestore.getRecycleBinItems(companyId),
    enabled: !!companyId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useAuditLog(opts = {}) {
  const { userData } = useAuth();
  const companyId = userData?.companyId;
  return useQuery({
    queryKey: ['auditLog', companyId, opts],
    queryFn: () => firestore.getAuditLog(companyId, opts),
    enabled: !!companyId,
    staleTime: 1000 * 60,
  });
}

export function useUsers() {
  const { userData } = useAuth();
  const companyId = userData?.companyId;
  return useQuery({
    queryKey: ['users', companyId],
    queryFn: () => firestore.getUsers(companyId),
    enabled: !!companyId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useOwners() {
  const { userData } = useAuth();
  const companyId = userData?.companyId;
  return useQuery({
    queryKey: ['owners', companyId],
    queryFn: () => firestore.getOwners(companyId),
    enabled: !!companyId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useOwnerDocuments(ownerId) {
  const { userData } = useAuth();
  const companyId = userData?.companyId;
  return useQuery({
    queryKey: ['ownerDocuments', companyId, ownerId],
    queryFn: () => firestore.getOwnerDocuments(companyId, ownerId),
    enabled: !!companyId && !!ownerId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useUploadOwnerDocument() {
  const queryClient = useQueryClient();
  const { userData } = useAuth();
  const companyId = userData?.companyId;
  return useMutation({
    mutationFn: ({ ownerId, file, name, type }) =>
      firestore.uploadOwnerDocument(companyId, ownerId, file, { name, type }),
    onSuccess: (_, { ownerId }) => {
      queryClient.invalidateQueries({ queryKey: ['ownerDocuments', companyId, ownerId] });
    },
  });
}

export function useDeleteOwnerDocument() {
  const queryClient = useQueryClient();
  const { userData } = useAuth();
  const companyId = userData?.companyId;
  return useMutation({
    mutationFn: (id) => firestore.deleteOwnerDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownerDocuments', companyId] });
    },
  });
}

export function useWorkersFirestore() {
  const { userData } = useAuth();
  const companyId = userData?.companyId;
  return useQuery({
    queryKey: ['workers-firestore', companyId],
    queryFn: () => firestore.getWorkersFromFirestore(companyId),
    enabled: !!companyId,
    staleTime: 1000 * 60 * 5,
  });
}

// ——— Cuadrantes ———
function toYYYYMMDD(date) {
  if (!date) return null;
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function useQuadrantsByDate(date) {
  const { userData } = useAuth();
  const companyId = userData?.companyId;
  const dateStr = toYYYYMMDD(date);
  return useQuery({
    queryKey: ['quadrants', companyId, dateStr],
    queryFn: () => firestore.getQuadrantsByDate(companyId, dateStr || date),
    enabled: !!companyId && !!dateStr,
    staleTime: 0,
  });
}

export function useQuadrantJobs(quadrantId) {
  return useQuery({
    queryKey: ['quadrantJobs', quadrantId],
    queryFn: () => firestore.getQuadrantJobs(quadrantId),
    enabled: !!quadrantId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateQuadrant() {
  const queryClient = useQueryClient();
  const { userData } = useAuth();
  const companyId = userData?.companyId;
  return useMutation({
    mutationFn: (date) => firestore.createQuadrant(companyId, date),
    onSuccess: async (_, date) => {
      const dateStr = toYYYYMMDD(date);
      if (dateStr && companyId) {
        queryClient.invalidateQueries({ queryKey: ['quadrants', companyId, dateStr] });
        await new Promise((r) => setTimeout(r, 600));
        await queryClient.refetchQueries({ queryKey: ['quadrants', companyId, dateStr] });
      }
    },
  });
}

export function useAddQuadrantJob() {
  const queryClient = useQueryClient();
  const { userData } = useAuth();
  const companyId = userData?.companyId;
  return useMutation({
    mutationFn: ({ quadrantId, payload }) => firestore.addQuadrantJob(quadrantId, payload),
    onSuccess: (_, { quadrantId }) => {
      queryClient.invalidateQueries({ queryKey: ['quadrantJobs', quadrantId] });
      queryClient.invalidateQueries({ queryKey: ['jobs', companyId] });
    },
  });
}

export function useUpdateQuadrantJobsOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ quadrantId, updates }) =>
      firestore.updateQuadrantJobsOrder(quadrantId, updates),
    onSuccess: (_, { quadrantId }) => {
      queryClient.invalidateQueries({ queryKey: ['quadrantJobs', quadrantId] });
      queryClient.refetchQueries({ queryKey: ['quadrantJobs', quadrantId] });
    },
  });
}

export function useOptimizeRoute() {
  const queryClient = useQueryClient();
  const updateOrder = useUpdateQuadrantJobsOrder();
  return useMutation({
    mutationFn: async ({ quadrantId, workerId }) => {
      const { orderedJobIds } = await firestore.optimizeRoute(quadrantId, workerId);
      if (!orderedJobIds?.length) return { orderedJobIds: [] };
      const updates = orderedJobIds.map((jobId, i) => ({ jobId, routeOrder: i }));
      await firestore.updateQuadrantJobsOrder(quadrantId, updates);
      return { orderedJobIds };
    },
    onSuccess: (_, { quadrantId }) => {
      queryClient.invalidateQueries({ queryKey: ['quadrantJobs', quadrantId] });
      queryClient.refetchQueries({ queryKey: ['quadrantJobs', quadrantId] });
    },
  });
}

/**
 * Propone asignación óptima de casas a trabajadores con franjas horarias.
 * No crea el cuadrante; solo devuelve { assignments } para que la UI lo muestre y luego llame a createQuadrant + addQuadrantJob.
 */
export function useProposeQuadrantAssignment() {
  return useMutation({
    mutationFn: (payload) => firestore.proposeQuadrantAssignment(payload),
  });
}

export function useDeleteQuadrant() {
  const queryClient = useQueryClient();
  const { userData } = useAuth();
  const companyId = userData?.companyId;
  return useMutation({
    mutationFn: (quadrantId) => firestore.deleteQuadrant(quadrantId),
    onSuccess: (_, quadrantId) => {
      queryClient.removeQueries({ queryKey: ['quadrantJobs', quadrantId] });
      if (companyId) {
        queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === 'quadrants' && query.queryKey[1] === companyId });
        queryClient.invalidateQueries({ queryKey: ['jobs', companyId] });
      }
    },
  });
}

export function useDeleteQuadrantJob() {
  const queryClient = useQueryClient();
  const { userData } = useAuth();
  const companyId = userData?.companyId;
  return useMutation({
    mutationFn: ({ quadrantId, jobId, job }) =>
      firestore.deleteQuadrantJob(quadrantId, jobId, job),
    onSuccess: (_, { quadrantId }) => {
      queryClient.invalidateQueries({ queryKey: ['quadrantJobs', quadrantId] });
      if (companyId) queryClient.invalidateQueries({ queryKey: ['jobs', companyId] });
    },
  });
}

export function useCreateHouse() {
  const queryClient = useQueryClient();
  const { userData } = useAuth();
  return useMutation({
    mutationFn: (data) =>
      firestore.createHouse({ ...data, companyId: userData?.companyId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['properties'] }),
  });
}

export function useUploadHouseImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ houseId, file }) => firestore.uploadHouseImage(houseId, file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['properties'] }),
  });
}

export function useUpdateHouse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => firestore.updateHouse(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['properties'] }),
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['workers-firestore'] });
    },
  });
}

export function useUploadUserImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, file }) => firestore.uploadUserImage(userId, file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({ userId, newPassword }) =>
      firestore.adminChangePassword(userId, newPassword),
  });
}

// ——— Catálogo de Checks ———
export function useChecksCatalog() {
  const { userData } = useAuth();
  const companyId = userData?.companyId;
  return useQuery({
    queryKey: ['checkTemplates', companyId],
    queryFn: () => firestore.getChecksCatalog(companyId),
    enabled: !!companyId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateCheckCatalogItem() {
  const queryClient = useQueryClient();
  const { userData } = useAuth();
  return useMutation({
    mutationFn: (data) =>
      firestore.createCheckCatalogItem({ ...data, companyId: userData?.companyId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['checkTemplates'] }),
  });
}

export function useUpdateCheckCatalogItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => firestore.updateCheckCatalogItem(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['checkTemplates'] }),
  });
}

export function useDeleteCheckCatalogItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => firestore.deleteCheckCatalogItem(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['checkTemplates'] }),
  });
}

// ——— Catálogo de Tareas ———
export function useTasksCatalog() {
  const { userData } = useAuth();
  const companyId = userData?.companyId;
  return useQuery({
    queryKey: ['tasksCatalog', companyId],
    queryFn: () => firestore.getTasksCatalog(companyId),
    enabled: !!companyId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateTaskCatalogItem() {
  const queryClient = useQueryClient();
  const { userData } = useAuth();
  return useMutation({
    mutationFn: (data) =>
      firestore.createTaskCatalogItem({ ...data, companyId: userData?.companyId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasksCatalog'] }),
  });
}

export function useUpdateTaskCatalogItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => firestore.updateTaskCatalogItem(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasksCatalog'] }),
  });
}

export function useDeleteTaskCatalogItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => firestore.deleteTaskCatalogItem(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasksCatalog'] }),
  });
}

export function useEntrances(entranceIds = []) {
  return useQuery({
    queryKey: ['timeEntries', entranceIds],
    queryFn: () => firestore.getEntrancesByIds(entranceIds),
    enabled: entranceIds.length > 0,
    staleTime: 1000 * 60 * 10,
  });
}

export function useSettings() {
  const { userData } = useAuth();
  const companyId = userData?.companyId;
  return useQuery({
    queryKey: ['settings', companyId],
    queryFn: () => firestore.getSettings(companyId),
    enabled: !!companyId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useSetSettings() {
  const queryClient = useQueryClient();
  const { userData } = useAuth();
  const companyId = userData?.companyId;
  return useMutation({
    mutationFn: (data) => firestore.setSettings(companyId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings', companyId] }),
  });
}
