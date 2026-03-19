/**
 * Crea un documento de reporte de inspección (voz + fotos) en Firestore.
 * El dashboard puede listar reportes y crear incidencias individuales desde cada uno.
 */

const admin = require("firebase-admin");

const MAX_PROPERTIES_SEARCH = 100;
const MAX_SIMILAR_SUGGESTIONS = 6;

/** Puntuación por similitud: mismo texto > nombre contiene búsqueda > búsqueda contiene nombre > longitud de subcadena común */
function similarityScore(name, search) {
  if (!search) return 0;
  const n = (name || "").trim().toLowerCase();
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

function matchPropertiesByName(snap, propertyName) {
  if (!propertyName || !propertyName.trim()) return [];
  const search = propertyName.trim().toLowerCase();
  return snap.docs.filter((d) => {
    const data = d.data();
    const name = (data.houseName || "").toLowerCase();
    const address = (data.address || data.street || "").toLowerCase();
    return name.includes(search) || address.includes(search);
  });
}

async function findPropertyIdByCompanyAndName(db, companyId, propertyName) {
  const snap = await db
    .collection("properties")
    .where("companyId", "==", companyId)
    .limit(MAX_PROPERTIES_SEARCH)
    .get();
  const matches = matchPropertiesByName(snap, propertyName);
  if (matches.length === 1) return matches[0].id;
  return null;
}

/**
 * Busca propiedades por companyId y nombre (para validar antes del informe).
 * @returns {{ matchCount: number, propertyId: string|null, matches: Array<{ id: string, houseName: string }> }}
 */
async function findPropertiesByCompanyAndName(db, companyId, propertyName) {
  const snap = await db
    .collection("properties")
    .where("companyId", "==", companyId)
    .limit(MAX_PROPERTIES_SEARCH)
    .get();
  const matches = matchPropertiesByName(snap, propertyName);
  const list = matches.map((d) => {
    const data = d.data();
    return { id: d.id, houseName: data.houseName || data.address || d.id };
  });
  return {
    matchCount: list.length,
    propertyId: list.length === 1 ? list[0].id : null,
    matches: list,
  };
}

/**
 * Busca propiedades con nombre parecido (para sugerir cuando no hay coincidencia exacta).
 * @returns {Promise<Array<{ id: string, houseName: string }>>}
 */
async function findSimilarPropertiesByCompanyAndName(
  db,
  companyId,
  propertyName,
  limit = MAX_SIMILAR_SUGGESTIONS,
) {
  if (!propertyName || !propertyName.trim()) return [];
  const snap = await db
    .collection("properties")
    .where("companyId", "==", companyId)
    .limit(MAX_PROPERTIES_SEARCH)
    .get();
  const search = propertyName.trim();
  const scored = snap.docs.map((d) => {
    const data = d.data();
    const name = data.houseName || data.address || d.id;
    const score = Math.max(
      similarityScore(name, search),
      similarityScore(data.address || "", search),
    );
    return { doc: d, name, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored
    .filter((x) => x.score > 0)
    .slice(0, limit)
    .map((x) => ({
      id: x.doc.id,
      houseName: x.name,
    }));
}

/**
 * Crea un reporte de inspección en la colección inspectionReports.
 * @param {string} companyId
 * @param {{ propertyName: string, incidents: Array<{ title: string, description?: string }> }} extraction
 * @param {string} transcription - Texto transcrito del audio
 * @param {string[]} photoUrls
 * @returns {{ reportId: string, propertyId: string|null, message: string }}
 */
async function createReportFromExtraction(
  companyId,
  extraction,
  transcription,
  photoUrls = [],
) {
  const db = admin.firestore();
  const { propertyName, incidents } = extraction;

  const propertyId = await findPropertyIdByCompanyAndName(
    db,
    companyId,
    propertyName,
  );

  const docRef = await db.collection("inspectionReports").add({
    companyId,
    propertyName: propertyName || "",
    propertyId: propertyId || null,
    transcription: transcription || "",
    issues: incidents || [],
    photoUrls: Array.isArray(photoUrls) ? photoUrls : [],
    source: "telegram",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  const count = (incidents || []).length;
  const message =
    count > 0
      ? `Informe creado con ${count} incidencia${count !== 1 ? "s" : ""} detectada${count !== 1 ? "s" : ""}. Puedes verlo en Reportes en el dashboard y crear las incidencias cuando quieras.`
      : "Informe creado. Puedes verlo en Reportes en el dashboard.";

  return { reportId: docRef.id, propertyId, message };
}

/**
 * Crea un reporte a partir del pipeline de 3 capas (dashboardReport).
 * Persiste dashboardReport y genera issues[] compatibles con ReportesPage.
 * @param {string} companyId
 * @param {{ propertyName: string, dashboardReport: object }} pipelineResult
 * @param {string} transcription
 * @param {string[]} photoUrls
 * @param {{ propertyId: string|null, propertyName: string }|null} overrideProperty - Si viene de elección del usuario (ej. casa similar), usar esto en lugar de resolver por nombre.
 * @returns {{ reportId: string, propertyId: string|null, message: string }}
 */
async function createReportFromPipeline(
  companyId,
  pipelineResult,
  transcription,
  photoUrls = [],
  overrideProperty = null,
) {
  const db = admin.firestore();
  const { propertyName, dashboardReport } = pipelineResult;
  const issues = (dashboardReport?.issues || []).map((i) => ({
    title: i.title || "Sin título",
    description: [i.description, i.impact].filter(Boolean).join(" ") || "",
  }));

  const propertyId =
    overrideProperty?.propertyId != null
      ? overrideProperty.propertyId
      : await findPropertyIdByCompanyAndName(
          db,
          companyId,
          overrideProperty?.propertyName || propertyName || "",
        );
  const finalPropertyName =
    overrideProperty?.propertyName?.trim() || propertyName || "";

  const summaryText =
    dashboardReport?.summary?.transcriptionSummary?.trim() || "";

  const docRef = await db.collection("inspectionReports").add({
    companyId,
    propertyName: finalPropertyName,
    propertyId: propertyId || null,
    summary: summaryText || null,
    transcription: transcription || "",
    issues,
    photoUrls: Array.isArray(photoUrls) ? photoUrls : [],
    source: "telegram",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    dashboardReport: dashboardReport || null,
  });

  const count = issues.length;
  const message =
    count > 0
      ? `Informe creado con ${count} incidencia${count !== 1 ? "s" : ""} detectada${count !== 1 ? "s" : ""}. Puedes verlo en Reportes en el dashboard y crear las incidencias cuando quieras.`
      : "Informe creado. Puedes verlo en Reportes en el dashboard.";

  return { reportId: docRef.id, propertyId, message };
}

module.exports = {
  createReportFromExtraction,
  createReportFromPipeline,
  findPropertiesByCompanyAndName,
  findSimilarPropertiesByCompanyAndName,
};
