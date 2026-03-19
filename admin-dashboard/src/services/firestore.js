import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  addDoc,
  updateDoc,
  setDoc,
  deleteDoc,
  deleteField,
  writeBatch,
  increment,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/config/firebase';

const COLLECTIONS = {
  HOUSES: 'houses',
  INCIDENCES: 'incidences',
  CHECKLISTS: 'checklists',
  JOBS: 'jobs',
  QUADRANTS: 'quadrants',
  USERS: 'users',
  RECYCLE_BIN: 'recycleBin',
  AUDIT_LOG: 'auditLog',
  CHECKS: 'checks',
  CHECK_TEMPLATES: 'checkTemplates',
  TASKS_CATALOG: 'tasks',
  OWNER_DOCUMENTS: 'ownerDocuments',
  INSPECTION_REPORTS: 'inspectionReports',
  ENTRANCES: 'entrances',
};

// ——— Casas ———
export async function getHouses() {
  const colRef = collection(db, COLLECTIONS.HOUSES);
  const q = query(colRef, orderBy('houseName'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getHouse(id) {
  const docRef = doc(db, COLLECTIONS.HOUSES, id);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function createHouse(data) {
  const colRef = collection(db, COLLECTIONS.HOUSES);
  const docRef = await addDoc(colRef, { ...data, createdAt: new Date() });
  return docRef.id;
}

export async function updateHouse(id, data) {
  const docRef = doc(db, COLLECTIONS.HOUSES, id);
  const payload = { ...data, updatedAt: new Date() };
  if (payload.location === null) payload.location = deleteField();
  await updateDoc(docRef, payload);
}

// ——— Incidencias ———
const DEFAULT_SLA_INCIDENCE_RESPONSE_H = 24;
const DEFAULT_SLA_INCIDENCE_RESOLUTION_H = 72;

export async function getIncidences(filters = {}) {
  const colRef = collection(db, COLLECTIONS.INCIDENCES);
  const constraints = [];
  if (filters.done !== undefined) {
    constraints.push(where('done', '==', filters.done));
  }
  if (filters.workersId) {
    constraints.push(where('workersId', 'array-contains', filters.workersId));
  }
  const q = constraints.length ? query(colRef, ...constraints) : colRef;
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getIncidence(id) {
  const docRef = doc(db, COLLECTIONS.INCIDENCES, id);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function createIncidence(payload) {
  if (!payload?.title || !payload?.houseId) throw new Error('Faltan título o propiedad');
  const now = new Date();
  const responseH = payload.slaResponseHours ?? DEFAULT_SLA_INCIDENCE_RESPONSE_H;
  const resolutionH = payload.slaResolutionHours ?? DEFAULT_SLA_INCIDENCE_RESOLUTION_H;
  const responseDueAt = new Date(now.getTime() + responseH * 60 * 60 * 1000);
  const resolutionDueAt = new Date(now.getTime() + resolutionH * 60 * 60 * 1000);
  const colRef = collection(db, COLLECTIONS.INCIDENCES);
  const docRef = await addDoc(colRef, {
    title: payload.title.trim(),
    incidence: (payload.incidence || payload.description || '').trim() || null,
    houseId: payload.houseId,
    house: payload.house || null,
    state: 'iniciada',
    date: now,
    done: false,
    workersId: payload.workersId || [],
    photos: payload.photos || [],
    responseDueAt,
    resolutionDueAt,
    createdBy: payload.createdBy || null,
    stateUpdatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateIncidence(id, data) {
  if (!id) throw new Error('Falta id de incidencia');
  const docRef = doc(db, COLLECTIONS.INCIDENCES, id);
  const hasStateOrDone = 'state' in data || 'done' in data;
  const payload = hasStateOrDone
    ? { ...data, stateUpdatedAt: serverTimestamp() }
    : data;
  await updateDoc(docRef, payload);
}

export async function deleteIncidence(id) {
  if (!id) throw new Error('Falta id de incidencia');
  const docRef = doc(db, COLLECTIONS.INCIDENCES, id);
  await deleteDoc(docRef);
}

// ——— Reportes de inspección (voz + fotos desde Telegram) ———
export async function getInspectionReports() {
  const colRef = collection(db, COLLECTIONS.INSPECTION_REPORTS);
  const q = query(colRef, orderBy('createdAt', 'desc'), limit(100));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getInspectionReport(id) {
  if (!id) return null;
  const docRef = doc(db, COLLECTIONS.INSPECTION_REPORTS, id);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function updateInspectionReport(id, data) {
  if (!id) throw new Error('Falta id de reporte');
  const docRef = doc(db, COLLECTIONS.INSPECTION_REPORTS, id);
  const payload = { ...data, updatedAt: new Date() };
  await updateDoc(docRef, payload);
}

export async function deleteInspectionReport(id) {
  if (!id) throw new Error('Falta id de reporte');
  const docRef = doc(db, COLLECTIONS.INSPECTION_REPORTS, id);
  await deleteDoc(docRef);
}

// ——— Checklists ———
const PAGE_SIZE = 20;

export async function getChecklistsPage({ filters = {}, pageParam = null } = {}) {
  const colRef = collection(db, COLLECTIONS.CHECKLISTS);
  const constraints = [];

  if (filters.finished !== undefined) {
    constraints.push(where('finished', '==', filters.finished));
  }
  if (filters.houseId) {
    constraints.push(where('houseId', '==', filters.houseId));
  }

  constraints.push(orderBy('date', 'desc'));

  if (filters.dateFrom) {
    constraints.push(where('date', '<=', filters.dateFrom));
  }
  if (filters.dateTo) {
    constraints.push(where('date', '>=', filters.dateTo));
  }

  if (pageParam) {
    constraints.push(startAfter(pageParam));
  }

  constraints.push(limit(PAGE_SIZE));

  try {
    const q = query(colRef, ...constraints);
    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    const lastDoc = snapshot.docs[snapshot.docs.length - 1] || null;
    return { docs, lastDoc, hasMore: snapshot.docs.length === PAGE_SIZE };
  } catch (e) {
    console.error('getChecklistsPage', e);
    return { docs: [], lastDoc: null, hasMore: false };
  }
}

export async function getChecklists(filters = {}) {
  const colRef = collection(db, COLLECTIONS.CHECKLISTS);
  const constraints = [];
  if (filters.finished !== undefined) {
    constraints.push(where('finished', '==', filters.finished));
  }
  const houseId = filters.houseId != null && filters.houseId !== '' ? String(filters.houseId) : null;
  if (houseId) {
    constraints.push(where('houseId', '==', houseId));
  }
  constraints.push(orderBy('date', 'desc'));
  if (filters.limitCount) {
    constraints.push(limit(Math.min(filters.limitCount, 100)));
  }
  try {
    const q = query(colRef, ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.error('getChecklists', e);
    throw e;
  }
}

export async function getChecklist(id) {
  const docRef = doc(db, COLLECTIONS.CHECKLISTS, id);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function getChecksByChecklistId(checklistId) {
  const checksRef = collection(
    doc(db, COLLECTIONS.CHECKLISTS, checklistId),
    'checks'
  );
  const snapshot = await getDocs(checksRef);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function updateCheck(checklistId, checkId, check, done, worker) {
  const checkRef = doc(db, COLLECTIONS.CHECKLISTS, checklistId, 'checks', checkId);
  const checklistRef = doc(db, COLLECTIONS.CHECKLISTS, checklistId);
  const now = new Date();
  await updateDoc(checkRef, {
    ...check,
    done,
    date: done ? now : null,
    worker: worker || null
  });
  await updateDoc(checklistRef, {
    done: increment(done ? 1 : -1)
  });
}

export async function createChecklist(payload) {
  if (!payload?.houseId || !payload?.house) throw new Error('Faltan houseId o house');
  const { houseId, house, date, observations, workers, workersId, selectedTemplates } = payload;
  const templates = selectedTemplates && selectedTemplates.length > 0 ? selectedTemplates : [];

  const colRef = collection(db, COLLECTIONS.CHECKLISTS);
  const checklistData = {
    houseId,
    house: Array.isArray(house) ? house : [house],
    date: date instanceof Date ? date : new Date(date),
    observations: observations || '',
    workers: workers || null,
    workersId: workersId || null,
    total: templates.length,
    finished: false,
    done: 0,
    send: false,
  };
  const docRef = await addDoc(colRef, checklistData);
  const newId = docRef.id;

  const checksRef = collection(doc(db, COLLECTIONS.CHECKLISTS, newId), 'checks');
  for (const t of templates) {
    await addDoc(checksRef, {
      originalId: t.id,
      locale: {
        es: t.nameEs || t.name || '',
        en: t.nameEn || '',
      },
      done: false,
      worker: null,
      date: null,
      numberOfPhotos: 0,
    });
  }

  return newId;
}

// ——— Cuadrantes (Quadrants) ———
function toDateString(date) {
  if (!date) return null;
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export async function getQuadrantsByDate(date) {
  if (!date) return [];
  const dateStr = typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : toDateString(date);
  if (!dateStr) return [];
  const colRef = collection(db, COLLECTIONS.QUADRANTS);
  const q = query(colRef, where('date', '==', dateStr));
  let snapshot = await getDocs(q);
  if (snapshot.empty) {
    const d = new Date(dateStr + 'T12:00:00');
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
    const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
    const qLegacy = query(
      colRef,
      where('date', '>=', start),
      where('date', '<=', end),
      orderBy('date', 'asc')
    );
    snapshot = await getDocs(qLegacy);
  }
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getQuadrantJobs(quadrantId) {
  if (!quadrantId) return [];
  const quadrantRef = doc(db, COLLECTIONS.QUADRANTS, quadrantId);
  const jobsRef = collection(quadrantRef, 'jobs');
  const snapshot = await getDocs(jobsRef);
  const jobs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  const toNum = (v) => (v != null && typeof v === 'number' ? v : 0);
  const toTime = (v) => {
    if (!v) return 0;
    if (v && typeof v.toDate === 'function') return v.toDate().getTime();
    if (typeof v === 'object' && v._seconds != null) return v._seconds * 1000;
    return 0;
  };
  jobs.sort((a, b) => {
    const orderA = toNum(a.routeOrder);
    const orderB = toNum(b.routeOrder);
    if (orderA !== orderB) return orderA - orderB;
    return toTime(a.startHour) - toTime(b.startHour);
  });
  return jobs;
}

export async function createQuadrant(date) {
  if (!date) throw new Error('Falta fecha');
  const dateStr = typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : toDateString(date);
  if (!dateStr) throw new Error('Fecha no válida');
  const colRef = collection(db, COLLECTIONS.QUADRANTS);
  const docRef = await addDoc(colRef, {
    date: dateStr,
  });
  return { id: docRef.id };
}

export async function addQuadrantJob(quadrantId, payload) {
  if (!quadrantId || !payload?.houseId || !payload?.worker?.id) throw new Error('Faltan quadrantId, casa o trabajador');
  const { houseId, worker, startHour, endHour, date: jobDate } = payload;
  const day = jobDate ? new Date(jobDate) : new Date();
  day.setHours(12, 0, 0, 0);
  const start = new Date(day);
  start.setHours(startHour.getHours(), startHour.getMinutes(), 0, 0);
  const end = new Date(day);
  end.setHours(endHour.getHours(), endHour.getMinutes(), 0, 0);
  const jobsRef = collection(doc(db, COLLECTIONS.QUADRANTS, quadrantId), 'jobs');
  const existing = await getDocs(jobsRef);
  const routeOrder = existing.size;
  const docRef = await addDoc(jobsRef, {
    quadrantId,
    houseId,
    worker: { id: worker.id, firstName: worker.firstName, lastName: worker.lastName, token: worker.token },
    startHour: Timestamp.fromDate(start),
    endHour: Timestamp.fromDate(end),
    date: Timestamp.fromDate(day),
    routeOrder,
  });
  return { id: docRef.id };
}

export async function updateQuadrantJobsOrder(quadrantId, updates) {
  if (!quadrantId || !updates?.length) return;
  const batch = writeBatch(db);
  for (const { jobId, routeOrder } of updates) {
    const jobRef = doc(db, COLLECTIONS.QUADRANTS, quadrantId, 'jobs', jobId);
    batch.update(jobRef, { routeOrder });
  }
  await batch.commit();
}

export async function deleteQuadrantJob(quadrantId, jobId, job) {
  if (!quadrantId || !jobId) return;
  const quadrantJobRef = doc(db, COLLECTIONS.QUADRANTS, quadrantId, 'jobs', jobId);
  await deleteDoc(quadrantJobRef);
  const workerId = job?.worker?.id || job?.workersId?.[0];
  if (job?.houseId && workerId) {
    const jobsColRef = collection(db, COLLECTIONS.JOBS);
    const q = query(
      jobsColRef,
      where('quadrantId', '==', quadrantId),
      where('houseId', '==', job.houseId),
      limit(1)
    );
    const snap = await getDocs(q);
    const toDelete = snap.docs.find((d) => (d.data().workersId || []).includes(workerId));
    if (toDelete) await deleteDoc(toDelete.ref);
  }
}

export async function deleteQuadrant(quadrantId) {
  if (!quadrantId) return;
  const quadrantRef = doc(db, COLLECTIONS.QUADRANTS, quadrantId);
  let batchError;
  try {
    const jobsRef = collection(quadrantRef, 'jobs');
    const quadrantJobsSnap = await getDocs(jobsRef);
    if (quadrantJobsSnap.docs.length > 0) {
      const batch = writeBatch(db);
      for (const d of quadrantJobsSnap.docs) batch.delete(d.ref);
      await batch.commit();
    }
    const mainJobsRef = collection(db, COLLECTIONS.JOBS);
    const mainQ = query(mainJobsRef, where('quadrantId', '==', quadrantId));
    const mainSnap = await getDocs(mainQ);
    if (mainSnap.docs.length > 0) {
      const batch2 = writeBatch(db);
      for (const d of mainSnap.docs) batch2.delete(d.ref);
      await batch2.commit();
    }
  } catch (err) {
    batchError = err;
  }
  await deleteDoc(quadrantRef);
  if (batchError) throw batchError;
}

export async function optimizeRoute(quadrantId, workerId) {
  const { httpsCallable } = await import('firebase/functions');
  const { functions } = await import('@/config/firebase');
  const fn = httpsCallable(functions, 'optimizeRoute');
  const result = await fn({ quadrantId, workerId: workerId || undefined });
  return result.data;
}

export async function proposeQuadrantAssignment(payload) {
  const { httpsCallable } = await import('firebase/functions');
  const { functions } = await import('@/config/firebase');
  const fn = httpsCallable(functions, 'proposeQuadrantAssignment');
  const result = await fn(payload);
  return result.data;
}

// ——— Trabajos (Jobs) ———
const DEFAULT_SLA_JOB_RESOLUTION_H = 120;

export async function getJobs() {
  const colRef = collection(db, COLLECTIONS.JOBS);
  const q = query(colRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getJob(id) {
  const docRef = doc(db, COLLECTIONS.JOBS, id);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function createJob(payload) {
  if (!payload?.houseId) throw new Error('Falta propiedad');
  const colRef = collection(db, COLLECTIONS.JOBS);
  const now = new Date();
  const resolutionH = payload.slaResolutionHours ?? DEFAULT_SLA_JOB_RESOLUTION_H;
  const resolutionDueAt = new Date(now.getTime() + resolutionH * 60 * 60 * 1000);
  const docRef = await addDoc(colRef, {
    title: (payload.title || payload.jobName || 'Sin título').trim(),
    jobName: (payload.title || payload.jobName || 'Sin título').trim(),
    observations: (payload.observations || '').trim() || null,
    houseId: payload.houseId,
    house: payload.house || null,
    workers: payload.workers || null,
    workersId: payload.workersId || [],
    date: payload.date ? new Date(payload.date) : now,
    createdAt: now,
    status: 'pending',
    done: false,
    resolutionDueAt,
    createdBy: payload.createdBy || null,
  });
  return docRef.id;
}

export async function updateJob(id, data) {
  if (!id) throw new Error('Falta id de trabajo');
  const docRef = doc(db, COLLECTIONS.JOBS, id);
  await updateDoc(docRef, { ...data, updatedAt: new Date() });
}

export async function deleteJob(id) {
  if (!id) throw new Error('Falta id de trabajo');
  const docRef = doc(db, COLLECTIONS.JOBS, id);
  await deleteDoc(docRef);
}

// ——— Mensajes y actividad (timeline) ———
const TIMELINE_COLLECTIONS = [COLLECTIONS.INCIDENCES, COLLECTIONS.JOBS, COLLECTIONS.CHECKLISTS];

export async function getMessages(collectionName, docId) {
  if (!TIMELINE_COLLECTIONS.includes(collectionName) || !docId) return [];
  const colRef = collection(doc(db, collectionName, docId), 'messages');
  const q = query(colRef, orderBy('createdAt', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function addMessage(collectionName, docId, payload) {
  if (!collectionName || !docId || !payload?.text?.trim()) throw new Error('Faltan collectionName, docId o text');
  const colRef = collection(doc(db, collectionName, docId), 'messages');
  const docRef = await addDoc(colRef, {
    text: payload.text.trim(),
    user: payload.user || null,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getActivity(collectionName, docId) {
  if (!TIMELINE_COLLECTIONS.includes(collectionName) || !docId) return [];
  const colRef = collection(doc(db, collectionName, docId), 'activity');
  const q = query(colRef, orderBy('createdAt', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function addActivity(collectionName, docId, payload) {
  if (!collectionName || !docId || !payload?.type) throw new Error('Faltan collectionName, docId o type');
  const colRef = collection(doc(db, collectionName, docId), 'activity');
  const docRef = await addDoc(colRef, {
    ...payload,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

// ——— Papelera ———
export async function getRecycleBinItems() {
  const colRef = collection(db, COLLECTIONS.RECYCLE_BIN);
  const snapshot = await getDocs(colRef);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ——— Auditoría ———
export async function getAuditLog(opts = {}) {
  const { resourceType, action, limitCount = 100 } = opts;
  const colRef = collection(db, COLLECTIONS.AUDIT_LOG);
  const q = query(
    colRef,
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  );
  const snapshot = await getDocs(q);
  let items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  if (resourceType) {
    items = items.filter((i) => i.resourceType === resourceType);
  }
  if (action) {
    items = items.filter((i) => i.action === action);
  }
  return items;
}

// ——— Settings ———
const SETTINGS_COLLECTION = 'settings';
const SETTINGS_DOC_ID = 'default';

export async function getSettings() {
  const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
  const snap = await getDoc(docRef);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function setSettings(data) {
  const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
  await setDoc(docRef, { ...data, updatedAt: new Date() }, { merge: true });
}

// ——— Usuarios (para listar y perfiles) ———
export async function getUsers() {
  const colRef = collection(db, COLLECTIONS.USERS);
  const snapshot = await getDocs(colRef);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getUser(id) {
  const docRef = doc(db, COLLECTIONS.USERS, id);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function updateUser(id, data) {
  const docRef = doc(db, COLLECTIONS.USERS, id);
  const payload = { ...data, updatedAt: new Date() };
  if (payload.homeLocation === null) payload.homeLocation = deleteField();
  if (payload.homeAddress === null) payload.homeAddress = deleteField();
  if (payload.telegramId === null || payload.telegramId === '') payload.telegramId = deleteField();
  await updateDoc(docRef, payload);
}

// ——— Trabajadores (subset de usuarios) ———
export async function getWorkersFromFirestore() {
  const colRef = collection(db, COLLECTIONS.USERS);
  const q = query(colRef, where('role', '==', 'worker'));
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (a.firstName || '').localeCompare(b.firstName || ''));
}

// ——— Propietarios (subset de usuarios) ———
export async function getOwners() {
  const colRef = collection(db, COLLECTIONS.USERS);
  const q = query(colRef, where('role', '==', 'owner'));
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (a.firstName || '').localeCompare(b.firstName || ''));
}

// ——— Upload de imágenes a Firebase Storage ———
export async function uploadHouseImage(houseId, file) {
  const storageRef = ref(storage, `houses/${houseId}/houseImage/${file.name}`);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);

  const houseRef = doc(db, COLLECTIONS.HOUSES, houseId);
  await updateDoc(houseRef, {
    'houseImage.original': url,
    'houseImage.small': url,
  });
  return url;
}

export async function uploadUserImage(userId, file) {
  const storageRef = ref(storage, `users/${userId}/profileImage/${file.name}`);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);

  const userRef = doc(db, COLLECTIONS.USERS, userId);
  await updateDoc(userRef, {
    'profileImage.original': url,
    'profileImage.small': url,
  });
  return url;
}

// ——— Documentos por propietario (facturación, contratos, informes) ———
export async function getOwnerDocuments(ownerId) {
  if (!ownerId) return [];
  const colRef = collection(db, COLLECTIONS.OWNER_DOCUMENTS);
  const q = query(
    colRef,
    where('ownerId', '==', ownerId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function addOwnerDocument(data) {
  const colRef = collection(db, COLLECTIONS.OWNER_DOCUMENTS);
  const docRef = await addDoc(colRef, { ...data, createdAt: new Date() });
  return docRef.id;
}

export async function deleteOwnerDocument(id) {
  const docRef = doc(db, COLLECTIONS.OWNER_DOCUMENTS, id);
  await deleteDoc(docRef);
}

export async function uploadOwnerDocument(ownerId, file, { name, type = 'other' }) {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `owner-documents/${ownerId}/${Date.now()}_${safeName}`;
  const storageRef = ref(storage, storagePath);
  await uploadBytes(storageRef, file);
  const fileUrl = await getDownloadURL(storageRef);

  const docId = await addOwnerDocument({
    ownerId,
    name: name || file.name,
    type,
    fileUrl,
    fileName: file.name,
  });
  return docId;
}

// ——— Eliminar checklist (documento + subcollection checks) via Cloud Function ———
export async function deleteChecklist(checklistId) {
  const { httpsCallable } = await import('firebase/functions');
  const { functions } = await import('@/config/firebase');
  const recursiveDeleteFn = httpsCallable(functions, 'recursiveDelete');
  await recursiveDeleteFn({
    path: `checklists/${checklistId}`,
    docId: checklistId,
    collection: 'checklists',
  });
}

// ——— Enviar/reenviar email de checklist al propietario via Cloud Function ———
export async function sendChecklistEmail(checklistId) {
  const { httpsCallable } = await import('firebase/functions');
  const { functions } = await import('@/config/firebase');
  const notifyOwner = httpsCallable(functions, 'notifyOwner');
  const result = await notifyOwner({ checkId: checklistId });
  return result.data;
}

// ——— Generar plantilla de email a propietarios con IA ———
export async function generateEmailToOwnerTemplate() {
  const { httpsCallable } = await import('firebase/functions');
  const { functions } = await import('@/config/firebase');
  const fn = httpsCallable(functions, 'generateEmailToOwnerTemplate');
  const result = await fn({});
  return result.data;
}

// ——— Crear usuario via Cloud Function (también crea Auth account) ———
export async function createUserViaFunction(userData) {
  const { httpsCallable } = await import('firebase/functions');
  const { functions } = await import('@/config/firebase');
  const createNewUser = httpsCallable(functions, 'createNewUser');
  const result = await createNewUser({
    name: userData.firstName,
    surname: userData.lastName,
    email: userData.email,
    phone: userData.phone,
    role: userData.role,
    language: userData.language || 'es',
    gender: userData.gender || 'male',
  });
  return result.data;
}

// ——— Admin: cambiar contraseña ———
export async function adminChangePassword(userId, newPassword) {
  const { httpsCallable } = await import('firebase/functions');
  const { functions } = await import('@/config/firebase');
  const fn = httpsCallable(functions, 'adminChangePassword');
  const result = await fn({ userId, newPassword });
  return result.data;
}

// ——— Catálogo de Checks ———
/** Normaliza un item del catálogo al formato esperado { id, nameEs, nameEn, name }. */
function normalizeCatalogItem(d) {
  const data = d.data();
  const nameEs = data.nameEs || data.locale?.es || data.locale?.title || data.name || '';
  const nameEn = data.nameEn || data.locale?.en || '';
  return { id: d.id, nameEs, nameEn, name: data.name || data.locale?.title || nameEs, ...data };
}

export async function getChecksCatalog() {
  const checksRef = collection(db, COLLECTIONS.CHECKS);
  const snapshot = await getDocs(checksRef);
  return snapshot.docs
    .map((d) => normalizeCatalogItem(d))
    .sort((a, b) => (a.name || a.nameEs || '').localeCompare(b.name || b.nameEs || ''));
}

export async function createCheckCatalogItem(data) {
  const colRef = collection(db, COLLECTIONS.CHECKS);
  const docRef = await addDoc(colRef, {
    ...data,
    locale: data.locale || { es: data.nameEs || data.name || '', en: data.nameEn || '' },
    createdAt: new Date(),
    updatedAt: new Date()
  });
  return docRef.id;
}

export async function updateCheckCatalogItem(id, data) {
  const docRef = doc(db, COLLECTIONS.CHECKS, id);
  const snap = await getDoc(docRef);
  const current = snap.data() || {};
  const locale = { ...(current.locale || {}) };
  if (data.nameEs != null) locale.es = data.nameEs;
  if (data.nameEn != null) locale.en = data.nameEn;
  await updateDoc(docRef, { ...data, locale, updatedAt: new Date() });
}

export async function deleteCheckCatalogItem(id) {
  const docRef = doc(db, COLLECTIONS.CHECKS, id);
  await deleteDoc(docRef);
}

// ——— Catálogo de Tareas ———
export async function getTasksCatalog() {
  const colRef = collection(db, COLLECTIONS.TASKS_CATALOG);
  const snapshot = await getDocs(colRef);
  return snapshot.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (a.name || a.nameEs || '').localeCompare(b.name || b.nameEs || ''));
}

export async function createTaskCatalogItem(data) {
  const colRef = collection(db, COLLECTIONS.TASKS_CATALOG);
  const docRef = await addDoc(colRef, { ...data, createdAt: new Date(), updatedAt: new Date() });
  return docRef.id;
}

export async function updateTaskCatalogItem(id, data) {
  const docRef = doc(db, COLLECTIONS.TASKS_CATALOG, id);
  await updateDoc(docRef, { ...data, updatedAt: new Date() });
}

export async function deleteTaskCatalogItem(id) {
  const docRef = doc(db, COLLECTIONS.TASKS_CATALOG, id);
  await deleteDoc(docRef);
}

// ——— Entrances (fotos de jornadas) ———
export async function getEntrancesByIds(entranceIds = []) {
  if (!entranceIds.length) return [];
  const results = await Promise.all(
    entranceIds.map(async (id) => {
      const snap = await getDoc(doc(db, COLLECTIONS.ENTRANCES, id));
      if (!snap.exists()) return null;
      return { id: snap.id, ...snap.data() };
    })
  );
  return results.filter(Boolean);
}
