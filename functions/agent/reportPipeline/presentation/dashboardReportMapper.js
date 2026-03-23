/**
 * Mapea OperationalAssessment a DashboardReport (payload para UI).
 * Sin lógica de negocio; solo formato y visual_marker por prioridad/categoría.
 */

const PRIORITY_MARKERS = {
  critical: { icon: 'alert-circle', color: '#dc2626' },
  high: { icon: 'alert-triangle', color: '#ea580c' },
  medium: { icon: 'info', color: '#ca8a04' },
  low: { icon: 'check-circle', color: '#16a34a' },
  none: { icon: 'minus', color: '#6b7280' }
};

/**
 * @param {object} assessment - OperationalAssessment (tras rules)
 * @returns {object} DashboardReport
 */
function toDashboardReport(assessment) {
  const groupedByLocation = {};
  const issues = (assessment.issues || []).map(i => ({
    id: i.issueId,
    title: i.title,
    category: i.category,
    priority: i.priority,
    status: 'open',
    location: i.location || '',
    description: i.description,
    impact: i.impact || '',
    recommended_action: i.recommendedAction || '',
    evidence: {
      source: i.evidenceSource || 'audio',
      confidence: i.confidence || 'medium'
    },
    tags: [i.category],
    visual_marker: PRIORITY_MARKERS[i.priority] || PRIORITY_MARKERS.medium
  }));
  for (const issue of issues) {
    const key = issue.location || 'Sin ubicación';
    if (!groupedByLocation[key]) groupedByLocation[key] = [];
    groupedByLocation[key].push(issue);
  }

  const quick_stats = { critical: 0, high: 0, medium: 0, low: 0 };
  for (const i of issues) {
    if (quick_stats[i.priority] !== undefined) quick_stats[i.priority] += 1;
  }

  const headline = assessment.requiresImmediateAction
    ? 'Se requiere atención inmediata'
    : issues.length > 0
      ? `Inspección con ${issues.length} incidencia(s)`
      : 'Inspección sin incidencias';

  const suggested_next_step = assessment.requiresImmediateAction
    ? 'Revisar incidencias críticas y asignar actuación.'
    : issues.length > 0
      ? 'Revisar incidencias y crear tareas desde el dashboard.'
      : 'Ninguna acción requerida.';

  return {
    report_header: {
      title: assessment.reportTitle || '',
      location: assessment.location || '',
      responsible: assessment.responsible || '',
      date: assessment.reportDate || null
    },
    summary: {
      headline,
      overall_priority: assessment.overallPriority,
      total_issues: issues.length,
      requires_immediate_action: assessment.requiresImmediateAction,
      main_context: assessment.mainContext || ''
    },
    tasks_performed: Array.isArray(assessment.tasksPerformed)
      ? assessment.tasksPerformed
      : [],
    issues,
    issues_grouped: groupedByLocation,
    consolidated_actions: Array.isArray(assessment.consolidatedActions)
      ? assessment.consolidatedActions
      : [],
    final_status: assessment.finalStatus || '',
    quick_stats,
    suggested_next_step
  };
}

module.exports = { toDashboardReport };
