import { httpsCallable } from 'firebase/functions';
import { functions } from '@/config/firebase';

// Work Shifts API
export const getWorkShifts = async (params) => {
  const fn = httpsCallable(functions, 'getWorkShifts');
  const result = await fn(params);
  return result.data;
};

export const getWorkShiftStats = async (params) => {
  const fn = httpsCallable(functions, 'getWorkShiftStats');
  const result = await fn(params);
  return result.data;
};

export const getWorkers = async () => {
  const fn = httpsCallable(functions, 'getWorkers');
  const result = await fn();
  return result.data;
};

export const createWorkShift = async (data) => {
  const fn = httpsCallable(functions, 'createWorkShift');
  const result = await fn(data);
  return result.data;
};

export const updateWorkShift = async (data) => {
  const fn = httpsCallable(functions, 'updateWorkShift');
  const result = await fn(data);
  return result.data;
};

export const deleteWorkShift = async (shiftId) => {
  const fn = httpsCallable(functions, 'deleteWorkShift');
  const result = await fn({ shiftId });
  return result.data;
};

export const migrateEntrances = async (params) => {
  const fn = httpsCallable(functions, 'migrateEntrancesToWorkShifts');
  const result = await fn(params);
  return result.data;
};
