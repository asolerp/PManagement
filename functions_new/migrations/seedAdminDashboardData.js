/**
 * Seed datos de demostración para el admin dashboard (Estado del día, SLA en riesgo,
 * incidencias estancadas, filtros, etc.) asociados a la cuenta admin@admin.es.
 *
 * Uso:
 *   GOOGLE_APPLICATION_CREDENTIALS=path/to/key.json node migrations/seedAdminDashboardData.js
 *
 * Opcional: pasar companyId por argumento si no quieres buscar por admin@admin.es
 *   node migrations/seedAdminDashboardData.js <companyId>
 *
 * Requiere que exista un usuario admin con companyId (p.ej. creado con registerCompany).
 * Crea/actualiza: company, properties, users (workers demo), incidents, jobs, checklists, workShifts.
 */

const admin = require("firebase-admin");

const ADMIN_EMAIL = "admin@admin.es";

const serviceAccount = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!serviceAccount) {
  console.error(
    "Set GOOGLE_APPLICATION_CREDENTIALS to your service account key path.",
  );
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const db = admin.firestore();
const auth = admin.auth();
const FieldValue = admin.firestore.FieldValue;
const Timestamp = admin.firestore.Timestamp;

function now() {
  return new Date();
}

function daysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

function todayStr() {
  const d = new Date();
  return d.toISOString().split("T")[0];
}

/** Devuelve houseIds[i] o el último disponible si no hay tantos (evita undefined en Firestore). */
function safeHouseId(houseIds, index) {
  if (!houseIds || houseIds.length === 0) return null;
  return houseIds[Math.min(index, houseIds.length - 1)];
}

async function getCompanyIdForAdminEmail() {
  try {
    const user = await auth.getUserByEmail(ADMIN_EMAIL);
    const userDoc = await db.collection("users").doc(user.uid).get();
    if (!userDoc.exists) {
      console.error(
        `Usuario ${ADMIN_EMAIL} existe en Auth pero no hay doc en users.`,
      );
      process.exit(1);
    }
    const companyId = userDoc.data().companyId;
    if (!companyId) {
      console.error(
        `Usuario ${ADMIN_EMAIL} no tiene companyId en users. Crea empresa primero (registerCompany).`,
      );
      process.exit(1);
    }
    return { companyId, adminUid: user.uid };
  } catch (e) {
    if (e.code === "auth/user-not-found") {
      console.error(
        `No existe usuario con email ${ADMIN_EMAIL}. Créalo antes (Auth + users doc con companyId).`,
      );
    } else {
      console.error("Error obteniendo usuario admin:", e.message);
    }
    process.exit(1);
  }
}

async function ensureCompany(companyId) {
  const ref = db.collection("companies").doc(companyId);
  const snap = await ref.get();
  if (snap.exists) {
    const data = snap.data();
    if (!data.slaIncidenceResponseHours) {
      await ref.update({
        slaIncidenceResponseHours: 24,
        slaIncidenceResolutionHours: 72,
        updatedAt: FieldValue.serverTimestamp(),
      });
      console.log("Company actualizada con SLAs por defecto.");
    }
    return companyId;
  }
  await ref.set({
    name: "Empresa Demo",
    plan: "free",
    maxUsers: 10,
    maxHouses: 20,
    slaIncidenceResponseHours: 24,
    slaIncidenceResolutionHours: 72,
    settings: { language: "es", timezone: "Europe/Madrid" },
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  console.log("Company demo creada:", companyId);
  return companyId;
}

async function seedProperties(companyId) {
  const col = db.collection("properties");
  const existing = await col.where("companyId", "==", companyId).limit(1).get();
  if (!existing.empty) {
    console.log("Ya hay propiedades para esta empresa; no se crean más.");
    const ids = await col.where("companyId", "==", companyId).get();
    return ids.docs.map((d) => d.id);
  }

  const names = ["Casa Norte", "Casa Sur", "Apartamento Centro"];
  const ids = [];
  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    const ref = await col.add({
      companyId,
      houseName: name,
      createdAt: FieldValue.serverTimestamp(),
    });
    ids.push(ref.id);
  }
  console.log("Creadas propiedades:", names.join(", "));
  return ids;
}

async function seedWorkers(companyId) {
  const col = db.collection("users");
  const existing = await col
    .where("companyId", "==", companyId)
    .where("role", "==", "worker")
    .limit(1)
    .get();
  if (!existing.empty) {
    console.log("Ya hay trabajadores; se reutilizan para workShifts.");
    const snap = await col
      .where("companyId", "==", companyId)
      .where("role", "==", "worker")
      .get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  const workers = [
    { firstName: "Peón", lastName: "Demo", id: null },
    { firstName: "Trabajadora", lastName: "Prueba", id: null },
  ];
  for (let i = 0; i < workers.length; i++) {
    const w = workers[i];
    const uid = `seed-worker-${companyId.slice(0, 8)}-${i + 1}`;
    const ref = db.collection("users").doc(uid);
    await ref.set({
      companyId,
      firstName: w.firstName,
      lastName: w.lastName,
      role: "worker",
      email: `worker${i + 1}-${companyId.slice(0, 6)}@demo.local`,
      profileImage: { original: "", small: "" },
      createdAt: FieldValue.serverTimestamp(),
    });
    workers[i].id = uid;
  }
  console.log("Creados trabajadores demo (solo Firestore, sin Auth).");
  return workers;
}

async function seedIncidences(companyId, houseIds) {
  const col = db.collection("incidents");
  const existing = await col.where("companyId", "==", companyId).limit(1).get();
  if (!existing.empty) {
    console.log("Ya hay incidencias; no se añaden más.");
    return;
  }

  const h0 = safeHouseId(houseIds, 0);
  if (!h0) {
    console.log("No hay propiedades; se omiten incidencias.");
    return;
  }

  const nowDate = now();
  const fourDaysAgo = daysAgo(4);
  const fiveDaysAgo = daysAgo(5);
  const h1 = safeHouseId(houseIds, 1);
  const h2 = safeHouseId(houseIds, 2);
  const incidents = [
    {
      title: "Fuga de agua en baño (estancada)",
      incidence: "Lleva varios días sin actualizar.",
      companyId,
      houseId: h0,
      house: { houseName: "Casa Norte", id: h0 },
      state: "process",
      done: false,
      workersId: [],
      photos: [],
      date: nowDate,
      createdAt: Timestamp.fromDate(fiveDaysAgo),
      stateUpdatedAt: Timestamp.fromDate(fourDaysAgo),
      responseDueAt: Timestamp.fromDate(daysAgo(2)),
      resolutionDueAt: Timestamp.fromDate(daysAgo(1)),
    },
    {
      title: "Aire acondicionado no enfría (estancada)",
      incidence: "Iniciada hace una semana.",
      companyId,
      houseId: h1,
      house: { houseName: "Casa Sur", id: h1 },
      state: "initiate",
      done: false,
      workersId: [],
      photos: [],
      date: nowDate,
      createdAt: Timestamp.fromDate(daysAgo(7)),
      stateUpdatedAt: Timestamp.fromDate(fiveDaysAgo),
      responseDueAt: Timestamp.fromDate(daysAgo(6)),
      resolutionDueAt: Timestamp.fromDate(daysAgo(4)),
    },
    {
      title: "SLA en riesgo – ventana rota",
      incidence: "Resolver hoy.",
      companyId,
      houseId: h0,
      house: { houseName: "Casa Norte", id: h0 },
      state: "process",
      done: false,
      workersId: [],
      photos: [],
      date: nowDate,
      createdAt: Timestamp.fromDate(now()),
      stateUpdatedAt: Timestamp.fromDate(now()),
      responseDueAt: Timestamp.fromDate(now()),
      resolutionDueAt: new Date(nowDate.getTime() + 2 * 60 * 60 * 1000),
    },
    {
      title: "SLA incumplido – persiana atascada",
      incidence: "Vencido ayer.",
      companyId,
      houseId: h2,
      house: { houseName: "Apartamento Centro", id: h2 },
      state: "process",
      done: false,
      workersId: [],
      photos: [],
      date: nowDate,
      createdAt: Timestamp.fromDate(daysAgo(3)),
      stateUpdatedAt: Timestamp.fromDate(daysAgo(1)),
      responseDueAt: Timestamp.fromDate(daysAgo(2)),
      resolutionDueAt: Timestamp.fromDate(daysAgo(1)),
    },
    {
      title: "Incidencia sin asignar – pintura",
      incidence: "Asignar trabajador.",
      companyId,
      houseId: h1,
      house: { houseName: "Casa Sur", id: h1 },
      state: "iniciada",
      done: false,
      workersId: [],
      photos: [],
      date: nowDate,
      createdAt: Timestamp.fromDate(now()),
      stateUpdatedAt: Timestamp.fromDate(now()),
      responseDueAt: new Date(nowDate.getTime() + 20 * 60 * 60 * 1000),
      resolutionDueAt: new Date(nowDate.getTime() + 72 * 60 * 60 * 1000),
    },
  ];

  for (const inc of incidents) {
    await col.add(inc);
  }
  console.log(
    "Creadas 5 incidencias (estancadas, SLA riesgo/incumplido, sin asignar).",
  );
}

async function seedJobs(companyId, houseIds, workers) {
  const col = db.collection("jobs");
  const existing = await col.where("companyId", "==", companyId).limit(1).get();
  if (!existing.empty) {
    console.log("Ya hay trabajos; no se añaden más.");
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const h0 = safeHouseId(houseIds, 0);
  const h1 = safeHouseId(houseIds, 1);
  if (!h0) {
    console.log("No hay propiedades; se omiten trabajos.");
    return;
  }

  const jobs = [
    {
      companyId,
      title: "Limpieza Casa Norte (hoy, pendiente)",
      jobName: "Limpieza Casa Norte",
      houseId: h0,
      house: { houseName: "Casa Norte", id: h0 },
      workersId: workers[0]?.id ? [workers[0].id] : [],
      date: Timestamp.fromDate(today),
      createdAt: Timestamp.fromDate(today),
      status: "pending",
      done: false,
      resolutionDueAt: Timestamp.fromDate(
        new Date(today.getTime() + 8 * 60 * 60 * 1000),
      ),
    },
    {
      companyId,
      title: "Mantenimiento piscina (hoy, hecho)",
      jobName: "Mantenimiento piscina",
      houseId: h0,
      house: { houseName: "Casa Norte", id: h0 },
      workersId: workers[0]?.id ? [workers[0].id] : [],
      date: Timestamp.fromDate(today),
      createdAt: Timestamp.fromDate(today),
      status: "done",
      done: true,
      resolutionDueAt: Timestamp.fromDate(today),
    },
    {
      companyId,
      title: "SLA en riesgo – fontanería",
      jobName: "Fontanería",
      houseId: h1,
      house: { houseName: "Casa Sur", id: h1 },
      workersId: [],
      date: Timestamp.fromDate(today),
      createdAt: Timestamp.fromDate(daysAgo(2)),
      status: "pending",
      done: false,
      resolutionDueAt: Timestamp.fromDate(daysAgo(1)),
    },
  ];

  for (const job of jobs) {
    await col.add(job);
  }
  console.log("Creados 3 trabajos (hoy pendiente, hoy hecho, SLA riesgo).");
}

async function seedChecklists(companyId, houseIds) {
  const col = db.collection("checklists");
  const existing = await col
    .where("companyId", "==", companyId)
    .where("finished", "==", false)
    .limit(1)
    .get();
  if (!existing.empty) {
    console.log("Ya hay revisiones en curso; no se añaden más.");
    return;
  }

  const h0 = safeHouseId(houseIds, 0);
  if (!h0) {
    console.log("No hay propiedades; se omite checklist.");
    return;
  }
  const ref = await col.add({
    companyId,
    houseId: h0,
    house: [{ houseName: "Casa Norte", id: h0 }],
    date: now(),
    observations: "Revisión en curso (seed)",
    total: 5,
    done: 2,
    finished: false,
    send: false,
  });
  const checksRef = db
    .collection("checklists")
    .doc(ref.id)
    .collection("checks");
  for (let i = 0; i < 5; i++) {
    await checksRef.add({
      originalId: `seed-check-${i}`,
      locale: { es: `Punto ${i + 1}`, en: `Point ${i + 1}` },
      done: i < 2,
      worker: null,
      date: null,
      numberOfPhotos: 0,
    });
  }
  console.log("Creada 1 revisión en curso (checklist sin finalizar).");
}

async function seedWorkShifts(companyId, workers) {
  const today = todayStr();
  const col = db.collection("workShifts");
  const existing = await col
    .where("companyId", "==", companyId)
    .where("date", "==", today)
    .limit(1)
    .get();
  if (!existing.empty) {
    console.log("Ya hay jornadas para hoy; no se añaden más.");
    return;
  }

  const baseToday = new Date();
  baseToday.setHours(8, 0, 0, 0);
  const firstEntry = Timestamp.fromDate(baseToday);
  const exitTime = new Date(baseToday);
  exitTime.setHours(14, 30, 0, 0);
  const lastExitCompleted = Timestamp.fromDate(exitTime);

  for (let i = 0; i < (workers.length || 2); i++) {
    const w = workers[i] || {
      id: `seed-worker-${i + 1}`,
      firstName: "Trabajador",
      lastName: `${i + 1}`,
    };
    const workerId = w.id || `seed-worker-${companyId.slice(0, 8)}-${i + 1}`;
    const workerName =
      `${w.firstName || ""} ${w.lastName || ""}`.trim() || "Trabajador";
    const shiftId = `${workerId}_${today}`;

    const isInProgress = i === 0;
    await col.doc(shiftId).set({
      companyId,
      workerId,
      workerName,
      workerEmail: "",
      workerPhoto: null,
      date: today,
      firstEntry,
      lastExit: isInProgress ? null : lastExitCompleted,
      totalMinutes: isInProgress ? 0 : 390,
      status: isInProgress ? "in_progress" : "completed",
      entranceIds: [],
      entranceCount: 0,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  }
  console.log("Creadas jornadas de hoy (1 en curso, 1 completada).");
}

async function main() {
  let companyId = process.argv[2];
  if (!companyId) {
    const { companyId: resolved } = await getCompanyIdForAdminEmail();
    companyId = resolved;
    console.log("Usando companyId del usuario", ADMIN_EMAIL, ":", companyId);
  } else {
    console.log("Usando companyId pasado por argumento:", companyId);
  }

  await ensureCompany(companyId);
  const houseIds = await seedProperties(companyId);
  const workers = await seedWorkers(companyId);
  await seedIncidences(companyId, houseIds);
  await seedJobs(companyId, houseIds, workers);
  await seedChecklists(companyId, houseIds);
  await seedWorkShifts(companyId, workers);

  console.log(
    "\nSeed completado. Inicia sesión en el dashboard con",
    ADMIN_EMAIL,
    "para ver:",
  );
  console.log(
    "  - Estado del día: incidencias abiertas, trabajos de hoy, revisiones en curso, jornadas en curso",
  );
  console.log(
    "  - SLA en riesgo: incidencias y trabajos con SLA at_risk/breached",
  );
  console.log("  - Incidencias: filtro Estancadas, SLA en riesgo, Sin asignar");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
