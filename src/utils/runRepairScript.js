import {
  repairChecklistCounts,
  repairSingleChecklist
} from './repairChecklistCounts';

/**
 * Script para ejecutar desde consola y reparar los contadores
 *
 * Uso:
 * 1. Importar en App.js temporalmente
 * 2. Llamar a runRepair() en useEffect
 * 3. Ver resultados en consola
 * 4. Remover el código después
 */

export const runRepair = async () => {
  console.log('🔧 Iniciando reparación de contadores...');

  try {
    const result = await repairChecklistCounts();

    console.log(`
✅ Reparación completada:
   - Checklists reparados: ${result.repairedCount}
   - Total de checklists: ${result.total}
   - Porcentaje reparado: ${((result.repairedCount / result.total) * 100).toFixed(1)}%
    `);

    return result;
  } catch (error) {
    console.error('❌ Error durante la reparación:', error);
    throw error;
  }
};

/**
 * Reparar un checklist específico por ID
 */
export const runRepairSingle = async checklistId => {
  console.log(`🔧 Reparando checklist ${checklistId}...`);

  try {
    const actualDone = await repairSingleChecklist(checklistId);

    console.log(`✅ Checklist ${checklistId} reparado: done = ${actualDone}`);

    return actualDone;
  } catch (error) {
    console.error(`❌ Error reparando checklist ${checklistId}:`, error);
    throw error;
  }
};

// Para debugging: Reparar el checklist problemático específico
export const repairProblematicChecklist = () => {
  return runRepairSingle('rmhQhgoFQ8xmR1vLaQO8');
};
