// ============================================
// 🔧 CÓDIGO PARA REPARAR CONTADORES NEGATIVOS
// ============================================
//
// INSTRUCCIONES:
// 1. Copia TODO este archivo
// 2. Pégalo al FINAL de src/App.js (después del export default App)
// 3. Guarda el archivo
// 4. La app se recargará automáticamente
// 5. Espera 3 segundos
// 6. Revisa los logs en la terminal
// 7. BORRA TODO ESTE CÓDIGO después de que funcione
//
// ============================================

import {
  getFirestore,
  collection,
  getDocs,
  doc,
  writeBatch
} from '@react-native-firebase/firestore';

// Función de reparación
const repairChecklistCounters = async () => {
  console.log('\n\n🔧 ========================================');
  console.log('🔧 REPARACIÓN DE CONTADORES INICIADA');
  console.log('🔧 ========================================\n');

  try {
    const db = getFirestore();

    // Obtener todos los checklists
    const checklistsRef = collection(db, 'checklists');
    const checklistsSnapshot = await getDocs(checklistsRef);

    console.log(
      `📊 Total de checklists encontrados: ${checklistsSnapshot.docs.length}\n`
    );

    let repairedCount = 0;
    const batch = writeBatch(db);
    const repairs = [];

    // Procesar cada checklist
    for (const checklistDoc of checklistsSnapshot.docs) {
      const checklistData = checklistDoc.data();
      const checklistId = checklistDoc.id;

      // Obtener todos los checks de este checklist
      const checksRef = collection(db, 'checklists', checklistId, 'checks');
      const checksSnapshot = await getDocs(checksRef);

      // Contar checks completados REALES
      const actualDoneCount = checksSnapshot.docs.filter(
        checkDoc => checkDoc.data().done === true
      ).length;

      const currentDoneCount = checklistData.done || 0;

      // Si el contador está incorrecto (negativo o no coincide)
      if (currentDoneCount < 0 || currentDoneCount !== actualDoneCount) {
        const houseName = checklistData.house?.[0]?.houseName || 'Sin nombre';

        console.log(`🔧 REPARANDO:`);
        console.log(`   Casa: ${houseName}`);
        console.log(`   ID: ${checklistId}`);
        console.log(`   Contador ANTES: ${currentDoneCount}`);
        console.log(`   Contador DESPUÉS: ${actualDoneCount}`);
        console.log(
          `   Checks completados reales: ${actualDoneCount}/${checksSnapshot.docs.length}\n`
        );

        // Agregar al batch
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

    // Ejecutar todas las reparaciones
    if (repairedCount > 0) {
      await batch.commit();

      console.log('✅ ========================================');
      console.log('✅ REPARACIÓN COMPLETADA CON ÉXITO');
      console.log('✅ ========================================\n');

      console.log(`📊 RESUMEN:`);
      console.log(
        `   Total checklists revisados: ${checklistsSnapshot.docs.length}`
      );
      console.log(`   Checklists reparados: ${repairedCount}`);
      console.log(
        `   Porcentaje reparado: ${((repairedCount / checklistsSnapshot.docs.length) * 100).toFixed(1)}%\n`
      );

      console.log('📋 DETALLES DE REPARACIONES:');
      repairs.forEach(r => {
        console.log(`   • ${r.house}: ${r.before} → ${r.after}`);
      });
      console.log('\n');

      console.log(
        '⚠️  IMPORTANTE: Ahora BORRA el código de reparación de App.js\n'
      );
    } else {
      console.log('✅ ========================================');
      console.log('✅ TODOS LOS CONTADORES ESTÁN CORRECTOS');
      console.log('✅ ========================================\n');
      console.log(
        `📊 Total checklists revisados: ${checklistsSnapshot.docs.length}\n`
      );
      console.log('⚠️  Puedes BORRAR el código de reparación de App.js\n');
    }
  } catch (err) {
    console.error('\n❌ ========================================');
    console.error('❌ ERROR DURANTE LA REPARACIÓN');
    console.error('❌ ========================================\n');
    console.error('Error:', err);
    console.error('\n');
  }
};

// Auto-ejecutar después de 3 segundos (solo en desarrollo)
if (__DEV__) {
  setTimeout(() => {
    console.log('\n⏰ Ejecutando reparación en 3 segundos...\n');
    repairChecklistCounters();
  }, 3000);
}
