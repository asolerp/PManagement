const admin = require("firebase-admin");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { REGION } = require("../utils");

/**
 * Trigger: al crear un documento en quadrants/{quadrantId}/jobs/{jobId},
 * crea el documento correspondiente en la colección jobs y envía notificación al trabajador.
 * Así, cada vez que se añade un trabajo al cuadrante (desde dashboard o app), se genera el job.
 */
const createJobsForQuadrant = onDocumentCreated(
  {
    document: "quadrants/{quadrantId}/jobs/{jobId}",
    region: REGION,
  },
  async (event) => {
    const job = event.data.data();
    const quadrantId = event.params.quadrantId;
    const db = admin.firestore();

    if (!job.houseId || !job.worker || !job.worker.id) {
      console.warn(
        "createJobsForQuadrant: job sin houseId o worker, skip",
        quadrantId,
      );
      return;
    }

    try {
      const quadrantSnap = await db
        .collection("quadrants")
        .doc(quadrantId)
        .get();
      const companyId =
        quadrantSnap.exists && quadrantSnap.data().companyId
          ? quadrantSnap.data().companyId
          : null;

      const houseSnap = await db
        .collection("properties")
        .doc(job.houseId)
        .get();
      const houseData = houseSnap.exists ? houseSnap.data() : {};
      const house = { id: houseSnap.id, ...houseData };

      const newJobForQuadrant = {
        ...(companyId && { companyId }),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        date: job.date,
        done: false,
        quadrant: true,
        quadrantId: job.quadrantId || quadrantId,
        quadrantStartHour: job.startHour,
        quadrantEndHour: job.endHour,
        house,
        houseId: job.houseId,
        observations: "Sin observaciones",
        task: {
          desc: "Servicio de limpieza",
          icon: "housekeeping",
          id: "IfhkYuHj2wRHpdxFR6QN",
          locales: {
            en: { desc: "Cleaning service", name: "Cleaning" },
            es: { desc: "Servicio de limpieza", name: "Limpieza" },
          },
          name: "Limpieza",
        },
        workers: [job.worker],
        workersId: [job.worker.id],
      };

      const jobResponse = await db.collection("jobs").add(newJobForQuadrant);

      const notification = {
        title: "Manos a la obra! 📝",
        body: "Se te ha asignado al cuadrante de hoy ✅",
      };
      const data = {
        type: "entity",
        collection: "jobs",
        docId: jobResponse.id,
      };

      if (job.worker.token) {
        await admin.messaging().sendMulticast({
          tokens: [job.worker.token],
          notification,
          apns: {
            payload: {
              aps: {
                "content-available": 1,
                mutableContent: 1,
                sound: "default",
              },
            },
          },
          data,
        });
      }
    } catch (err) {
      console.error("createJobsForQuadrant error:", err);
      throw err;
    }
  },
);

module.exports = { createJobsForQuadrant };
