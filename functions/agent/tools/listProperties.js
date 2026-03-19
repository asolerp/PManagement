/**
 * Tool: lista las propiedades (casas).
 */
const admin = require('firebase-admin');

const schema = {
  type: 'function',
  function: {
    name: 'listProperties',
    description:
      "Lista TODAS las propiedades (casas): id, nombre, dirección. Útil para 'cuántas casas hay', 'lista de propiedades', 'qué casas tenemos', 'muéstrame todas las casas'.",
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  }
};

async function run() {
  const db = admin.firestore();
  const snap = await db.collection('houses').orderBy('houseName').get();
  const list = snap.docs.map(d => {
    const data = d.data();
    const name = data.houseName || data.address || '(sin nombre)';
    const addr = data.address || data.street || '—';
    return `- [${d.id}] ${name} | ${addr}`;
  });
  if (list.length === 0) {
    return 'No hay propiedades registradas.';
  }
  return `Propiedades (${list.length}):\n${list.join('\n')}`;
}

module.exports = { schema, run };
