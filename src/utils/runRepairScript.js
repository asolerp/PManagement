import {
  repairChecklistCounts,
  repairSingleChecklist
} from './repairChecklistCounts';
import { Logger } from '../lib/logging';

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
  Logger.info('🔧 Iniciando reparación de contadores...');

  try {
    const result = await repairChecklistCounts();

    const percentage = ((result.repairedCount / result.total) * 100).toFixed(1);
    Logger.info('✅ Reparación completada', {
      repaired: result.repairedCount,
      total: result.total,
      percentage: `${percentage}%`
    });

    return result;
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    Logger.error('❌ Error durante la reparación', errorObj);
    throw error;
  }
};

/**
 * Reparar un checklist específico por ID
 */
export const runRepairSingle = async checklistId => {
  Logger.info(`🔧 Reparando checklist ${checklistId}...`, { checklistId });

  try {
    const actualDone = await repairSingleChecklist(checklistId);

    Logger.info(`✅ Checklist ${checklistId} reparado`, { checklistId, done: actualDone });

    return actualDone;
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    Logger.error(`❌ Error reparando checklist ${checklistId}`, errorObj, { checklistId });
    throw error;
  }
};

// Para debugging: Reparar el checklist problemático específico
export const repairProblematicChecklist = () => {
  return runRepairSingle('rmhQhgoFQ8xmR1vLaQO8');
};
