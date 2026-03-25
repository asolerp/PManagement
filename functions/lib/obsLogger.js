/**
 * Logger de observabilidad para Firebase Functions.
 * Pushea logs y métricas a Grafana Loki via HTTP Push API.
 *
 * Cobertura actual (añadir logEvent/logMetric en nuevas rutas críticas):
 * - llm.js, pipeline extraction/reasoning/vision, telegramWebhook, createInspectionReport,
 *   scheduledDailySummary / sendDailySummaryNow.
 *
 * Fire-and-forget: no bloquea la ejecución si Grafana no responde.
 *
 * Uso:
 *   const { logMetric, logEvent } = require('../lib/obsLogger');
 *   logMetric('llm', { model, promptTokens, completionTokens, costUSD, latencyMs });
 *   logEvent('info', 'webhook', 'request_complete', { userId, durationMs });
 *   logEvent('error', 'webhook', 'Unhandled error', { stack });
 */

const {
  grafanaLokiUrl,
  grafanaLokiUser,
  grafanaLokiToken
} = require('../agent/config');

const APP_LABEL = 'portmanagement';
const ENV_LABEL =
  process.env.FUNCTIONS_EMULATOR === 'true' ? 'local' : 'production';

/**
 * Empuja una o varias líneas a Loki.
 * @param {object} stream - labels del stream (ej: { app, env, source, type })
 * @param {string} line - JSON string a registrar
 */
function pushToLoki(stream, line) {
  let url, user, token;
  try {
    url = String(grafanaLokiUrl.value() || '')
      .trim()
      .replace(/\/+$/, '');
    user = String(grafanaLokiUser.value() || '').trim();
    token = String(grafanaLokiToken.value() || '').trim();
  } catch (_) {
    return;
  }

  if (!url || !user || !token) return;

  const nanosTs = `${Date.now()}000000`;
  const body = JSON.stringify({
    streams: [
      {
        stream: { app: APP_LABEL, env: ENV_LABEL, ...stream },
        values: [[nanosTs, line]]
      }
    ]
  });

  const credentials = Buffer.from(`${user}:${token}`).toString('base64');
  const pushUrl = `${url}/loki/api/v1/push`;
  const lokiStreamLabels = { app: APP_LABEL, env: ENV_LABEL, ...stream };

  fetch(pushUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${credentials}`
    },
    body
  })
    .then(async res => {
      const base = {
        type: 'loki_push',
        grafanaLoki: true,
        httpStatus: res.status,
        lokiStream: lokiStreamLabels
      };
      if (res.ok) {
        console.log(JSON.stringify({ ...base, ok: true }));
        return;
      }
      const errText = await res.text().catch(() => '');
      console.warn(
        JSON.stringify({
          ...base,
          ok: false,
          errorBody: errText.slice(0, 400)
        })
      );
    })
    .catch(err => {
      console.warn(
        JSON.stringify({
          type: 'loki_push',
          grafanaLoki: true,
          ok: false,
          httpStatus: null,
          lokiStream: lokiStreamLabels,
          error: err.message
        })
      );
    });
}

/**
 * Registra métricas de tokens/coste/latencia.
 * @param {'llm'|'vision'|'pipeline_extraction'|'pipeline_reasoning'} source
 * @param {{ model?: string, promptTokens?: number, completionTokens?: number, costUSD?: number, latencyMs?: number, [key: string]: any }} data
 */
function logMetric(source, data) {
  const payload = {
    ts: new Date().toISOString(),
    source,
    ...data
  };
  console.log(JSON.stringify({ type: 'metric', ...payload }));
  pushToLoki({ source, type: 'metric' }, JSON.stringify(payload));
}

/**
 * Registra un evento estructurado.
 * @param {'info'|'warn'|'error'} level
 * @param {string} source - origen del evento (ej: 'webhook', 'daily_summary', 'report')
 * @param {string} message
 * @param {object} [meta] - datos adicionales
 */
function logEvent(level, source, message, meta = {}) {
  const payload = {
    ts: new Date().toISOString(),
    level,
    source,
    message,
    ...meta
  };
  if (level === 'error') {
    console.error(JSON.stringify(payload));
  } else {
    console.log(JSON.stringify(payload));
  }
  pushToLoki({ source, type: 'event', level }, JSON.stringify(payload));
}

module.exports = { logMetric, logEvent };
