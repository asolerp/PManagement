import {
  getFirestore,
  collection,
  getDocs,
  doc,
  writeBatch,
  updateDoc
} from '@react-native-firebase/firestore';
import { Logger } from '../lib/logging';

/**
 * Repara los contadores "done" de checklists que están negativos o incorrectos
 * Recalcula basándose en el número real de checks completados
 */
export const repairChecklistCounts = async () => {
  try {
    const db = getFirestore();
    const checklistsRef = collection(db, 'checklists');
    const checklistsSnapshot = await getDocs(checklistsRef);

    let repairedCount = 0;
    const batch = writeBatch(db);

    for (const checklistDoc of checklistsSnapshot.docs) {
      const checklistData = checklistDoc.data();
      const checklistId = checklistDoc.id;

      // Obtener todos los checks de este checklist
      const checksRef = collection(db, 'checklists', checklistId, 'checks');
      const checksSnapshot = await getDocs(checksRef);

      // Contar checks completados
      const actualDoneCount = checksSnapshot.docs.filter(
        checkDoc => checkDoc.data().done === true
      ).length;

      const currentDoneCount = checklistData.done || 0;

      // Si el contador está incorrecto (negativo o no coincide)
      if (currentDoneCount < 0 || currentDoneCount !== actualDoneCount) {
        Logger.info(`🔧 Reparando checklist ${checklistId}`, {
          checklistId,
          before: currentDoneCount,
          after: actualDoneCount
        });

        const checklistDocRef = doc(db, 'checklists', checklistId);
        batch.update(checklistDocRef, {
          done: actualDoneCount
        });

        repairedCount++;
      }
    }

    if (repairedCount > 0) {
      await batch.commit();
      Logger.info(`✅ ${repairedCount} checklists reparados`, { repairedCount, total: checklistsSnapshot.docs.length }, { showToast: true });
    } else {
      Logger.info('✅ Todos los checklists están correctos', { total: checklistsSnapshot.docs.length }, { showToast: true });
    }

    return {
      repairedCount,
      total: checklistsSnapshot.docs.length,
      success: true
    };
  } catch (err) {
    const errorObj = err instanceof Error ? err : new Error(String(err));
    Logger.error('Error reparando checklists', errorObj, null, { showToast: true });
    throw err;
  }
};

/**
 * Repara un checklist específico
 */
export const repairSingleChecklist = async checklistId => {
  try {
    const db = getFirestore();

    // Obtener todos los checks
    const checksRef = collection(db, 'checklists', checklistId, 'checks');
    const checksSnapshot = await getDocs(checksRef);

    // Contar checks completados
    const actualDoneCount = checksSnapshot.docs.filter(
      checkDoc => checkDoc.data().done === true
    ).length;

    // Actualizar el contador
    const checklistDocRef = doc(db, 'checklists', checklistId);
    await updateDoc(checklistDocRef, {
      done: actualDoneCount
    });

    Logger.info(`✅ Checklist ${checklistId} reparado`, {
      checklistId,
      done: actualDoneCount
    });

    return actualDoneCount;
  } catch (err) {
    const errorObj = err instanceof Error ? err : new Error(String(err));
    Logger.error(`❌ Error reparando checklist ${checklistId}`, errorObj, { checklistId });
    throw err;
  }
};
