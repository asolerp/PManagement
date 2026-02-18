import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  updateDoc,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/config/firebase';

const COLLECTIONS = {
  HOUSES: 'houses',
  INCIDENCES: 'incidences',
  CHECKLISTS: 'checklists',
  JOBS: 'jobs',
  USERS: 'users',
  RECYCLE_BIN: 'recycleBin',
  CHECKS: 'checks'
};

// ——— Casas ———
export async function getHouses() {
  const ref = collection(db, COLLECTIONS.HOUSES);
  const q = query(ref, orderBy('houseName'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getHouse(id) {
  const ref = doc(db, COLLECTIONS.HOUSES, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function createHouse(data) {
  const ref = collection(db, COLLECTIONS.HOUSES);
  const docRef = await addDoc(ref, { ...data, createdAt: new Date() });
  return docRef.id;
}

export async function updateHouse(id, data) {
  const ref = doc(db, COLLECTIONS.HOUSES, id);
  await updateDoc(ref, { ...data, updatedAt: new Date() });
}

// ——— Incidencias ———
export async function getIncidences(filters = {}) {
  const ref = collection(db, COLLECTIONS.INCIDENCES);
  const constraints = [];
  if (filters.done !== undefined) {
    constraints.push(where('done', '==', filters.done));
  }
  if (filters.workersId) {
    constraints.push(where('workersId', 'array-contains', filters.workersId));
  }
  const q = constraints.length ? query(ref, ...constraints) : ref;
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getIncidence(id) {
  const ref = doc(db, COLLECTIONS.INCIDENCES, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

// ——— Checklists ———
export async function getChecklists(filters = {}) {
  const ref = collection(db, COLLECTIONS.CHECKLISTS);
  const constraints = [];
  if (filters.finished !== undefined) {
    constraints.push(where('finished', '==', filters.finished));
  }
  if (filters.houseId) {
    constraints.push(where('houseId', '==', filters.houseId));
  }
  constraints.push(orderBy('date', 'desc'));
  if (filters.limitCount) {
    constraints.push(limit(Math.min(filters.limitCount, 100)));
  }
  try {
    const q = query(ref, ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.error('getChecklists', e);
    return [];
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

// ——— Trabajos (Jobs) ———
export async function getJobs() {
  const ref = collection(db, COLLECTIONS.JOBS);
  const q = query(ref, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getJob(id) {
  const ref = doc(db, COLLECTIONS.JOBS, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

// ——— Papelera ———
export async function getRecycleBinItems() {
  const ref = collection(db, COLLECTIONS.RECYCLE_BIN);
  const snapshot = await getDocs(ref);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ——— Usuarios (para listar y perfiles) ———
export async function getUsers() {
  const ref = collection(db, COLLECTIONS.USERS);
  const snapshot = await getDocs(ref);
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
  await updateDoc(ref, { ...data, updatedAt: new Date() });
}

// ——— Trabajadores (subset de usuarios) ———
export async function getWorkersFromFirestore() {
  const ref = collection(db, COLLECTIONS.USERS);
  const q = query(ref, where('role', '==', 'worker'));
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (a.firstName || '').localeCompare(b.firstName || ''));
}

// ——— Propietarios (subset de usuarios) ———
export async function getOwners() {
  const ref = collection(db, COLLECTIONS.USERS);
  const q = query(ref, where('role', '==', 'owner'));
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
