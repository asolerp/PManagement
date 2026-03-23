/**
 * Orquestador del pipeline: Extraction → Reasoning → Rules → Presentation.
 * Entrada: transcript + (opcional) imageUrls, metadata.
 * Salida: propertyName + dashboardReport para persistir y mostrar en UI.
 */

const { extractWithOpenAI } = require('./extraction/OpenAIExtractionAdapter');
const { reasonWithOpenAI } = require('./reasoning/OpenAIReasoningAdapter');
const { runRules } = require('./rules/rulesEngine');
const { toDashboardReport } = require('./presentation/dashboardReportMapper');

/**
 * Ejecuta el pipeline completo de reporte.
 * @param {string} apiKey - OpenAI API key
 * @param {string} transcript - Texto transcrito del audio
 * @param {string[]} [imageUrls] - URLs de fotos (reservado para futura extracción visual)
 * @param {object} [metadata] - propertyId, inspectionType, etc. para reasoning
 * @returns {Promise<{ propertyName: string, dashboardReport: object, extractionResult: object, assessment: object }>}
 */
async function runReportPipeline(
  apiKey,
  transcript,
  _imageUrls = [],
  metadata = {}
) {
  const extractionResult = await extractWithOpenAI(apiKey, transcript);
  const reasoningInput = {
    propertyName: extractionResult.propertyName,
    location: extractionResult.location,
    facts: extractionResult.facts,
    tasksPerformed: extractionResult.tasksPerformed || []
  };
  const assessmentRaw = await reasonWithOpenAI(
    apiKey,
    reasoningInput,
    metadata,
    transcript
  );
  const assessment = runRules(assessmentRaw);
  assessment.location = extractionResult.location || metadata.location || '';
  assessment.responsible = metadata.responsibleName || '';
  assessment.reportDate = metadata.reportDate || new Date().toISOString();
  if (!assessment.reportTitle && extractionResult.propertyName) {
    assessment.reportTitle = `INFORME DE REVISIÓN - ${extractionResult.propertyName.toUpperCase()}`;
  }
  if (!Array.isArray(assessment.tasksPerformed)) {
    assessment.tasksPerformed = extractionResult.tasksPerformed || [];
  }
  const dashboardReport = toDashboardReport(assessment);
  if (assessment.transcriptionSummary) {
    dashboardReport.summary = dashboardReport.summary || {};
    dashboardReport.summary.transcriptionSummary =
      assessment.transcriptionSummary;
  }

  return {
    propertyName: extractionResult.propertyName || '',
    dashboardReport,
    extractionResult,
    assessment
  };
}

module.exports = { runReportPipeline };
