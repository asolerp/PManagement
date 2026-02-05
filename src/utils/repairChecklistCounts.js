import {
  getFirestore,
  collection,
  getDocs,
  doc,
  writeBatch,
  updateDoc
} from '@react-native-firebase/firestore';
import { error, success } from '../lib/logging';

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
        console.log(
          `🔧 Reparando checklist ${checklistId}: ${currentDoneCount} → ${actualDoneCount}`
        );

        const checklistDocRef = doc(db, 'checklists', checklistId);
        batch.update(checklistDocRef, {
          done: actualDoneCount
        });

        repairedCount++;
      }
    }

    if (repairedCount > 0) {
      await batch.commit();
      success({
        message: `✅ ${repairedCount} checklists reparados`,
        track: false,
        asToast: true
      });
    } else {
      success({
        message: '✅ Todos los checklists están correctos',
        track: false,
        asToast: true
      });
    }

    return {
      repairedCount,
      total: checklistsSnapshot.docs.length,
      success: true
    };
  } catch (err) {
    error({
      message: `Error reparando checklists: ${err.message}`,
      track: true,
      asToast: true
    });
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

    console.log(
      `✅ Checklist ${checklistId} reparado: done = ${actualDoneCount}`
    );

    return actualDoneCount;
  } catch (err) {
    console.error(`❌ Error reparando checklist ${checklistId}:`, err);
    throw err;
  }
};
