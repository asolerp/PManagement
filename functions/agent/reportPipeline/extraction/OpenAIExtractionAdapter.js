/**
 * Adaptador OpenAI para la capa de extracción.
 * Llama al modelo con prompt de extracción y devuelve ExtractionResult (JSON).
 */

const OPENAI_API = 'https://api.openai.com/v1/chat/completions';
const {
  EXTRACTION_SYSTEM,
  extractionUserMessage
} = require('../prompts/extractionPrompt');

/**
 * @param {string} apiKey
 * @param {string} transcript
 * @returns {Promise<{ propertyName?: string, location?: string, facts: Array<{ factId: string, source: string, kind: string, text: string, location?: string, object?: string, confidence?: number }>, tasksPerformed?: string[] }>}
 */
async function extractWithOpenAI(apiKey, transcript) {
  const res = await fetch(OPENAI_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: EXTRACTION_SYSTEM },
        { role: 'user', content: extractionUserMessage(transcript) }
      ],
      max_tokens: 1500,
      temperature: 0.2,
      response_format: { type: 'json_object' }
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI extraction error: ${res.status} ${err}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error('Empty extraction response');

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (_) {
    throw new Error('La respuesta de extracción no es JSON válido');
  }

  const propertyName =
    typeof parsed.propertyName === 'string' ? parsed.propertyName.trim() : '';
  const location =
    typeof parsed.location === 'string' ? parsed.location.trim() : '';
  const facts = Array.isArray(parsed.facts)
    ? parsed.facts
        .filter(
          f => f && typeof f.factId === 'string' && typeof f.text === 'string'
        )
        .map(f => ({
          factId: String(f.factId).trim(),
          source: f.source === 'visual' ? 'visual' : 'audio',
          kind: [
            'issue',
            'state',
            'observation',
            'missing_item',
            'damage',
            'hazard'
          ].includes(f.kind)
            ? f.kind
            : 'issue',
          text: String(f.text).trim(),
          location:
            typeof f.location === 'string' ? f.location.trim() : undefined,
          object: typeof f.object === 'string' ? f.object.trim() : undefined,
          confidence:
            typeof f.confidence === 'number'
              ? Math.max(0, Math.min(1, f.confidence))
              : undefined
        }))
    : [];
  const tasksPerformed = Array.isArray(parsed.tasksPerformed)
    ? parsed.tasksPerformed
        .map(t => String(t || '').trim())
        .filter(Boolean)
        .slice(0, 20)
    : [];

  return { propertyName, location, facts, tasksPerformed };
}

module.exports = { extractWithOpenAI };
