/**
 * Logs estructurados en el admin dashboard (consola del navegador).
 * Formato JSON en una línea para filtrar en DevTools y, si algún día
 * re-exportas la consola a Cloud Logging, indexar por type/source/event.
 */

const SOURCE = 'dashboard';

function emit(level, payload) {
  const line = JSON.stringify(payload);
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
}

/**
 * @param {'info'|'warn'|'error'} level
 * @param {string} event - nombre estable, ej. auth_sign_in_failed
 * @param {Record<string, unknown>} [meta]
 */
export function clientLog(level, event, meta = {}) {
  emit(level, {
    type: 'client_event',
    source: SOURCE,
    level,
    event,
    ts: new Date().toISOString(),
    ...meta
  });
}

/**
 * Error con mensaje/stack serializado (sin pasar el objeto Error entero a JSON).
 * @param {string} event
 * @param {unknown} err
 * @param {Record<string, unknown>} [meta]
 */
export function clientLogError(event, err, meta = {}) {
  const e = err && typeof err === 'object' ? err : null;
  clientLog('error', event, {
    ...meta,
    errorMessage: e?.message != null ? String(e.message) : String(err),
    errorName: e?.name,
    errorCode: e?.code,
    stack: typeof e?.stack === 'string' ? e.stack.slice(0, 600) : undefined
  });
}
