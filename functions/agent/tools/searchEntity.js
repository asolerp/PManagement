/**
 * Tool: búsqueda global por texto en entidades operativas.
 */
const admin = require('firebase-admin');

function includesText(value, q) {
  return String(value || '')
    .toLowerCase()
    .includes(q);
}

const schema = {
  type: 'function',
  function: {
    name: 'searchEntity',
    description:
      'Busca por texto en incidencias, trabajos, checklists y propiedades; devuelve coincidencias agrupadas.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Texto a buscar.'
        },
        limitPerType: {
          type: 'number',
          description: 'Máximo por tipo (por defecto 5).'
        }
      },
      required: ['query']
    }
  }
};

async function run(companyId, args) {
  const query = String(args?.query || '')
    .trim()
    .toLowerCase();
  if (!query) return 'Debes indicar query.';
  const limit = Math.min(Math.max(1, Number(args?.limitPerType) || 5), 20);
  const db = admin.firestore();
  const [incidentsSnap, jobsSnap, checklistsSnap, propertiesSnap] =
    await Promise.all([
      db.collection('incidences').get(),
      db.collection('jobs').get(),
      db.collection('checklists').get(),
      db.collection('houses').get()
    ]);

  const incidents = incidentsSnap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(i =>
      [i.title, i.incidence, i.description, i.state].some(x =>
        includesText(x, query)
      )
    )
    .slice(0, limit);
  const jobs = jobsSnap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(j =>
      [j.title, j.jobName, j.observations, j.status].some(x =>
        includesText(x, query)
      )
    )
    .slice(0, limit);
  const checklists = checklistsSnap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(c =>
      [
        c.observations,
        c.house?.houseName,
        c.house?.[0]?.houseName,
        c.houseId
      ].some(x => includesText(x, query))
    )
    .slice(0, limit);
  const properties = propertiesSnap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(p =>
      [p.houseName, p.address, p.street].some(x => includesText(x, query))
    )
    .slice(0, limit);

  if (
    incidents.length === 0 &&
    jobs.length === 0 &&
    checklists.length === 0 &&
    properties.length === 0
  ) {
    return `No encontré resultados para "${args.query}".`;
  }

  const lines = [`Resultados para "${args.query}":`];
  if (incidents.length) {
    lines.push(`Incidencias (${incidents.length}):`);
    incidents.forEach(i => {
      lines.push(
        `- [${i.id}] ${i.title || '(sin título)'} | estado: ${i.state || '\u2014'}`
      );
    });
  }
  if (jobs.length) {
    lines.push(`Trabajos (${jobs.length}):`);
    jobs.forEach(j => {
      lines.push(
        `- [${j.id}] ${j.title || j.jobName || '(sin título)'} | estado: ${j.status || '\u2014'}`
      );
    });
  }
  if (checklists.length) {
    lines.push(`Checklists (${checklists.length}):`);
    checklists.forEach(c => {
      const house =
        c.house?.[0]?.houseName || c.house?.houseName || c.houseId || '\u2014';
      lines.push(
        `- [${c.id}] ${house} | progreso: ${c.done ?? 0}/${c.total ?? 0}`
      );
    });
  }
  if (properties.length) {
    lines.push(`Propiedades (${properties.length}):`);
    properties.forEach(p => {
      lines.push(
        `- [${p.id}] ${p.houseName || '(sin nombre)'} | ${p.address || p.street || '\u2014'}`
      );
    });
  }
  return lines.join('\n');
}

module.exports = { schema, run };
