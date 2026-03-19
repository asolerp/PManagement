/**
 * Helper para estado de plazos objetivo (incidencias y trabajos).
 * @typedef {'ok' | 'at_risk' | 'breached'} SlaStatus
 */

const AT_RISK_THRESHOLD = 0.25; // < 25% del tiempo restante → at_risk

/**
 * Calcula el estado de plazo de una incidencia.
 * @param {{ responseDueAt?: any; resolutionDueAt?: any; done?: boolean }} doc
 * @returns {{ status: SlaStatus; label: string; forResolution?: boolean } | null }
 */
export function getIncidenceSlaStatus(doc) {
  if (!doc || doc.done) return null;
  const now = Date.now();
  const resolutionDue = doc.resolutionDueAt?.toMillis?.() ?? doc.resolutionDueAt;
  const responseDue = doc.responseDueAt?.toMillis?.() ?? doc.responseDueAt;
  if (!resolutionDue) return null;

  if (now > resolutionDue) {
    return { status: 'breached', label: 'Fuera de plazo' };
  }

  const total = resolutionDue - (doc.createdAt?.toMillis?.() ?? doc.createdAt ?? now);
  const remaining = resolutionDue - now;
  if (total <= 0) return { status: 'ok', label: 'En plazo' };
  const ratio = remaining / total;

  if (ratio < AT_RISK_THRESHOLD) {
    return { status: 'at_risk', label: 'Plazo en riesgo' };
  }

  if (responseDue && now > responseDue) {
    return { status: 'at_risk', label: 'Respuesta pendiente', forResolution: false };
  }

  return { status: 'ok', label: 'En plazo' };
}

/**
 * Calcula el estado de plazo de un trabajo.
 * @param {{ resolutionDueAt?: any; done?: boolean; status?: string }} doc
 * @returns {{ status: SlaStatus; label: string } | null }
 */
export function getJobSlaStatus(doc) {
  if (!doc) return null;
  const done = doc.done === true || doc.status === 'done' || doc.status === 'completed';
  if (done) return null;
  const resolutionDue = doc.resolutionDueAt?.toMillis?.() ?? doc.resolutionDueAt;
  if (!resolutionDue) return null;

  const now = Date.now();
  if (now > resolutionDue) {
    return { status: 'breached', label: 'Fuera de plazo' };
  }

  const total = resolutionDue - (doc.createdAt?.toMillis?.() ?? doc.createdAt ?? now);
  const remaining = resolutionDue - now;
  if (total <= 0) return { status: 'ok', label: 'En plazo' };
  const ratio = remaining / total;

  if (ratio < AT_RISK_THRESHOLD) {
    return { status: 'at_risk', label: 'Plazo en riesgo' };
  }
  return { status: 'ok', label: 'En plazo' };
}

/** Estados considerados "en curso" para detectar estancamiento */
const OPEN_STATES = ['initiate', 'process', 'iniciada', 'proceso', 'asignada', 'en_espera', 'espera'];

/** Umbral en días: sin cambio de estado desde hace más de X días → estancada */
export const STALE_INCIDENCE_DAYS = 3;

/**
 * Calcula si una incidencia está estancada y los días sin cambio de estado.
 * @param {{ state?: string; done?: boolean; stateUpdatedAt?: any }} doc
 * @returns {{ isStale: boolean; daysWithoutChange: number } | null }
 */
export function getIncidenceStaleInfo(doc) {
  if (!doc || doc.done === true) return null;
  const state = (doc.state || '').toLowerCase();
  if (!OPEN_STATES.includes(state)) return null;

  const raw = doc.stateUpdatedAt?.toMillis?.() ?? doc.stateUpdatedAt;
  if (raw == null) return null;

  const updatedAt = typeof raw === 'number' ? raw : (raw.seconds ? raw.seconds * 1000 : null);
  if (updatedAt == null || isNaN(updatedAt)) return null;

  const now = Date.now();
  const diffMs = now - updatedAt;
  const daysWithoutChange = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  const isStale = daysWithoutChange >= STALE_INCIDENCE_DAYS;

  return { isStale, daysWithoutChange };
}
