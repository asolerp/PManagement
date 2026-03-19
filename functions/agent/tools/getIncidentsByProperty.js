/**
 * Tool: lista incidencias de una propiedad (abiertas o todas).
 */
const admin = require('firebase-admin');

const MAX_PROPERTIES_SEARCH = 120;

const schema = {
  type: 'function',
  function: {
    name: 'getIncidentsByProperty',
    description:
      'Lista incidencias de una propiedad por ID o por nombre. Puede devolver solo abiertas o todas.',
    parameters: {
      type: 'object',
      properties: {
        propertyId: {
          type: 'string',
          description: 'ID de la propiedad (houseId).'
        },
        propertyName: {
          type: 'string',
          description:
            'Nombre o parte del nombre/dirección de la propiedad para buscar.'
        },
        includeClosed: {
          type: 'boolean',
          description:
            'Si true incluye incidencias cerradas. Por defecto false (solo abiertas).'
        },
        limit: {
          type: 'number',
          description: 'Máximo de incidencias a devolver (por defecto 25).'
        }
      },
      required: []
    }
  }
};

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

async function findPropertiesByName(db, name) {
  const snap = await db.collection('houses').limit(MAX_PROPERTIES_SEARCH).get();
  const search = name.trim();
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(p => {
      const houseName = String(p.houseName || '');
      const address = String(p.address || p.street || '');
      return fuzzyMatch(houseName, search) || fuzzyMatch(address, search);
    });
}

async function resolveProperty(db, args) {
  const hasId = args?.propertyId && String(args.propertyId).trim();
  const hasName = args?.propertyName && String(args.propertyName).trim();
  if (!hasId && !hasName) {
    return { error: 'Indica propertyId o propertyName.' };
  }

  if (hasId) {
    const snap = await db
      .collection('houses')
      .doc(String(args.propertyId).trim())
      .get();
    if (!snap.exists) {
      return {
        error: `No existe ninguna propiedad con ID "${args.propertyId}".`
      };
    }
    const data = snap.data() || {};
    return { property: { id: snap.id, ...data } };
  }

  const matches = await findPropertiesByName(db, String(args.propertyName));
  if (matches.length === 0) {
    return {
      error: `No hay propiedades que coincidan con "${String(args.propertyName).trim()}".`
    };
  }
  if (matches.length > 1) {
    const lines = matches.map((p, i) => {
      const name = p.houseName || p.address || p.id;
      return `${i + 1}) ${p.id} \u2014 ${name}`;
    });
    return {
      error:
        `Hay varias propiedades que coinciden con "${String(args.propertyName).trim()}". ` +
        `Llama de nuevo con propertyId:\n${lines.join('\n')}`
    };
  }
  return { property: matches[0] };
}

async function run(companyId, args) {
  const db = admin.firestore();
  const resolved = await resolveProperty(db, args || {});
  if (resolved.error) return resolved.error;

  const property = resolved.property;
  const includeClosed = Boolean(args?.includeClosed);
  const limit = Math.min(Number(args?.limit) || 25, 60);

  const snap = await db
    .collection('incidences')
    .where('houseId', '==', property.id)
    .get();
  const incidents = snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(i => (includeClosed ? true : !i.done))
    .slice(0, limit);

  const propName = property.houseName || property.address || property.id;
  if (incidents.length === 0) {
    return includeClosed
      ? `No hay incidencias en la propiedad "${propName}".`
      : `No hay incidencias abiertas en la propiedad "${propName}".`;
  }

  const lines = incidents.map(i => {
    const state = i.state || (i.done ? 'done' : 'iniciada');
    return `- [${i.id}] "${i.title || '(sin título)'}" | Estado: ${state} | ${i.done ? 'cerrada' : 'abierta'}`;
  });
  return `Incidencias en "${propName}" (${incidents.length}):\n${lines.join('\n')}`;
}

module.exports = { schema, run };
