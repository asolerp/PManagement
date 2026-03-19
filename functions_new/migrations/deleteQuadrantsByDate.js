/**
 * Borra los cuadrantes y todos sus trabajos (subcolección + colección jobs) para una fecha.
 * Uso: DATE=2026-03-09 [COMPANY_ID=xxx] node migrations/deleteQuadrantsByDate.js
 *
 * Si no pasas COMPANY_ID, se borran los cuadrantes de esa fecha de todas las empresas
 * (hace un get de quadrants y filtra por date en memoria).
 */
const admin = require("firebase-admin");

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error(
    "Pasa GOOGLE_APPLICATION_CREDENTIALS con la ruta a la key JSON.",
  );
  process.exit(1);
}

const dateStr = process.env.DATE || process.argv[2] || "2026-03-09";
const companyId = process.env.COMPANY_ID || process.argv[3] || null;

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.applicationDefault() });
}
const db = admin.firestore();

async function deleteQuadrant(quadrantId) {
  const quadrantRef = db.collection("quadrants").doc(quadrantId);
  const jobsRef = quadrantRef.collection("jobs");
  const quadrantJobsSnap = await jobsRef.get();
  const batch = db.batch();
  quadrantJobsSnap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();

  const mainJobsSnap = await db
    .collection("jobs")
    .where("quadrantId", "==", quadrantId)
    .get();
  const batch2 = db.batch();
  mainJobsSnap.docs.forEach((d) => batch2.delete(d.ref));
  await batch2.commit();

  await quadrantRef.delete();
}

async function main() {
  let quadrantsSnap;
  if (companyId) {
    quadrantsSnap = await db
      .collection("quadrants")
      .where("companyId", "==", companyId)
      .where("date", "==", dateStr)
      .get();
  } else {
    const all = await db.collection("quadrants").get();
    quadrantsSnap = { docs: all.docs.filter((d) => d.data().date === dateStr) };
  }

  const quadrants = quadrantsSnap.docs;
  console.log(
    `Fecha: ${dateStr}${companyId ? `, companyId: ${companyId}` : ""}`,
  );
  console.log(`Cuadrantes a borrar: ${quadrants.length}`);

  for (const doc of quadrants) {
    const id = doc.id;
    const data = doc.data();
    console.log(`  Borrando cuadrante ${id} (${data.date})...`);
    await deleteQuadrant(id);
    console.log(`  OK: ${id}`);
  }

  console.log("Hecho.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
