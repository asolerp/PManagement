/**
 * Obtiene un resumen de datos para inyectar como contexto al LLM.
 * Single-tenant: sin filtro por companyId. Colecciones: houses, incidences, jobs.
 */

const admin = require('firebase-admin');

function formatTime(val) {
  if (!val) return '—';
  const d = val?.toDate ? val.toDate() : new Date(val.seconds * 1000);
  return d.toTimeString().slice(0, 5);
}

async function getCompanyContext(_companyId, dateStr) {
  const db = admin.firestore();

  const date = dateStr || new Date().toISOString().slice(0, 10);
  const parts = [];

  const quadrantsSnap = await db
    .collection('quadrants')
    .where('date', '==', date)
    .get();
  const quadrants = quadrantsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  if (quadrants.length > 0) {
    const q = quadrants[0];
    const jobsSnap = await db
      .collection('quadrants')
      .doc(q.id)
      .collection('jobs')
      .get();
    const jobs = jobsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    jobs.sort((a, b) => (a.routeOrder ?? 0) - (b.routeOrder ?? 0));
    const byWorker = new Map();
    for (const j of jobs) {
      const wid = j.worker?.id ?? j.workersId?.[0] ?? '_';
      if (!byWorker.has(wid)) byWorker.set(wid, []);
      byWorker.get(wid).push(j);
    }
    const workerLines = [];
    for (const [wid, workerJobs] of byWorker) {
      const name =
        workerJobs[0]?.worker?.firstName || workerJobs[0]?.worker?.lastName
          ? [workerJobs[0].worker.firstName, workerJobs[0].worker.lastName]
              .filter(Boolean)
              .join(' ')
          : wid;
      const slots = workerJobs
        .map(j => {
          const houseName = j.house?.houseName || j.houseId || '?';
          return `${houseName} (${formatTime(j.startHour)}–${formatTime(j.endHour)})`;
        })
        .join(', ');
      workerLines.push(`- ${name}: ${slots}`);
    }
    parts.push(`Cuadrante del día ${date}:\n${workerLines.join('\n')}`);
  } else {
    parts.push(`Cuadrante del día ${date}: No hay cuadrante para esta fecha.`);
  }

  const incSnap = await db.collection('incidences').get();
  const allIncidents = incSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const openIncidents = allIncidents.filter(i => !i.done);
  const houseIds = [
    ...new Set(allIncidents.map(i => i.houseId).filter(Boolean))
  ];
  const houseNames = {};
  for (const hid of houseIds) {
    const h = await db.collection('houses').doc(hid).get();
    houseNames[hid] = h.exists
      ? h.data().houseName || h.data().address || hid
      : hid;
  }
  const incidentLines = openIncidents.slice(0, 25).map(i => {
    const prop = i.houseId
      ? houseNames[i.houseId] || i.houseId
      : 'Sin propiedad';
    const state = i.state || '—';
    const title = i.title || '(sin título)';
    const desc = (i.incidence || i.description || '').slice(0, 80);
    return `- [${i.id}] "${title}" | Propiedad: ${prop} | Estado: ${state}${desc ? ` | ${desc}` : ''}`;
  });
  parts.push(
    `Incidencias abiertas (${openIncidents.length}):\n${incidentLines.length ? incidentLines.join('\n') : 'Ninguna.'}`
  );
  const closedCount = allIncidents.filter(i => i.done).length;
  if (closedCount > 0)
    parts.push(`Incidencias cerradas (total): ${closedCount}.`);

  const jobsColSnap = await db.collection('jobs').get();
  const todayJobs = jobsColSnap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(j => {
      const jDate = j.date?.toDate
        ? j.date.toDate().toISOString().slice(0, 10)
        : j.date && j.date.seconds
          ? new Date(j.date.seconds * 1000).toISOString().slice(0, 10)
          : null;
      return jDate === date;
    });
  if (todayJobs.length > 0) {
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
    parts.push(
      `Trabajos del día (${todayJobs.length}):\n${jobLines.join('\n')}`
    );
  } else {
    parts.push('Trabajos del día: ninguno.');
  }

  const checklistsSnap = await db.collection('checklists').get();
  const allChecklists = checklistsSnap.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));
  const checklistHouseIds = [
    ...new Set(allChecklists.map(c => c.houseId).filter(Boolean))
  ];
  const checklistHouseNames = {};
  for (const hid of checklistHouseIds) {
    const h = await db.collection('houses').doc(hid).get();
    checklistHouseNames[hid] = h.exists
      ? h.data().houseName || h.data().address || hid
      : hid;
  }
  const todayChecklists = allChecklists.filter(c => {
    const cDate = c.date?.toDate
      ? c.date.toDate().toISOString().slice(0, 10)
      : c.date?.seconds
        ? new Date(c.date.seconds * 1000).toISOString().slice(0, 10)
        : null;
    return cDate === date;
  });
  const openChecklists = todayChecklists.filter(c => !c.finished);
  if (openChecklists.length > 0) {
    const checklistLines = openChecklists.slice(0, 15).map(c => {
      const houseName = c.houseId
        ? checklistHouseNames[c.houseId] ||
          c.house?.[0]?.houseName ||
          c.house?.houseName
        : c.house?.[0]?.houseName || c.house?.houseName || '?';
      const progress = `${c.done ?? 0}/${c.total ?? 0}`;
      return `- [${c.id}] ${houseName} | progreso: ${progress}`;
    });
    parts.push(
      `Revisiones del día (${openChecklists.length} abiertas):\n${checklistLines.join('\n')}`
    );
  }
  const finishedToday = todayChecklists.filter(c => c.finished).length;
  if (finishedToday > 0) {
    parts.push(`Revisiones finalizadas hoy: ${finishedToday}.`);
  }
  if (openChecklists.length === 0 && finishedToday === 0) {
    parts.push('Revisiones del día: ninguna.');
  }

  return parts.join('\n\n');
}

module.exports = {
  getCompanyContext
};
