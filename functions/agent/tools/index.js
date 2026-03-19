/**
 * Registry de tools para el agente: definiciones para OpenAI y ejecutor.
 * Todas las tools reciben companyId (inyectado por el webhook) y args del LLM.
 */

const getIncidentById = require('./getIncidentById');
const getOpenIncidents = require('./getOpenIncidents');
const getQuadrantByDate = require('./getQuadrantByDate');
const getJobsByDate = require('./getJobsByDate');
const getPropertyById = require('./getPropertyById');
const listProperties = require('./listProperties');
const listWorkers = require('./listWorkers');
const getChecklistById = require('./getChecklistById');
const listOpenChecklists = require('./listOpenChecklists');
const createIncidence = require('./createIncidence');
const updateIncident = require('./updateIncident');
const assignWorkersToIncident = require('./assignWorkersToIncident');
const updateJob = require('./updateJob');
const getIncidentsByProperty = require('./getIncidentsByProperty');
const getDailyOpsSummary = require('./getDailyOpsSummary');
const closeIncidentWithSummary = require('./closeIncidentWithSummary');
const reopenIncident = require('./reopenIncident');
const assignByWorkload = require('./assignByWorkload');
const getUrgentQueue = require('./getUrgentQueue');
const dailyDigestByWorker = require('./dailyDigestByWorker');
const updateChecklistProgress = require('./updateChecklistProgress');
const searchEntity = require('./searchEntity');
const bulkUpdateIncidents = require('./bulkUpdateIncidents');
const createFollowUpTaskFromIncident = require('./createFollowUpTaskFromIncident');
const weeklyOpsSummary = require('./weeklyOpsSummary');

const TOOLS = [
  getIncidentById,
  getOpenIncidents,
  getQuadrantByDate,
  getJobsByDate,
  getPropertyById,
  listProperties,
  listWorkers,
  getChecklistById,
  listOpenChecklists,
  createIncidence,
  updateIncident,
  assignWorkersToIncident,
  updateJob,
  getIncidentsByProperty,
  getDailyOpsSummary,
  closeIncidentWithSummary,
  reopenIncident,
  assignByWorkload,
  getUrgentQueue,
  dailyDigestByWorker,
  updateChecklistProgress,
  searchEntity,
  bulkUpdateIncidents,
  createFollowUpTaskFromIncident,
  weeklyOpsSummary
];

/** Schemas para la API de OpenAI (tools array) */
function getOpenAITools() {
  return TOOLS.map(t => t.schema);
}

/**
 * Ejecuta una tool por nombre.
 * @param {string} companyId
 * @param {string} toolName
 * @param {object} args - Argumentos que el LLM pasó a la función
 * @returns {Promise<string>}
 */
async function runTool(companyId, toolName, args) {
  const tool = TOOLS.find(t => t.schema.function.name === toolName);
  if (!tool) {
    return `Herramienta desconocida: ${toolName}.`;
  }
  try {
    return await tool.run(companyId, args || {});
  } catch (err) {
    console.error(`Tool ${toolName} error:`, err);
    return `Error al ejecutar ${toolName}: ${err.message}.`;
  }
}

module.exports = {
  getOpenAITools,
  runTool
};
