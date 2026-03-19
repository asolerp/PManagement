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
  COMPANIES: 'companies',
  PROPERTIES: 'properties',
  INCIDENTS: 'incidents',
  CHECKLISTS: 'checklists',
  JOBS: 'jobs',
  QUADRANTS: 'quadrants',
  USERS: 'users',
  RECYCLE_BIN: 'recycleBin',
  AUDIT_LOG: 'auditLog',
  CHECKS: 'checks',
  TIME_ENTRIES: 'timeEntries',
  CHECK_TEMPLATES: 'checkTemplates',
  TASKS_CATALOG: 'tasks',
  OWNER_DOCUMENTS: 'ownerDocuments',
  INSPECTION_REPORTS: 'inspectionReports',
};

// ——— Empresa ———
export async function getCompany(companyId) {
  if (!companyId) return null;
  const docRef = doc(db, COLLECTIONS.COMPANIES, companyId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function updateCompany(companyId, data) {
  if (!companyId) return;
  const docRef = doc(db, COLLECTIONS.COMPANIES, companyId);
  await updateDoc(docRef, { ...data, updatedAt: new Date() });
}

// ——— Casas ———
export async function getHouses(companyId) {
  if (!companyId) return [];
  const ref = collection(db, COLLECTIONS.PROPERTIES);
  const q = query(
    ref,
    where('companyId', '==', companyId),
    orderBy('houseName')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getHouse(id) {
  const ref = doc(db, COLLECTIONS.PROPERTIES, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function createHouse(data) {
  const ref = collection(db, COLLECTIONS.PROPERTIES);
  const docRef = await addDoc(ref, { ...data, createdAt: new Date() });
  return docRef.id;
}

export async function updateHouse(id, data) {
  const ref = doc(db, COLLECTIONS.PROPERTIES, id);
  const payload = { ...data, updatedAt: new Date() };
  if (payload.location === null) payload.location = deleteField();
  await updateDoc(ref, payload);
}

// ——— Incidencias ———
export async function getIncidences(filters = {}) {
  const { companyId, ...rest } = filters;
  if (!companyId) return [];
  const ref = collection(db, COLLECTIONS.INCIDENTS);
  const constraints = [where('companyId', '==', companyId)];
  if (rest.done !== undefined) {
    constraints.push(where('done', '==', rest.done));
  }
  if (rest.workersId) {
    constraints.push(where('workersId', 'array-contains', rest.workersId));
  }
  const q = query(ref, ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getIncidence(id) {
  const ref = doc(db, COLLECTIONS.INCIDENTS, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

const DEFAULT_SLA_INCIDENCE_RESPONSE_H = 24;
const DEFAULT_SLA_INCIDENCE_RESOLUTION_H = 72;

/**
 * Crea una incidencia con SLAs y auditoría (createdBy).
 * @param {string} companyId
 * @param {object} payload - { title, incidence, houseId, house, createdBy?, slaResponseHours?, slaResolutionHours? }
 */
export async function createIncidence(companyId, payload) {
  if (!companyId || !payload?.title || !payload?.houseId) throw new Error('Faltan companyId, título o propiedad');
  const now = new Date();
  const responseH = payload.slaResponseHours ?? DEFAULT_SLA_INCIDENCE_RESPONSE_H;
  const resolutionH = payload.slaResolutionHours ?? DEFAULT_SLA_INCIDENCE_RESOLUTION_H;
  const responseDueAt = new Date(now.getTime() + responseH * 60 * 60 * 1000);
  const resolutionDueAt = new Date(now.getTime() + resolutionH * 60 * 60 * 1000);
  const ref = collection(db, COLLECTIONS.INCIDENTS);
  const docRef = await addDoc(ref, {
    companyId,
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

/**
 * Actualiza una incidencia. Si se actualiza state o done, añade stateUpdatedAt (serverTimestamp).
 * @param {string} id - id del documento en incidents
 * @param {object} data - campos a actualizar (state, done, workersId, etc.)
 */
export async function updateIncidence(id, data) {
  if (!id) throw new Error('Falta id de incidencia');
  const ref = doc(db, COLLECTIONS.INCIDENTS, id);
  const hasStateOrDone = 'state' in data || 'done' in data;
  const payload = hasStateOrDone
    ? { ...data, stateUpdatedAt: serverTimestamp() }
    : data;
  await updateDoc(ref, payload);
}

/**
 * Elimina una incidencia (solo lectura en reglas para admin de la empresa).
 * @param {string} id - id del documento en incidents
 */
export async function deleteIncidence(id) {
  if (!id) throw new Error('Falta id de incidencia');
  const ref = doc(db, COLLECTIONS.INCIDENTS, id);
  await deleteDoc(ref);
}

// ——— Reportes de inspección (voz + fotos desde Telegram) ———
export async function getInspectionReports(companyId) {
  if (!companyId) return [];
  const ref = collection(db, COLLECTIONS.INSPECTION_REPORTS);
  const q = query(
    ref,
    where('companyId', '==', companyId),
    orderBy('createdAt', 'desc'),
    limit(100)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getInspectionReport(id) {
  if (!id) return null;
  const ref = doc(db, COLLECTIONS.INSPECTION_REPORTS, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

/**
 * Actualiza un reporte de inspección. Campos opcionales: propertyName, propertyId, summary, issues, photoUrls.
 * @param {string} id
 * @param {object} data
 */
export async function updateInspectionReport(id, data) {
  if (!id) throw new Error('Falta id de reporte');
  const ref = doc(db, COLLECTIONS.INSPECTION_REPORTS, id);
  const payload = { ...data, updatedAt: new Date() };
  await updateDoc(ref, payload);
}

/**
 * Elimina un reporte de inspección.
 * @param {string} id
 */
export async function deleteInspectionReport(id) {
  if (!id) throw new Error('Falta id de reporte');
  const ref = doc(db, COLLECTIONS.INSPECTION_REPORTS, id);
  await deleteDoc(ref);
}

// ——— Checklists ———
const PAGE_SIZE = 20;

export async function getChecklistsPage({ filters = {}, pageParam = null } = {}) {
  const { companyId, ...rest } = filters;
  if (!companyId) {
    return { docs: [], lastDoc: null, hasMore: false };
  }
  const colRef = collection(db, COLLECTIONS.CHECKLISTS);
  const constraints = [where('companyId', '==', companyId)];

  if (rest.finished !== undefined) {
    constraints.push(where('finished', '==', rest.finished));
  }
  if (rest.houseId) {
    constraints.push(where('houseId', '==', rest.houseId));
  }

  constraints.push(orderBy('date', 'desc'));

  if (rest.dateFrom) {
    constraints.push(where('date', '<=', rest.dateFrom));
  }
  if (rest.dateTo) {
    constraints.push(where('date', '>=', rest.dateTo));
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
  const { companyId, ...rest } = filters;
  if (!companyId) return [];
  const colRef = collection(db, COLLECTIONS.CHECKLISTS);
  const constraints = [where('companyId', '==', companyId)];
  if (rest.finished !== undefined) {
    constraints.push(where('finished', '==', rest.finished));
  }
  const houseId = rest.houseId != null && rest.houseId !== '' ? String(rest.houseId) : null;
  if (houseId) {
    constraints.push(where('houseId', '==', houseId));
  }
  constraints.push(orderBy('date', 'desc'));
  if (rest.limitCount) {
    constraints.push(limit(Math.min(rest.limitCount, 100)));
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
  const ref = doc(db, COLLECTIONS.CHECKLISTS, id);
  const snap = await getDoc(ref);
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

/**
 * Actualiza el estado done de un punto de revisión y el contador del checklist.
 * @param {string} checklistId
 * @param {string} checkId
 * @param {object} check - documento actual del check (todos los campos)
 * @param {boolean} done - nuevo estado
 * @param {object|null} worker - usuario que marca (admin/trabajador) o null si se desmarca
 */
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

/**
 * Crea una nueva revisión (checklist) y sus puntos (checks) a partir del catálogo.
 * @param {string} companyId
 * @param {object} payload - { houseId, house, date, observations?, workers?, workersId?, selectedTemplates }
 * @param {object[]} payload.selectedTemplates - items del catálogo con { id, nameEs, nameEn, name }
 * @returns {Promise<string>} id del checklist creado
 */
export async function createChecklist(companyId, payload) {
  if (!companyId || !payload?.houseId || !payload?.house) throw new Error('Faltan houseId o house');
  const { houseId, house, date, observations, workers, workersId, selectedTemplates } = payload;
  const templates = selectedTemplates && selectedTemplates.length > 0 ? selectedTemplates : [];

  const checklistRef = collection(db, COLLECTIONS.CHECKLISTS);
  const checklistData = {
    companyId,
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
  const docRef = await addDoc(checklistRef, checklistData);
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
/** Normaliza fecha a string yyyy-MM-dd para evitar timezone. */
function toDateString(date) {
  if (!date) return null;
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Obtiene cuadrantes de una empresa para un día.
 * Busca por date como string "yyyy-MM-dd". Si no hay resultados, intenta por rango (Timestamp)
 * por compatibilidad con documentos antiguos.
 * @param {string} companyId
 * @param {Date|string} date - Fecha del día (Date o "yyyy-MM-dd")
 * @returns {Promise<Array<{ id: string, date: any }>>}
 */
export async function getQuadrantsByDate(companyId, date) {
  if (!companyId || !date) return [];
  const dateStr = typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : toDateString(date);
  if (!dateStr) return [];
  const ref = collection(db, COLLECTIONS.QUADRANTS);
  const q = query(
    ref,
    where('companyId', '==', companyId),
    where('date', '==', dateStr)
  );
  let snapshot = await getDocs(q);
  if (snapshot.empty) {
    const d = new Date(dateStr + 'T12:00:00');
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
    const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
    const qLegacy = query(
      ref,
      where('companyId', '==', companyId),
      where('date', '>=', start),
      where('date', '<=', end),
      orderBy('date', 'asc')
    );
    snapshot = await getDocs(qLegacy);
  }
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

/**
 * Obtiene los jobs de la subcolección quadrants/{quadrantId}/jobs.
 * Orden: routeOrder (asc), luego startHour.
 * @param {string} quadrantId
 * @returns {Promise<Array<{ id: string, houseId?, worker?, startHour?, endHour?, routeOrder? }>>}
 */
export async function getQuadrantJobs(quadrantId) {
  if (!quadrantId) return [];
  const quadrantRef = doc(db, COLLECTIONS.QUADRANTS, quadrantId);
  const jobsRef = collection(quadrantRef, 'jobs');
  const snapshot = await getDocs(jobsRef);
  const jobs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  // Ordenar por routeOrder (default 0) y luego por startHour
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

/**
 * Crea un cuadrante para una fecha (documento en quadrants con date y companyId).
 * date se guarda como string "yyyy-MM-dd" para coincidir con getQuadrantsByDate.
 * @param {string} companyId
 * @param {Date|string} date - Fecha del día (Date o "yyyy-MM-dd")
 * @returns {Promise<{ id: string }>}
 */
export async function createQuadrant(companyId, date) {
  if (!companyId || !date) throw new Error('Faltan companyId o fecha');
  const dateStr = typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : toDateString(date);
  if (!dateStr) throw new Error('Fecha no válida');
  const ref = collection(db, COLLECTIONS.QUADRANTS);
  const docRef = await addDoc(ref, {
    companyId,
    date: dateStr,
  });
  return { id: docRef.id };
}

/**
 * Añade un trabajo a la subcolección quadrants/{quadrantId}/jobs.
 * El trigger createJobsForQuadrant creará el documento en la colección jobs.
 * @param {string} quadrantId
 * @param {{ houseId: string, worker: object, startHour: Date, endHour: Date, date: Date }} payload
 * @returns {Promise<{ id: string }>}
 */
export async function addQuadrantJob(quadrantId, payload) {
  if (!quadrantId || !payload?.houseId || !payload?.worker?.id) throw new Error('Faltan quadrantId, casa o trabajador');
  const { houseId, worker, startHour, endHour, date } = payload;
  const day = date ? new Date(date) : new Date();
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

/**
 * Actualiza routeOrder de varios jobs del cuadrante.
 * @param {string} quadrantId
 * @param {Array<{ jobId: string, routeOrder: number }>} updates
 */
export async function updateQuadrantJobsOrder(quadrantId, updates) {
  if (!quadrantId || !updates?.length) return;
  const batch = writeBatch(db);
  for (const { jobId, routeOrder } of updates) {
    const jobRef = doc(db, COLLECTIONS.QUADRANTS, quadrantId, 'jobs', jobId);
    batch.update(jobRef, { routeOrder });
  }
  await batch.commit();
}

/**
 * Elimina un trabajo del cuadrante (subcolección) y, si existe, el job en la colección jobs.
 * @param {string} quadrantId
 * @param {string} jobId - id del doc en quadrants/{quadrantId}/jobs
 * @param {{ houseId: string, worker?: { id: string } }} job - para localizar el job en la colección jobs
 */
export async function deleteQuadrantJob(quadrantId, jobId, job) {
  if (!quadrantId || !jobId) return;
  const quadrantJobRef = doc(db, COLLECTIONS.QUADRANTS, quadrantId, 'jobs', jobId);
  await deleteDoc(quadrantJobRef);
  const workerId = job?.worker?.id || job?.workersId?.[0];
  if (job?.houseId && workerId) {
    const jobsRef = collection(db, COLLECTIONS.JOBS);
    const q = query(
      jobsRef,
      where('quadrantId', '==', quadrantId),
      where('houseId', '==', job.houseId),
      limit(1)
    );
    const snap = await getDocs(q);
    const toDelete = snap.docs.find((d) => (d.data().workersId || []).includes(workerId));
    if (toDelete) await deleteDoc(toDelete.ref);
  }
}

/**
 * Elimina el cuadrante completo: jobs de la subcolección, jobs de la colección jobs con ese quadrantId, y el documento del cuadrante.
 * El documento del cuadrante se elimina siempre, aunque falle la eliminación de trabajos.
 * @param {string} quadrantId
 */
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

/**
 * Optimiza el orden de ruta de los jobs del cuadrante (por trabajador opcional).
 * Llama a la Cloud Function optimizeRoute y devuelve { orderedJobIds }.
 * @param {string} quadrantId
 * @param {string} [workerId]
 * @returns {Promise<{ orderedJobIds: string[] }>}
 */
export async function optimizeRoute(quadrantId, workerId) {
  const { httpsCallable } = await import('firebase/functions');
  const { functions } = await import('@/config/firebase');
  const fn = httpsCallable(functions, 'optimizeRoute');
  const result = await fn({ quadrantId, workerId: workerId || undefined });
  return result.data;
}

/**
 * Propone una combinación óptima: asigna casas a trabajadores y franjas horarias.
 * Llama a la Cloud Function proposeQuadrantAssignment.
 * @param {{ date: string, houseIds: string[], workerIds: string[], workerWorkHours?: Record<string, { workStart: string, workEnd: string }>, options?: object }} payload - date 'yyyy-MM-dd', arrays y options (houseDurations, etc.)
 * @returns {Promise<{ assignments: Array<{ houseId, workerId, startTime, endTime, worker, house }>, date?: string }>}
 */
export async function proposeQuadrantAssignment(payload) {
  const { httpsCallable } = await import('firebase/functions');
  const { functions } = await import('@/config/firebase');
  const fn = httpsCallable(functions, 'proposeQuadrantAssignment');
  const result = await fn(payload);
  return result.data;
}

// ——— Trabajos (Jobs) ———
export async function getJobs(companyId) {
  if (!companyId) return [];
  const ref = collection(db, COLLECTIONS.JOBS);
  const q = query(
    ref,
    where('companyId', '==', companyId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getJob(id) {
  const ref = doc(db, COLLECTIONS.JOBS, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function updateJob(id, data) {
  if (!id) throw new Error('Falta id de trabajo');
  const ref = doc(db, COLLECTIONS.JOBS, id);
  await updateDoc(ref, { ...data, updatedAt: new Date() });
}

export async function deleteJob(id) {
  if (!id) throw new Error('Falta id de trabajo');
  const ref = doc(db, COLLECTIONS.JOBS, id);
  await deleteDoc(ref);
}

// ——— Mensajes y actividad (timeline) ———
const TIMELINE_COLLECTIONS = [COLLECTIONS.INCIDENTS, COLLECTIONS.JOBS, COLLECTIONS.CHECKLISTS];

/**
 * Obtiene mensajes (comentarios) de una subcolección messages.
 * @param {string} collectionName - 'incidents' | 'jobs' | 'checklists'
 * @param {string} docId - id del documento padre
 */
export async function getMessages(collectionName, docId) {
  if (!TIMELINE_COLLECTIONS.includes(collectionName) || !docId) return [];
  const colRef = collection(doc(db, collectionName, docId), 'messages');
  const q = query(colRef, orderBy('createdAt', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Añade un comentario al timeline (subcolección messages).
 * @param {string} collectionName
 * @param {string} docId
 * @param {{ text: string, user: { uid: string, firstName?: string, lastName?: string } }} payload
 */
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

/**
 * Obtiene entradas de actividad (cambios de estado) de la subcolección activity.
 */
export async function getActivity(collectionName, docId) {
  if (!TIMELINE_COLLECTIONS.includes(collectionName) || !docId) return [];
  const colRef = collection(doc(db, collectionName, docId), 'activity');
  const q = query(colRef, orderBy('createdAt', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Añade una entrada de actividad (cambio de estado).
 * @param {string} collectionName
 * @param {string} docId
 * @param {{ type: 'state_change', fromState?: string, toState?: string, fromDone?: boolean, toDone?: boolean, user: object }} payload
 */
export async function addActivity(collectionName, docId, payload) {
  if (!collectionName || !docId || !payload?.type) throw new Error('Faltan collectionName, docId o type');
  const colRef = collection(doc(db, collectionName, docId), 'activity');
  const docRef = await addDoc(colRef, {
    ...payload,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

const DEFAULT_SLA_JOB_RESOLUTION_H = 120;

/**
 * Crea un trabajo con SLA y auditoría (createdBy).
 * @param {string} companyId
 * @param {object} payload - { title, observations, houseId, house, workers?, workersId?, date?, createdBy?, slaResolutionHours? }
 */
export async function createJob(companyId, payload) {
  if (!companyId || !payload?.houseId) throw new Error('Faltan companyId o propiedad');
  const ref = collection(db, COLLECTIONS.JOBS);
  const now = new Date();
  const resolutionH = payload.slaResolutionHours ?? DEFAULT_SLA_JOB_RESOLUTION_H;
  const resolutionDueAt = new Date(now.getTime() + resolutionH * 60 * 60 * 1000);
  const docRef = await addDoc(ref, {
    companyId,
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

// ——— Papelera ———
export async function getRecycleBinItems(companyId) {
  if (!companyId) return [];
  const ref = collection(db, COLLECTIONS.RECYCLE_BIN);
  const q = query(ref, where('companyId', '==', companyId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ——— Auditoría ———
export async function getAuditLog(companyId, opts = {}) {
  if (!companyId) return [];
  const { resourceType, action, limitCount = 100 } = opts;
  const ref = collection(db, COLLECTIONS.AUDIT_LOG);
  let q = query(
    ref,
    where('companyId', '==', companyId),
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

// ——— Settings (por empresa: notificaciones, etc.) ———
const SETTINGS_COLLECTION = 'settings';

export async function getSettings(companyId) {
  if (!companyId) return null;
  const ref = doc(db, SETTINGS_COLLECTION, companyId);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function setSettings(companyId, data) {
  if (!companyId) throw new Error('companyId required');
  const ref = doc(db, SETTINGS_COLLECTION, companyId);
  await setDoc(ref, { ...data, updatedAt: new Date() }, { merge: true });
}

// ——— Usuarios (para listar y perfiles) ———
export async function getUsers(companyId) {
  if (!companyId) return [];
  const ref = collection(db, COLLECTIONS.USERS);
  const q = query(ref, where('companyId', '==', companyId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getUser(id) {
  const ref = doc(db, COLLECTIONS.USERS, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function updateUser(id, data) {
  const ref = doc(db, COLLECTIONS.USERS, id);
  const payload = { ...data, updatedAt: new Date() };
  if (payload.homeLocation === null) payload.homeLocation = deleteField();
  if (payload.homeAddress === null) payload.homeAddress = deleteField();
  if (payload.telegramId === null || payload.telegramId === '') payload.telegramId = deleteField();
  await updateDoc(ref, payload);
}

// ——— Trabajadores (subset de usuarios) ———
export async function getWorkersFromFirestore(companyId) {
  if (!companyId) return [];
  const ref = collection(db, COLLECTIONS.USERS);
  const q = query(
    ref,
    where('companyId', '==', companyId),
    where('role', '==', 'worker')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (a.firstName || '').localeCompare(b.firstName || ''));
}

// ——— Propietarios (subset de usuarios) ———
export async function getOwners(companyId) {
  if (!companyId) return [];
  const ref = collection(db, COLLECTIONS.USERS);
  const q = query(
    ref,
    where('companyId', '==', companyId),
    where('role', '==', 'owner')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (a.firstName || '').localeCompare(b.firstName || ''));
}

// ——— Upload de imágenes a Firebase Storage ———
export async function uploadHouseImage(houseId, file) {
  const storageRef = ref(storage, `properties/${houseId}/houseImage/${file.name}`);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);

  const houseRef = doc(db, COLLECTIONS.PROPERTIES, houseId);
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
export async function getOwnerDocuments(companyId, ownerId) {
  if (!companyId || !ownerId) return [];
  const colRef = collection(db, COLLECTIONS.OWNER_DOCUMENTS);
  const q = query(
    colRef,
    where('companyId', '==', companyId),
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

export async function uploadOwnerDocument(companyId, ownerId, file, { name, type = 'other' }) {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `companies/${companyId}/owner-documents/${ownerId}/${Date.now()}_${safeName}`;
  const storageRef = ref(storage, storagePath);
  await uploadBytes(storageRef, file);
  const fileUrl = await getDownloadURL(storageRef);

  const docId = await addOwnerDocument({
    companyId,
    ownerId,
    name: name || file.name,
    type,
    fileUrl,
    fileName: file.name,
  });
  return docId;
}

// Eliminar checklist (documento + subcollection checks) via Cloud Function
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

// Enviar/reenviar email de checklist al propietario via Cloud Function
export async function sendChecklistEmail(checklistId) {
  const { httpsCallable } = await import('firebase/functions');
  const { functions } = await import('@/config/firebase');
  const notifyOwner = httpsCallable(functions, 'notifyOwner');
  const result = await notifyOwner({ checkId: checklistId });
  return result.data;
}

// Generar plantilla de email a propietarios con IA (OpenAI)
export async function generateEmailToOwnerTemplate() {
  const { httpsCallable } = await import('firebase/functions');
  const { functions } = await import('@/config/firebase');
  const fn = httpsCallable(functions, 'generateEmailToOwnerTemplate');
  const result = await fn({});
  return result.data;
}

// Crear usuario via Cloud Function (también crea Auth account)
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
function normalizeCheckCatalogItem(d) {
  const data = d.data();
  const nameEs = data.nameEs || data.locale?.es || data.locale?.title || data.name || '';
  const nameEn = data.nameEn || data.locale?.en || '';
  return { id: d.id, nameEs, nameEn, name: data.name || data.locale?.title || nameEs, ...data };
}

export async function getChecksCatalog(companyId) {
  if (!companyId) return [];
  const checksRef = collection(db, COLLECTIONS.CHECKS);
  const snapshot = await getDocs(checksRef);
  return snapshot.docs
    .map((d) => normalizeCheckCatalogItem(d))
    .sort((a, b) => (a.name || a.nameEs || '').localeCompare(b.name || b.nameEs || ''));
}

export async function createCheckCatalogItem(data) {
  const ref = collection(db, COLLECTIONS.CHECKS);
  const docRef = await addDoc(ref, {
    ...data,
    locale: data.locale || { es: data.nameEs || data.name || '', en: data.nameEn || '' },
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return docRef.id;
}

export async function updateCheckCatalogItem(id, data) {
  const ref = doc(db, COLLECTIONS.CHECKS, id);
  const snap = await getDoc(ref);
  const current = snap.data() || {};
  const locale = { ...(current.locale || {}) };
  if (data.nameEs != null) locale.es = data.nameEs;
  if (data.nameEn != null) locale.en = data.nameEn;
  await updateDoc(ref, { ...data, locale, updatedAt: new Date() });
}

export async function deleteCheckCatalogItem(id) {
  const ref = doc(db, COLLECTIONS.CHECKS, id);
  await deleteDoc(ref);
}

// ——— Catálogo de Tareas ———
export async function getTasksCatalog(companyId) {
  if (!companyId) return [];
  const ref = collection(db, COLLECTIONS.TASKS_CATALOG);
  const q = query(ref, where('companyId', '==', companyId));
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (a.name || a.nameEs || '').localeCompare(b.name || b.nameEs || ''));
}

export async function createTaskCatalogItem(data) {
  const ref = collection(db, COLLECTIONS.TASKS_CATALOG);
  const docRef = await addDoc(ref, { ...data, createdAt: new Date(), updatedAt: new Date() });
  return docRef.id;
}

export async function updateTaskCatalogItem(id, data) {
  const ref = doc(db, COLLECTIONS.TASKS_CATALOG, id);
  await updateDoc(ref, { ...data, updatedAt: new Date() });
}

export async function deleteTaskCatalogItem(id) {
  const ref = doc(db, COLLECTIONS.TASKS_CATALOG, id);
  await deleteDoc(ref);
}

// ——— Entrances (fotos de jornadas) ———
export async function getEntrancesByIds(entranceIds = []) {
  if (!entranceIds.length) return [];
  const results = await Promise.all(
    entranceIds.map(async (id) => {
      const snap = await getDoc(doc(db, COLLECTIONS.TIME_ENTRIES, id));
      if (!snap.exists()) return null;
      return { id: snap.id, ...snap.data() };
    })
  );
  return results.filter(Boolean);
}
