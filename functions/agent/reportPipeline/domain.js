/**
 * Modelo de dominio del pipeline de reportes housekeeping.
 * Tres capas: Extraction (hechos) → Reasoning (assessment) → Presentation (dashboard).
 *
 * @typedef {'audio'|'visual'} FactSource
 * @typedef {'issue'|'state'|'missing_item'|'damage'|'hazard'} FactKind
 * @typedef {'critical'|'high'|'medium'|'low'|'none'} Priority
 * @typedef {'high'|'medium'|'low'} ConfidenceLevel
 * @typedef {'audio'|'visual'|'both'|'inference'} EvidenceSource
 */

/**
 * Hecho extraído del transcript o de imágenes. Sin prioridad de negocio.
 * @typedef {Object} ExtractedFact
 * @property {string} factId
 * @property {FactSource} source
 * @property {FactKind} kind
 * @property {string} text
 * @property {string} [location]
 * @property {string} [object]
 * @property {number} [confidence] 0-1
 */

/**
 * Resultado de la capa de extracción.
 * @typedef {Object} ExtractionResult
 * @property {string} [propertyName] - Nombre de propiedad extraído del transcript
 * @property {string} [location] - Zona/habitación si se menciona
 * @property {ExtractedFact[]} facts
 */

/**
 * Incidencia operativa resultante del reasoning (agrupación, prioridad, categoría).
 * @typedef {Object} AssessedIssue
 * @property {string} issueId
 * @property {string} title
 * @property {string} category - ej. 'safety'|'cleanliness'|'maintenance'|'amenities'|'cosmetic'
 * @property {Priority} priority
 * @property {string} [location]
 * @property {string} description
 * @property {string} [impact]
 * @property {string} [recommendedAction]
 * @property {string[]} [evidenceFactIds]
 * @property {EvidenceSource} evidenceSource
 * @property {ConfidenceLevel} confidence
 */

/**
 * Resultado de la capa de reasoning.
 * @typedef {Object} OperationalAssessment
 * @property {string} mainContext
 * @property {string} [transcriptionSummary]
 * @property {string} [reportTitle]
 * @property {string[]} [tasksPerformed]
 * @property {Priority} overallPriority
 * @property {boolean} requiresImmediateAction
 * @property {AssessedIssue[]} issues
 * @property {string[]} [consolidatedActions]
 * @property {string} [finalStatus]
 */

/**
 * Issue en el payload final para dashboard (con visual_marker).
 * @typedef {Object} DashboardIssue
 * @property {string} id
 * @property {string} title
 * @property {string} category
 * @property {string} priority
 * @property {'open'} status
 * @property {string} location
 * @property {string} description
 * @property {string} impact
 * @property {string} recommended_action
 * @property {{ source: EvidenceSource, confidence: ConfidenceLevel }} evidence
 * @property {string[]} tags
 * @property {{ icon: string, color: string }} visual_marker
 */

/**
 * Payload final para la UI.
 * @typedef {Object} DashboardReport
 * @property {{ title: string, date: string|null, responsible: string, location: string }} [report_header]
 * @property {{ headline: string, overall_priority: Priority, total_issues: number, requires_immediate_action: boolean, main_context: string }} summary
 * @property {string[]} [tasks_performed]
 * @property {DashboardIssue[]} issues
 * @property {Record<string, DashboardIssue[]>} [issues_grouped]
 * @property {string[]} [consolidated_actions]
 * @property {string} [final_status]
 * @property {{ critical: number, high: number, medium: number, low: number }} quick_stats
 * @property {string} suggested_next_step
 */

/** Prioridades para reglas */
const PRIORITY_ORDER = ['none', 'low', 'medium', 'high', 'critical'];

function priorityLevel(p) {
  const i = PRIORITY_ORDER.indexOf(p);
  return i >= 0 ? i : 0;
}

function maxPriority(a, b) {
  return priorityLevel(a) >= priorityLevel(b) ? a : b;
}

module.exports = {
  PRIORITY_ORDER,
  priorityLevel,
  maxPriority
};
