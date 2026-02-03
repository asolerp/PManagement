import { useState } from 'react';
import firestore from '@react-native-firebase/firestore';

import { error } from '../lib/logging';

export const useManualExit = () => {
  const [loading, setLoading] = useState(false);

  const markExitManually = async (entranceId, exitTime) => {
    try {
      setLoading(true);

      // Crear un Timestamp con la fecha de entrada pero la hora de salida seleccionada
      const entranceDoc = await firestore()
        .collection('entrances')
        .doc(entranceId)
        .get();

      if (!entranceDoc.exists) {
        throw new Error('Entrada no encontrada');
      }

      const entranceData = entranceDoc.data();
      const entryDate = entranceData.date.toDate();

      // Combinar la fecha de entrada con la hora de salida seleccionada
      const exitDate = new Date(entryDate);
      exitDate.setHours(exitTime.hours, exitTime.minutes, 0, 0);

      // Si la hora de salida es anterior a la de entrada, asumimos que es del día siguiente
      if (exitDate < entryDate) {
        exitDate.setDate(exitDate.getDate() + 1);
      }

      // Actualizar el documento
      await firestore()
        .collection('entrances')
        .doc(entranceId)
        .update({
          action: 'exit',
          exitDate: firestore.Timestamp.fromDate(exitDate),
          exitLocation: entranceData.location, // Usar la misma ubicación de entrada
          markedManually: true, // Indicador de que fue marcado manualmente
          markedBy: 'owner' // Quien lo marcó
        });

      setLoading(false);
      return true;
    } catch (err) {
      console.log('Error marking exit manually:', err);
      error({
        message: err.message || 'No se pudo marcar la salida',
        track: true,
        asToast: true
      });
      setLoading(false);
      return false;
    }
  };

  return {
    markExitManually,
    loading
  };
};
