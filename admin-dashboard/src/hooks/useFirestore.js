import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as firestore from '@/services/firestore';
import { useAuth } from '@/hooks/useAuth.jsx';

export function useUpdateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => firestore.setSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}

// ——— Houses ———

export function useHouses() {
  return useQuery({
    queryKey: ['properties'],
    queryFn: () => firestore.getHouses(),
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

export function useCreateHouse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => firestore.createHouse(data),
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

export function useUploadHouseImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ houseId, file }) => firestore.uploadHouseImage(houseId, file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['properties'] }),
  });
}

// ——— Incidences ———

export function useIncidences(filters = {}) {
  return useQuery({
    queryKey: ['incidents', filters],
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

export function useCreateIncidence() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => firestore.createIncidence(payload),
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

// ——— Inspection Reports ———

export function useInspectionReports() {
  return useQuery({
    queryKey: ['inspectionReports'],
    queryFn: () => firestore.getInspectionReports(),
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

// ——— Checklists ———

export function useChecklists(filters = {}) {
  return useQuery({
    queryKey: ['checklists', filters],
    queryFn: () => firestore.getChecklists({ ...filters, limitCount: 100 }),
    staleTime: 1000 * 60 * 2,
  });
}

export function useChecklistsPaginated(filters = {}) {
  return useInfiniteQuery({
    queryKey: ['checklists-paginated', filters],
    queryFn: ({ pageParam }) =>
      firestore.getChecklistsPage({ filters, pageParam }),
    initialPageParam: null,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.lastDoc : undefined,
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
  return useMutation({
    mutationFn: (payload) => firestore.createChecklist(payload),
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

// ——— Jobs ———

export function useJobs() {
  return useQuery({
    queryKey: ['jobs'],
    queryFn: () => firestore.getJobs(),
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
  return useMutation({
    mutationFn: (payload) => firestore.createJob(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
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

export function useDeleteJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => firestore.deleteJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}

// ——— Recycle Bin & Audit Log ———

export function useRecycleBin() {
  return useQuery({
    queryKey: ['recycleBin'],
    queryFn: () => firestore.getRecycleBinItems(),
    staleTime: 1000 * 60 * 2,
  });
}

export function useAuditLog(opts = {}) {
  return useQuery({
    queryKey: ['auditLog', opts],
    queryFn: () => firestore.getAuditLog(opts),
    staleTime: 1000 * 60,
  });
}

// ——— Users & Owners & Workers ———

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => firestore.getUsers(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useOwners() {
  return useQuery({
    queryKey: ['owners'],
    queryFn: () => firestore.getOwners(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useOwnerDocuments(ownerId) {
  return useQuery({
    queryKey: ['ownerDocuments', ownerId],
    queryFn: () => firestore.getOwnerDocuments(ownerId),
    enabled: !!ownerId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useUploadOwnerDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ownerId, file, name, type }) =>
      firestore.uploadOwnerDocument(ownerId, file, { name, type }),
    onSuccess: (_, { ownerId }) => {
      queryClient.invalidateQueries({ queryKey: ['ownerDocuments', ownerId] });
    },
  });
}

export function useDeleteOwnerDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => firestore.deleteOwnerDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownerDocuments'] });
    },
  });
}

export function useWorkersFirestore() {
  return useQuery({
    queryKey: ['workers-firestore'],
    queryFn: () => firestore.getWorkersFromFirestore(),
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
  const dateStr = toYYYYMMDD(date);
  return useQuery({
    queryKey: ['quadrants', dateStr],
    queryFn: () => firestore.getQuadrantsByDate(dateStr || date),
    enabled: !!dateStr,
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
  return useMutation({
    mutationFn: (date) => firestore.createQuadrant(date),
    onSuccess: async (_, date) => {
      const dateStr = toYYYYMMDD(date);
      if (dateStr) {
        queryClient.invalidateQueries({ queryKey: ['quadrants', dateStr] });
        await new Promise((r) => setTimeout(r, 600));
        await queryClient.refetchQueries({ queryKey: ['quadrants', dateStr] });
      }
    },
  });
}

export function useAddQuadrantJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ quadrantId, payload }) => firestore.addQuadrantJob(quadrantId, payload),
    onSuccess: (_, { quadrantId }) => {
      queryClient.invalidateQueries({ queryKey: ['quadrantJobs', quadrantId] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
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

export function useProposeQuadrantAssignment() {
  return useMutation({
    mutationFn: (payload) => firestore.proposeQuadrantAssignment(payload),
  });
}

export function useDeleteQuadrant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (quadrantId) => firestore.deleteQuadrant(quadrantId),
    onSuccess: (_, quadrantId) => {
      queryClient.removeQueries({ queryKey: ['quadrantJobs', quadrantId] });
      queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === 'quadrants' });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}

export function useDeleteQuadrantJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ quadrantId, jobId, job }) =>
      firestore.deleteQuadrantJob(quadrantId, jobId, job),
    onSuccess: (_, { quadrantId }) => {
      queryClient.invalidateQueries({ queryKey: ['quadrantJobs', quadrantId] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}

// ——— User Management ———

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
  return useQuery({
    queryKey: ['checkTemplates'],
    queryFn: () => firestore.getChecksCatalog(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateCheckCatalogItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => firestore.createCheckCatalogItem(data),
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
  return useQuery({
    queryKey: ['tasksCatalog'],
    queryFn: () => firestore.getTasksCatalog(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateTaskCatalogItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => firestore.createTaskCatalogItem(data),
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

// ——— Entrances ———

export function useEntrances(entranceIds = []) {
  return useQuery({
    queryKey: ['timeEntries', entranceIds],
    queryFn: () => firestore.getEntrancesByIds(entranceIds),
    enabled: entranceIds.length > 0,
    staleTime: 1000 * 60 * 10,
  });
}

// ——— Settings ———

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => firestore.getSettings(),
    staleTime: 1000 * 60 * 2,
  });
}

export function useSetSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => firestore.setSettings(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings'] }),
  });
}
