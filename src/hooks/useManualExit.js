import { useState } from 'react';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  updateDoc,
  Timestamp
} from '@react-native-firebase/firestore';

import { Logger } from '../lib/logging';

export const useManualExit = () => {
  const [loading, setLoading] = useState(false);

  const markExitManually = async (entranceId, exitTime) => {
    try {
      setLoading(true);

      const db = getFirestore();
      const entranceDocRef = doc(collection(db, 'entrances'), entranceId);

      // Crear un Timestamp con la fecha de entrada pero la hora de salida seleccionada
      const entranceDocSnap = await getDoc(entranceDocRef);

      if (!entranceDocSnap.exists()) {
        throw new Error('Entrada no encontrada');
      }

      const entranceData = entranceDocSnap.data();
      const entryDate = entranceData.date.toDate();

      // Combinar la fecha de entrada con la hora de salida seleccionada
      const exitDate = new Date(entryDate);
      exitDate.setHours(exitTime.hours, exitTime.minutes, 0, 0);

      // Si la hora de salida es anterior a la de entrada, asumimos que es del día siguiente
      if (exitDate < entryDate) {
        exitDate.setDate(exitDate.getDate() + 1);
      }

      // Actualizar el documento
      await updateDoc(entranceDocRef, {
        action: 'exit',
        exitDate: Timestamp.fromDate(exitDate),
        exitLocation: entranceData.location, // Usar la misma ubicación de entrada
        markedManually: true, // Indicador de que fue marcado manualmente
        markedBy: 'owner' // Quien lo marcó
      });

      setLoading(false);
      return true;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      Logger.error('Error marking exit manually', errorObj, { entranceId, exitTime }, { showToast: true });
      setLoading(false);
      return false;
    }
  };

  return {
    markExitManually,
    loading
  };
};
