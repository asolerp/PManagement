/**
 * Tool: lista las incidencias abiertas (título, propiedad, estado, id).
 */
const admin = require('firebase-admin');

const schema = {
  type: 'function',
  function: {
    name: 'getOpenIncidents',
    description:
      "Lista las incidencias abiertas (no cerradas) de la empresa: id, título, propiedad, estado. Útil para 'cuántas incidencias hay', 'dame las incidencias', 'qué incidencias están abiertas'.",
    parameters: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description:
            'Máximo número de incidencias a devolver (por defecto 25)'
        }
      },
      required: []
    }
  }
};

async function run(companyId, args) {
  const limit = Math.min(Number(args?.limit) || 25, 50);
  const db = admin.firestore();
  const snap = await db.collection('incidences').get();
  const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  const open = all.filter(i => !i.done).slice(0, limit);
  const houseIds = [...new Set(open.map(i => i.houseId).filter(Boolean))];
  const houseNames = {};
  for (const hid of houseIds) {
    const h = await db.collection('houses').doc(hid).get();
    houseNames[hid] = h.exists
      ? h.data().houseName || h.data().address || hid
      : hid;
  }
  if (open.length === 0) {
    return `Incidencias abiertas: 0. Total cerradas: ${all.filter(i => i.done).length}.`;
  }
  const lines = open.map(i => {
    const prop = i.houseId
      ? houseNames[i.houseId] || i.houseId
      : 'Sin propiedad';
    return `- [${i.id}] "${i.title || '(sin título)'}" | ${prop} | Estado: ${i.state || '—'}`;
  });
  return `Incidencias abiertas (${open.length}):\n${lines.join('\n')}`;
}

module.exports = { schema, run };
