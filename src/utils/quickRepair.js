import {
  getFirestore,
  collection,
  getDocs,
  doc,
  writeBatch
} from '@react-native-firebase/firestore';
import { Logger } from '../lib/logging';

/**
 * Script simple para ejecutar desde consola o App.js
 *
 * USO:
 * 1. Importar en App.js: import './src/utils/quickRepair';
 * 2. O ejecutar manualmente: repairNow()
 */

export const repairNow = async () => {
  Logger.info('🔧 Iniciando reparación de contadores...');

  try {
    const db = getFirestore();
    const checklistsRef = collection(db, 'checklists');
    const checklistsSnapshot = await getDocs(checklistsRef);

    let repairedCount = 0;
    const batch = writeBatch(db);
    const repairs = [];

    for (const checklistDoc of checklistsSnapshot.docs) {
      const checklistData = checklistDoc.data();
      const checklistId = checklistDoc.id;

      // Obtener todos los checks
      const checksRef = collection(db, 'checklists', checklistId, 'checks');
      const checksSnapshot = await getDocs(checksRef);

      // Contar checks completados reales
      const actualDoneCount = checksSnapshot.docs.filter(
        checkDoc => checkDoc.data().done === true
      ).length;

      const currentDoneCount = checklistData.done || 0;

      // Si está incorrecto
      if (currentDoneCount < 0 || currentDoneCount !== actualDoneCount) {
        const houseName = checklistData.house?.[0]?.houseName || 'Sin nombre';

        Logger.info(`🔧 Reparando: ${houseName}`, {
          checklistId,
          before: currentDoneCount,
          after: actualDoneCount
        });

        const checklistDocRef = doc(db, 'checklists', checklistId);
        batch.update(checklistDocRef, { done: actualDoneCount });

        repairs.push({
          id: checklistId,
          house: houseName,
          before: currentDoneCount,
          after: actualDoneCount
        });

        repairedCount++;
      }
    }

    if (repairedCount > 0) {
      await batch.commit();

      const percentage = ((repairedCount / checklistsSnapshot.docs.length) * 100).toFixed(1);
      Logger.info('✅ REPARACIÓN COMPLETADA', {
        total: checklistsSnapshot.docs.length,
        repaired: repairedCount,
        percentage: `${percentage}%`,
        repairs
      });

      return {
        success: true,
        repairedCount,
        total: checklistsSnapshot.docs.length,
        repairs
      };
    } else {
      Logger.info('✅ Todos los contadores están correctos!', {
        total: checklistsSnapshot.docs.length
      });

      return {
        success: true,
        repairedCount: 0,
        total: checklistsSnapshot.docs.length
      };
    }
  } catch (err) {
    const errorObj = err instanceof Error ? err : new Error(String(err));
    Logger.error('❌ ERROR durante la reparación', errorObj);
    throw err;
  }
};

// Auto-ejecutar si se importa con ?run
// Ejemplo: import './src/utils/quickRepair?run';
if (
  typeof window !== 'undefined' &&
  window.location?.search?.includes('repair')
) {
  Logger.info('🚀 Auto-ejecutando reparación...');
  repairNow();
}

// Exponer globalmente para consola
if (typeof global !== 'undefined') {
  global.repairNow = repairNow;
}

export default repairNow;
