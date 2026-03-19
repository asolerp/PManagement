/**
 * Tool: resumen operativo del día con activos y vencimientos cercanos.
 */
const admin = require('firebase-admin');

function toDate(value) {
  if (!value) return null;
  if (value?.toDate && typeof value.toDate === 'function')
    return value.toDate();
  if (typeof value?.seconds === 'number') return new Date(value.seconds * 1000);
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatDateTime(value) {
  const d = toDate(value);
  if (!d) return '\u2014';
  return d.toISOString().slice(0, 16).replace('T', ' ');
}

function ymd(value) {
  const d = toDate(value);
  return d ? d.toISOString().slice(0, 10) : null;
}

const schema = {
  type: 'function',
  function: {
    name: 'getDailyOpsSummary',
    description:
      'Devuelve un resumen operativo del día: incidencias activas, trabajos del día pendientes, revisiones abiertas y vencimientos cercanos/atrasados.',
    parameters: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description:
            'Fecha base en formato yyyy-MM-dd. Si no se pasa, se usa hoy.'
        },
        dueInHours: {
          type: 'number',
          description:
            'Ventana para considerar vencimientos cercanos, en horas. Por defecto 24.'
        },
        limit: {
          type: 'number',
          description:
            'Máximo de items por sección de detalle (por defecto 8, máximo 20).'
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
  const dueInHours = Math.max(1, Number(args?.dueInHours) || 24);
  const limit = Math.min(Math.max(1, Number(args?.limit) || 8), 20);

  const db = admin.firestore();
  const now = new Date();
  const dueThreshold = new Date(now.getTime() + dueInHours * 60 * 60 * 1000);

  const [incidentsSnap, jobsSnap, checklistsSnap] = await Promise.all([
    db.collection('incidences').get(),
    db.collection('jobs').get(),
    db.collection('checklists').get()
  ]);

  const incidents = incidentsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const jobs = jobsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const checklists = checklistsSnap.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));

  const activeIncidents = incidents.filter(i => !i.done);
  const incidentsDueSoon = activeIncidents
    .filter(i => {
      const due = toDate(i.responseDueAt || i.resolutionDueAt);
      return due && due > now && due <= dueThreshold;
    })
    .sort(
      (a, b) =>
        toDate(a.responseDueAt || a.resolutionDueAt) -
        toDate(b.responseDueAt || b.resolutionDueAt)
    );
  const incidentsOverdue = activeIncidents
    .filter(i => {
      const due = toDate(i.responseDueAt || i.resolutionDueAt);
      return due && due < now;
    })
    .sort(
      (a, b) =>
        toDate(a.responseDueAt || a.resolutionDueAt) -
        toDate(b.responseDueAt || b.resolutionDueAt)
    );

  const jobsTodayOpen = jobs
    .filter(j => ymd(j.date) === date)
    .filter(j => !(j.done || j.status === 'done' || j.status === 'cancelled'));
  const jobsOverdue = jobs
    .filter(j => {
      const d = ymd(j.date);
      return (
        d &&
        d < date &&
        !(j.done || j.status === 'done' || j.status === 'cancelled')
      );
    })
    .sort((a, b) => String(ymd(a.date)).localeCompare(String(ymd(b.date))));

  const checklistsOpen = checklists.filter(c => !c.finished);
  const checklistsTodayOpen = checklistsOpen.filter(c => ymd(c.date) === date);
  const checklistsOverdue = checklistsOpen
    .filter(c => {
      const d = ymd(c.date);
      return d && d < date;
    })
    .sort((a, b) => String(ymd(a.date)).localeCompare(String(ymd(b.date))));

  const lines = [];
  lines.push(`Para el día ${date}, este es el resumen operativo:`);
  lines.push(
    `\u2022 Hay ${activeIncidents.length} incidencia${activeIncidents.length !== 1 ? 's' : ''} abierta${activeIncidents.length !== 1 ? 's' : ''}.`
  );
  lines.push(
    `\u2022 Hay ${jobsTodayOpen.length} trabajo${jobsTodayOpen.length !== 1 ? 's' : ''} pendiente${jobsTodayOpen.length !== 1 ? 's' : ''} para hoy.`
  );
  lines.push(
    `\u2022 Hay ${checklistsOpen.length} revisión${checklistsOpen.length !== 1 ? 'es' : ''} abierta${checklistsOpen.length !== 1 ? 's' : ''}.`
  );

  if (incidentsDueSoon.length > 0) {
    lines.push('');
    lines.push(
      `En las próximas ${dueInHours} horas vencen ${incidentsDueSoon.length} incidencia${incidentsDueSoon.length !== 1 ? 's' : ''}:`
    );
    incidentsDueSoon.slice(0, limit).forEach((i, idx) => {
      lines.push(
        `${idx + 1}. ${i.title || '(sin título)'} (estado: ${i.state || '\u2014'}, vence: ${formatDateTime(i.responseDueAt || i.resolutionDueAt)}).`
      );
    });
  } else {
    lines.push('');
    lines.push(
      `No hay incidencias que venzan en las próximas ${dueInHours} horas.`
    );
  }

  if (incidentsOverdue.length > 0) {
    lines.push('');
    lines.push(
      `Además, hay ${incidentsOverdue.length} incidencia${incidentsOverdue.length !== 1 ? 's' : ''} ya vencida${incidentsOverdue.length !== 1 ? 's' : ''}:`
    );
    incidentsOverdue.slice(0, limit).forEach((i, idx) => {
      lines.push(
        `${idx + 1}. ${i.title || '(sin título)'} (estado: ${i.state || '\u2014'}, vencía: ${formatDateTime(i.responseDueAt || i.resolutionDueAt)}).`
      );
    });
  }

  if (jobsOverdue.length > 0) {
    lines.push('');
    lines.push(
      `Hay ${jobsOverdue.length} trabajo${jobsOverdue.length !== 1 ? 's' : ''} atrasado${jobsOverdue.length !== 1 ? 's' : ''}:`
    );
    jobsOverdue.slice(0, limit).forEach((j, idx) => {
      lines.push(
        `${idx + 1}. ${j.title || j.jobName || '(sin título)'} (fecha prevista: ${ymd(j.date) || '\u2014'}, estado: ${j.status || 'pending'}).`
      );
    });
  } else {
    lines.push('');
    lines.push('No hay trabajos atrasados.');
  }

  if (checklistsTodayOpen.length > 0) {
    lines.push('');
    lines.push(
      `Para hoy quedan ${checklistsTodayOpen.length} revisión${checklistsTodayOpen.length !== 1 ? 'es' : ''} abierta${checklistsTodayOpen.length !== 1 ? 's' : ''}:`
    );
    checklistsTodayOpen.slice(0, limit).forEach((c, idx) => {
      lines.push(
        `${idx + 1}. ${c.house?.[0]?.houseName || c.house?.houseName || c.houseId || '\u2014'} (progreso: ${c.done ?? 0}/${c.total ?? 0}).`
      );
    });
  }

  if (checklistsOverdue.length > 0) {
    lines.push('');
    lines.push(
      `También hay ${checklistsOverdue.length} revisión${checklistsOverdue.length !== 1 ? 'es' : ''} atrasada${checklistsOverdue.length !== 1 ? 's' : ''}:`
    );
    checklistsOverdue.slice(0, limit).forEach((c, idx) => {
      lines.push(
        `${idx + 1}. ${c.house?.[0]?.houseName || c.house?.houseName || c.houseId || '\u2014'} (fecha: ${ymd(c.date) || '\u2014'}, progreso: ${c.done ?? 0}/${c.total ?? 0}).`
      );
    });
  } else {
    lines.push('');
    lines.push('No hay revisiones atrasadas.');
  }

  return lines.join('\n');
}

module.exports = { schema, run };
