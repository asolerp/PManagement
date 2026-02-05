import {
  getFirestore,
  collection,
  getDocs,
  doc,
  writeBatch
} from '@react-native-firebase/firestore';

/**
 * Script simple para ejecutar desde consola o App.js
 *
 * USO:
 * 1. Importar en App.js: import './src/utils/quickRepair';
 * 2. O ejecutar manualmente: repairNow()
 */

export const repairNow = async () => {
  console.log('🔧 Iniciando reparación de contadores...\n');

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

        console.log(`🔧 Reparando: ${houseName}`);
        console.log(`   ID: ${checklistId}`);
        console.log(`   Contador: ${currentDoneCount} → ${actualDoneCount}\n`);

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

      console.log('✅ REPARACIÓN COMPLETADA\n');
      console.log(`📊 Resumen:`);
      console.log(`   Total checklists: ${checklistsSnapshot.docs.length}`);
      console.log(`   Reparados: ${repairedCount}`);
      console.log(
        `   Porcentaje: ${((repairedCount / checklistsSnapshot.docs.length) * 100).toFixed(1)}%\n`
      );

      console.log('📋 Detalles de reparaciones:');
      repairs.forEach(r => {
        console.log(`   • ${r.house}: ${r.before} → ${r.after}`);
      });

      return {
        success: true,
        repairedCount,
        total: checklistsSnapshot.docs.length,
        repairs
      };
    } else {
      console.log('✅ Todos los contadores están correctos!\n');
      console.log(
        `📊 Total checklists revisados: ${checklistsSnapshot.docs.length}`
      );

      return {
        success: true,
        repairedCount: 0,
        total: checklistsSnapshot.docs.length
      };
    }
  } catch (err) {
    console.error('❌ ERROR durante la reparación:', err);
    throw err;
  }
};

// Auto-ejecutar si se importa con ?run
// Ejemplo: import './src/utils/quickRepair?run';
if (
  typeof window !== 'undefined' &&
  window.location?.search?.includes('repair')
) {
  console.log('🚀 Auto-ejecutando reparación...\n');
  repairNow();
}

// Exponer globalmente para consola
if (typeof global !== 'undefined') {
  global.repairNow = repairNow;
}

export default repairNow;
