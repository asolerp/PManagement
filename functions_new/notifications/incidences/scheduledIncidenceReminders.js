/**
 * Recordatorios automáticos por incidencias estancadas.
 * Ejecución diaria a las 9:00 (Europe/Madrid).
 * Por cada empresa: consulta incidencias estancadas (sin cambio de estado >= STALE_DAYS),
 * envía push a admins y a trabajadores asignados; opcionalmente email a admins
 * si está configurado en settings.
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { REGION } = require("../../utils");

const STALE_DAYS = 3;
const OPEN_STATES = ["initiate", "process", "iniciada", "proceso"];

/**
 * Scheduled: daily at 9:00 AM Europe/Madrid.
 * Queries stalled incidents per company, sends push (and optionally email) to admins and assigned workers.
 */
exports.scheduledIncidenceReminders = functions
  .region(REGION)
  .runWith({
    timeoutSeconds: 300,
    memory: "512MB",
  })
  .pubsub.schedule("0 9 * * *") // Todos los días a las 9:00
  .timeZone("Europe/Madrid")
  .onRun(async () => {
    try {
      console.log(
        "Starting scheduled incidence reminders (stalled incidents)...",
      );

      const db = admin.firestore();
      const now = new Date();
      const thresholdDate = new Date(now);
      thresholdDate.setDate(thresholdDate.getDate() - STALE_DAYS);
      thresholdDate.setHours(0, 0, 0, 0);
      const thresholdTimestamp =
        admin.firestore.Timestamp.fromDate(thresholdDate);

      // Obtener todas las empresas (para no cargar todas las incidencias en una sola query)
      const companiesSnap = await db.collection("companies").get();
      if (companiesSnap.empty) {
        console.log("No companies found. Skipping.");
        return null;
      }

      let totalReminders = 0;

      for (const companyDoc of companiesSnap.docs) {
        const companyId = companyDoc.id;

        const incidentsSnap = await db
          .collection("incidents")
          .where("companyId", "==", companyId)
          .where("done", "==", false)
          .where("stateUpdatedAt", "<", thresholdTimestamp)
          .get();

        const stalled = incidentsSnap.docs.filter((doc) => {
          const data = doc.data();
          return OPEN_STATES.includes(data.state);
        });

        if (stalled.length === 0) continue;

        console.log(`[${companyId}] ${stalled.length} stalled incident(s)`);

        const adminSnap = await db
          .collection("users")
          .where("companyId", "==", companyId)
          .where("role", "==", "admin")
          .get();

        const adminTokens = adminSnap.docs
          .map((d) => d.data().token)
          .filter((t) => t);

        const workerIds = new Set();
        stalled.forEach((doc) => {
          const workersId = doc.data().workersId || [];
          workersId.forEach((id) => workerIds.add(id));
        });

        const workerTokens = [];
        for (const workerId of workerIds) {
          const userDoc = await db.collection("users").doc(workerId).get();
          if (userDoc.exists && userDoc.data().token) {
            workerTokens.push(userDoc.data().token);
          }
        }

        const allTokens = [...new Set([...adminTokens, ...workerTokens])];
        if (allTokens.length > 0) {
          const titles = stalled
            .map((d) => d.data().title || d.data().incidence || d.id)
            .slice(0, 3);
          const body =
            stalled.length === 1
              ? `1 incidencia lleva ${STALE_DAYS}+ días sin cambios: "${titles[0]}"`
              : `${stalled.length} incidencias llevan ${STALE_DAYS}+ días sin cambios. Revisa el panel de incidencias.`;

          await admin.messaging().sendMulticast({
            tokens: allTokens,
            notification: {
              title: "Incidencias estancadas",
              body,
            },
            apns: {
              payload: {
                aps: { sound: "default" },
              },
            },
            data: {
              type: "entity",
              collection: "incidents",
              screen: "Incidences",
            },
          });
          totalReminders += 1;
        }

        // Email opcional: destinatarios en settings por empresa
        const settingsDoc = await db
          .collection("settings")
          .doc(companyId)
          .get();
        const emailRecipients =
          settingsDoc.exists &&
          (settingsDoc.data().incidenceReminderEmails ||
            settingsDoc.data().stalledIncidenceEmailRecipients);
        if (
          emailRecipients &&
          Array.isArray(emailRecipients) &&
          emailRecipients.length > 0
        ) {
          console.log(
            `[${companyId}] Would send reminder email to: ${emailRecipients.join(", ")} (${stalled.length} stalled). Email sending not implemented; enable in scheduledIncidenceReminders.js if needed.`,
          );
        }
      }

      console.log(
        `Scheduled incidence reminders finished. Companies notified: ${totalReminders}.`,
      );
      return { success: true, companiesNotified: totalReminders };
    } catch (error) {
      console.error("Error in scheduled incidence reminders:", error);
      return { success: false, error: error.message };
    }
  });
