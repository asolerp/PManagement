/**
 * Tool: obtiene los trabajos (jobs) del día: casa, trabajador, franja horaria.
 */
const admin = require('firebase-admin');
const { formatTime } = require('./formatTime');

const schema = {
  type: 'function',
  function: {
    name: 'getJobsByDate',
    description:
      "Obtiene la lista de trabajos (jobs) para una fecha: propiedad, trabajador asignado y franja horaria. Útil para 'qué trabajos hay hoy', 'quién tiene la casa X'.",
    parameters: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description: 'Fecha en formato yyyy-MM-dd. Si no se pasa, se usa hoy.'
        }
      },
      required: []
    }
  }
};

async function run(companyId, args) {
  const date =
    args?.date && /^\d{4}-\d{2}-\d{2}$/.test(args.date)
      ? args.date
      : new Date().toISOString().slice(0, 10);
  const db = admin.firestore();
  const jobsColSnap = await db.collection('jobs').get();
  const todayJobs = jobsColSnap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(j => {
      const jDate = j.date?.toDate
        ? j.date.toDate().toISOString().slice(0, 10)
        : j.date?.seconds
          ? new Date(j.date.seconds * 1000).toISOString().slice(0, 10)
          : null;
      return jDate === date;
    });
  if (todayJobs.length === 0) {
    return `Trabajos del ${date}: ninguno.`;
  }
  const jobHouseIds = [
    ...new Set(todayJobs.map(j => j.houseId).filter(Boolean))
  ];
  const jobHouseNames = {};
  for (const hid of jobHouseIds) {
    const h = await db.collection('houses').doc(hid).get();
    jobHouseNames[hid] = h.exists
      ? h.data().houseName || h.data().address || hid
      : hid;
  }
  const jobLines = todayJobs.map(j => {
    const houseName = j.houseId
      ? jobHouseNames[j.houseId] || j.house?.houseName
      : j.house?.houseName || '?';
    const workerName = j.workers?.[0]
      ? [j.workers[0].firstName, j.workers[0].lastName]
          .filter(Boolean)
          .join(' ') || j.workers[0].email
      : 'Sin asignar';
    const start = formatTime(j.quadrantStartHour ?? j.startHour);
    const end = formatTime(j.quadrantEndHour ?? j.endHour);
    return `- ${houseName} | ${workerName} | ${start}–${end}`;
  });
  return `Trabajos del ${date} (${todayJobs.length}):\n${jobLines.join('\n')}`;
}

module.exports = { schema, run };
