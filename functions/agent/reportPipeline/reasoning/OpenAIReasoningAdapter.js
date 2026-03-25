/**
 * Adaptador OpenAI para la capa de reasoning.
 * Recibe ExtractionResult y devuelve OperationalAssessment (JSON).
 */

const OPENAI_API = 'https://api.openai.com/v1/chat/completions';
const {
  REASONING_SYSTEM,
  reasoningUserMessage
} = require('../prompts/reasoningPrompt');
const { logMetric } = require('../../../lib/obsLogger');

const COST_PER_1M_INPUT = 0.15;
const COST_PER_1M_OUTPUT = 0.6;

const VALID_PRIORITIES = ['critical', 'high', 'medium', 'low', 'none'];
const VALID_CATEGORIES = [
  'safety',
  'cleanliness',
  'maintenance',
  'amenities',
  'cosmetic'
];
const VALID_EVIDENCE = ['audio', 'visual', 'both', 'inference'];
const VALID_CONFIDENCE = ['high', 'medium', 'low'];

function normalizeIssue(raw) {
  return {
    issueId:
      typeof raw.issueId === 'string' ? raw.issueId.trim() : `i${Date.now()}`,
    title: typeof raw.title === 'string' ? raw.title.trim() : 'Sin título',
    category: VALID_CATEGORIES.includes(raw.category)
      ? raw.category
      : 'maintenance',
    priority: VALID_PRIORITIES.includes(raw.priority) ? raw.priority : 'medium',
    location: typeof raw.location === 'string' ? raw.location.trim() : '',
    description:
      typeof raw.description === 'string' ? raw.description.trim() : '',
    impact: typeof raw.impact === 'string' ? raw.impact.trim() : '',
    recommendedAction:
      typeof raw.recommendedAction === 'string'
        ? raw.recommendedAction.trim()
        : '',
    evidenceFactIds: Array.isArray(raw.evidenceFactIds)
      ? raw.evidenceFactIds
      : [],
    evidenceSource: VALID_EVIDENCE.includes(raw.evidenceSource)
      ? raw.evidenceSource
      : 'audio',
    confidence: VALID_CONFIDENCE.includes(raw.confidence)
      ? raw.confidence
      : 'medium'
  };
}

/**
 * @param {string} apiKey
 * @param {object} extractionResult - ExtractionResult (propertyName, location, facts)
 * @param {object} [metadata] - opcional: propertyId, inspectionType, etc.
 * @param {string} [transcript] - transcript original para generar transcriptionSummary
 * @returns {Promise<{ mainContext: string, transcriptionSummary: string, reportTitle?: string, tasksPerformed?: string[], overallPriority: string, requiresImmediateAction: boolean, issues: object[], consolidatedActions?: string[], finalStatus?: string }>}
 */
async function reasonWithOpenAI(
  apiKey,
  extractionResult,
  metadata = {},
  transcript = ''
) {
  const metadataStr = JSON.stringify(metadata, null, 2);
  const t0 = Date.now();
  const res = await fetch(OPENAI_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: REASONING_SYSTEM },
        {
          role: 'user',
          content: reasoningUserMessage(
            extractionResult,
            metadataStr,
            transcript
          )
        }
      ],
      max_tokens: 2000,
      temperature: 0.2,
      response_format: { type: 'json_object' }
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI reasoning error: ${res.status} ${err}`);
  }

  const data = await res.json();
  const latencyMs = Date.now() - t0;
  const promptTokens = data.usage?.prompt_tokens || 0;
  const completionTokens = data.usage?.completion_tokens || 0;
  const costUSD =
    (promptTokens / 1_000_000) * COST_PER_1M_INPUT +
    (completionTokens / 1_000_000) * COST_PER_1M_OUTPUT;
  logMetric('pipeline_reasoning', {
    model: 'gpt-4o-mini',
    promptTokens,
    completionTokens,
    costUSD,
    latencyMs
  });
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error('Empty reasoning response');

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (_) {
    throw new Error('La respuesta de reasoning no es JSON válido');
  }

  const mainContext =
    typeof parsed.mainContext === 'string' ? parsed.mainContext.trim() : '';
  const transcriptionSummary =
    typeof parsed.transcriptionSummary === 'string'
      ? parsed.transcriptionSummary.trim()
      : mainContext;
  const overallPriority = VALID_PRIORITIES.includes(parsed.overallPriority)
    ? parsed.overallPriority
    : 'none';
  const requiresImmediateAction = Boolean(parsed.requiresImmediateAction);
  const issues = Array.isArray(parsed.issues)
    ? parsed.issues.map(normalizeIssue)
    : [];
  const reportTitle =
    typeof parsed.reportTitle === 'string' ? parsed.reportTitle.trim() : '';
  const tasksPerformed = Array.isArray(parsed.tasksPerformed)
    ? parsed.tasksPerformed
        .map(t => String(t || '').trim())
        .filter(Boolean)
        .slice(0, 20)
    : [];
  const consolidatedActions = Array.isArray(parsed.consolidatedActions)
    ? parsed.consolidatedActions
        .map(a => String(a || '').trim())
        .filter(Boolean)
        .slice(0, 20)
    : [];
  const finalStatus =
    typeof parsed.finalStatus === 'string' ? parsed.finalStatus.trim() : '';

  return {
    mainContext,
    transcriptionSummary,
    reportTitle,
    tasksPerformed,
    overallPriority,
    requiresImmediateAction,
    issues,
    consolidatedActions,
    finalStatus
  };
}

module.exports = { reasonWithOpenAI };
