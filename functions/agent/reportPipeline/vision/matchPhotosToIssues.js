/**
 * Usa GPT-4o-mini Vision para relacionar fotos del reporte con incidencias.
 * detail:"low" = 85 tokens/imagen → coste mínimo.
 *
 * Pricing (gpt-4o-mini, 2024-2025):
 *   input:  $0.15 / 1M tokens
 *   output: $0.60 / 1M tokens
 *   1 imagen low-detail ≈ 85 tokens → ~$0.000013
 *
 * Con 5 fotos + prompt ≈ 600 tokens input + ~200 output ≈ $0.0002 por llamada.
 */

const OPENAI_API = 'https://api.openai.com/v1/chat/completions';
const { logMetric } = require('../../../lib/obsLogger');
const MODEL = 'gpt-4o-mini';
const MAX_PHOTOS = 10;
const MAX_OUTPUT_TOKENS = 500;

const COST_PER_1M_INPUT = 0.15;
const COST_PER_1M_OUTPUT = 0.6;

function estimateCostUSD(promptTokens, completionTokens) {
  return (
    (promptTokens / 1_000_000) * COST_PER_1M_INPUT +
    (completionTokens / 1_000_000) * COST_PER_1M_OUTPUT
  );
}

/**
 * @param {string} apiKey
 * @param {string[]} photoUrls - URLs de las fotos del reporte (max MAX_PHOTOS)
 * @param {{ title: string, description?: string, location?: string }[]} issues - Incidencias del pipeline
 * @returns {Promise<{ assignments: Record<number, number[]>, usage: { promptTokens: number, completionTokens: number, totalTokens: number, estimatedCostUSD: number } }>}
 *   assignments: { issueIndex: [photoIndex, ...] }
 */
async function matchPhotosToIssues(apiKey, photoUrls, issues) {
  if (!photoUrls?.length || !issues?.length) {
    return { assignments: {}, usage: null };
  }

  const t0 = Date.now();
  const photos = photoUrls.slice(0, MAX_PHOTOS);

  const issueList = issues
    .map(
      (iss, i) =>
        `[${i}] "${iss.title}"${iss.location ? ` (${iss.location})` : ''}${iss.description ? ` - ${iss.description}` : ''}`
    )
    .join('\n');

  const imageContent = photos.map(url => ({
    type: 'image_url',
    image_url: { url, detail: 'low' }
  }));

  const userContent = [
    {
      type: 'text',
      text: `Tienes ${photos.length} foto(s) numeradas del 0 al ${photos.length - 1} (en el orden que aparecen) y estas incidencias:\n\n${issueList}\n\nPara cada foto, indica a qué incidencia(s) corresponde basándote en lo que se ve.\nSi una foto no corresponde claramente a ninguna, usa -1.\n\nResponde SOLO con JSON válido, sin explicaciones:\n{ "matches": [ { "photo": 0, "issues": [0] }, { "photo": 1, "issues": [1, 2] } ] }`
    },
    ...imageContent
  ];

  const res = await fetch(OPENAI_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content:
            'Eres un asistente de inspección. Relaciona fotos con incidencias. Sé conservador: solo asigna una foto si realmente muestra el problema descrito. Responde únicamente con JSON.'
        },
        { role: 'user', content: userContent }
      ],
      max_tokens: MAX_OUTPUT_TOKENS,
      temperature: 0.1,
      response_format: { type: 'json_object' }
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Vision matching error: ${res.status} ${err}`);
  }

  const data = await res.json();
  const latencyMs = Date.now() - t0;
  const rawUsage = data.usage || {};
  const promptTokens = rawUsage.prompt_tokens || 0;
  const completionTokens = rawUsage.completion_tokens || 0;
  const totalTokens = promptTokens + completionTokens;
  const estimatedCostUSD = estimateCostUSD(promptTokens, completionTokens);

  const usage = {
    promptTokens,
    completionTokens,
    totalTokens,
    estimatedCostUSD
  };

  logMetric('vision', {
    model: MODEL,
    promptTokens,
    completionTokens,
    costUSD: estimatedCostUSD,
    latencyMs,
    photoCount: photos.length,
    issueCount: issues.length
  });

  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) {
    return { assignments: {}, usage };
  }

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (_) {
    console.warn('[VISION] Could not parse response as JSON:', content);
    return { assignments: {}, usage };
  }

  const assignments = {};
  const matches = Array.isArray(parsed.matches) ? parsed.matches : [];
  for (const m of matches) {
    const photoIdx =
      typeof m.photo === 'number' ? m.photo : parseInt(m.photo, 10);
    if (Number.isNaN(photoIdx) || photoIdx < 0 || photoIdx >= photos.length)
      continue;

    const issueIdxs = Array.isArray(m.issues) ? m.issues : [];
    for (const iIdx of issueIdxs) {
      const idx = typeof iIdx === 'number' ? iIdx : parseInt(iIdx, 10);
      if (Number.isNaN(idx) || idx < 0 || idx >= issues.length) continue;
      if (!assignments[idx]) assignments[idx] = [];
      if (!assignments[idx].includes(photoIdx)) {
        assignments[idx].push(photoIdx);
      }
    }
  }

  for (const key of Object.keys(assignments)) {
    assignments[key].sort((a, b) => a - b);
  }

  return { assignments, usage };
}

module.exports = { matchPhotosToIssues };
