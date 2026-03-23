/**
 * Crea un documento de reporte de inspección (voz + fotos) en Firestore.
 * Single-tenant: sin companyId en queries ni documentos. Colección houses en vez de properties.
 */

const admin = require('firebase-admin');

const MAX_PROPERTIES_SEARCH = 100;
const MAX_SIMILAR_SUGGESTIONS = 6;

function similarityScore(name, search) {
  if (!search) return 0;
  const n = (name || '').trim().toLowerCase();
  const s = search.trim().toLowerCase();
  if (n === s) return 100;
  if (n.includes(s)) return 80;
  if (s.includes(n)) return 60;
  let common = 0;
  let si = 0;
  for (let i = 0; i < n.length && si < s.length; i++) {
    if (n[i] === s[si]) {
      common++;
      si++;
    }
  }
  if (common > 0)
    return 30 + Math.min(20, Math.floor((common / s.length) * 20));
  return 0;
}

const STOP_WORDS = new Set([
  'la',
  'el',
  'los',
  'las',
  'de',
  'del',
  'en',
  'un',
  'una',
  'unos',
  'unas',
  'a',
  'al',
  'y',
  'o',
  'casa',
  'propiedad'
]);

function normalizeWords(str) {
  return str
    .toLowerCase()
    .replace(/[^a-záéíóúüñ0-9\s]/gi, ' ')
    .split(/\s+/)
    .filter(w => w && !STOP_WORDS.has(w));
}

function fuzzyMatch(dbValue, searchValue) {
  if (!dbValue || !searchValue) return false;
  const a = dbValue.toLowerCase();
  const b = searchValue.toLowerCase();
  if (a.includes(b) || b.includes(a)) return true;
  const wordsA = normalizeWords(dbValue);
  const wordsB = normalizeWords(searchValue);
  if (wordsA.length === 0 || wordsB.length === 0) return false;
  const matchedB = wordsB.filter(wb =>
    wordsA.some(wa => wa.includes(wb) || wb.includes(wa))
  );
  return matchedB.length >= Math.min(wordsB.length, wordsA.length);
}

function matchPropertiesByName(snap, propertyName) {
  if (!propertyName || !propertyName.trim()) return [];
  const search = propertyName.trim();
  return snap.docs.filter(d => {
    const data = d.data();
    const name = data.houseName || '';
    const address = data.address || data.street || '';
    return fuzzyMatch(name, search) || fuzzyMatch(address, search);
  });
}

async function findPropertyIdByName(db, propertyName) {
  const snap = await db.collection('houses').limit(MAX_PROPERTIES_SEARCH).get();
  const matches = matchPropertiesByName(snap, propertyName);
  if (matches.length === 1) return matches[0].id;
  return null;
}

async function findPropertiesByCompanyAndName(db, _companyId, propertyName) {
  const snap = await db.collection('houses').limit(MAX_PROPERTIES_SEARCH).get();
  const matches = matchPropertiesByName(snap, propertyName);
  const list = matches.map(d => {
    const data = d.data();
    return { id: d.id, houseName: data.houseName || data.address || d.id };
  });
  return {
    matchCount: list.length,
    propertyId: list.length === 1 ? list[0].id : null,
    matches: list
  };
}

async function findSimilarPropertiesByCompanyAndName(
  db,
  _companyId,
  propertyName,
  limit = MAX_SIMILAR_SUGGESTIONS
) {
  if (!propertyName || !propertyName.trim()) return [];
  const snap = await db.collection('houses').limit(MAX_PROPERTIES_SEARCH).get();
  const search = propertyName.trim();
  const scored = snap.docs.map(d => {
    const data = d.data();
    const name = data.houseName || data.address || d.id;
    const score = Math.max(
      similarityScore(name, search),
      similarityScore(data.address || '', search)
    );
    return { doc: d, name, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored
    .filter(x => x.score > 0)
    .slice(0, limit)
    .map(x => ({
      id: x.doc.id,
      houseName: x.name
    }));
}

async function createReportFromExtraction(
  _companyId,
  extraction,
  transcription,
  photoUrls = []
) {
  const db = admin.firestore();
  const { propertyName, incidents } = extraction;

  const propertyId = await findPropertyIdByName(db, propertyName);

  const docRef = await db.collection('inspectionReports').add({
    propertyName: propertyName || '',
    propertyId: propertyId || null,
    transcription: transcription || '',
    issues: incidents || [],
    photoUrls: Array.isArray(photoUrls) ? photoUrls : [],
    source: 'telegram',
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  const count = (incidents || []).length;
  const message =
    count > 0
      ? `Informe creado con ${count} incidencia${count !== 1 ? 's' : ''} detectada${count !== 1 ? 's' : ''}. Puedes verlo en Reportes en el dashboard y crear las incidencias cuando quieras.`
      : 'Informe creado. Puedes verlo en Reportes en el dashboard.';

  return { reportId: docRef.id, propertyId, message };
}

async function createReportFromPipeline(
  _companyId,
  pipelineResult,
  transcription,
  photoUrls = [],
  overrideProperty = null,
  reportMeta = {}
) {
  const db = admin.firestore();
  const { propertyName, dashboardReport } = pipelineResult;
  const issues = (dashboardReport?.issues || []).map(i => ({
    title: i.title || 'Sin título',
    description: [i.description, i.impact].filter(Boolean).join(' ') || ''
  }));

  const propertyId =
    overrideProperty?.propertyId != null
      ? overrideProperty.propertyId
      : await findPropertyIdByName(
          db,
          overrideProperty?.propertyName || propertyName || ''
        );
  const finalPropertyName =
    overrideProperty?.propertyName?.trim() || propertyName || '';

  const summaryText =
    dashboardReport?.summary?.transcriptionSummary?.trim() || '';
  const reportHeader = {
    title:
      dashboardReport?.report_header?.title ||
      'INFORME DE REVISIÓN' +
        (finalPropertyName ? ` - ${finalPropertyName}` : ''),
    date: new Date().toISOString(),
    responsible:
      reportMeta?.responsibleName ||
      dashboardReport?.report_header?.responsible ||
      '',
    location:
      dashboardReport?.report_header?.location ||
      overrideProperty?.propertyName ||
      finalPropertyName ||
      ''
  };
  const tasksPerformed = Array.isArray(dashboardReport?.tasks_performed)
    ? dashboardReport.tasks_performed
    : [];
  const consolidatedActions = Array.isArray(
    dashboardReport?.consolidated_actions
  )
    ? dashboardReport.consolidated_actions
    : [];
  const finalStatus = dashboardReport?.final_status || '';

  const docRef = await db.collection('inspectionReports').add({
    propertyName: finalPropertyName,
    propertyId: propertyId || null,
    summary: summaryText || null,
    transcription: transcription || '',
    issues,
    photoUrls: Array.isArray(photoUrls) ? photoUrls : [],
    source: 'telegram',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    dashboardReport: dashboardReport || null,
    reportHeader,
    tasksPerformed,
    consolidatedActions,
    finalStatus
  });

  const count = issues.length;
  const message =
    count > 0
      ? `Informe creado con ${count} incidencia${count !== 1 ? 's' : ''} detectada${count !== 1 ? 's' : ''}. Puedes verlo en Reportes en el dashboard y crear las incidencias cuando quieras.`
      : 'Informe creado. Puedes verlo en Reportes en el dashboard.';

  return { reportId: docRef.id, propertyId, message };
}

module.exports = {
  createReportFromExtraction,
  createReportFromPipeline,
  findPropertiesByCompanyAndName,
  findSimilarPropertiesByCompanyAndName
};
