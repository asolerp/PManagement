/**
 * Recordatorios automaticos por incidencias estancadas.
 * Ejecucion diaria a las 9:00 (Europe/Madrid).
 * Consulta incidencias estancadas (sin cambio de estado >= STALE_DAYS),
 * envia push a admins y a trabajadores asignados.
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { REGION } = require('../../utils');

const STALE_DAYS = 3;
const OPEN_STATES = ['initiate', 'process', 'iniciada', 'proceso'];

exports.scheduledIncidenceReminders = functions
  .region(REGION)
  .runWith({
    timeoutSeconds: 300,
    memory: '512MB'
  })
  .pubsub.schedule('0 9 * * *')
  .timeZone('Europe/Madrid')
  .onRun(async () => {
    try {
      console.log(
        'Starting scheduled incidence reminders (stalled incidents)...'
      );

      const db = admin.firestore();
      const now = new Date();
      const thresholdDate = new Date(now);
      thresholdDate.setDate(thresholdDate.getDate() - STALE_DAYS);
      thresholdDate.setHours(0, 0, 0, 0);
      const thresholdTimestamp =
        admin.firestore.Timestamp.fromDate(thresholdDate);

      const incidencesSnap = await db
        .collection('incidences')
        .where('done', '==', false)
        .where('stateUpdatedAt', '<', thresholdTimestamp)
        .get();

      const stalled = incidencesSnap.docs.filter(doc => {
        const data = doc.data();
        return OPEN_STATES.includes(data.state);
      });

      if (stalled.length === 0) {
        console.log('No stalled incidences found. Skipping.');
        return null;
      }

      console.log(`${stalled.length} stalled incidence(s) found`);

      const adminSnap = await db
        .collection('users')
        .where('role', '==', 'admin')
        .get();

      const adminTokens = adminSnap.docs
        .map(d => d.data().token)
        .filter(t => t);

      const workerIds = new Set();
      stalled.forEach(doc => {
        const workersId = doc.data().workersId || [];
        workersId.forEach(id => workerIds.add(id));
      });

      const workerTokens = [];
      for (const workerId of workerIds) {
        const userDoc = await db.collection('users').doc(workerId).get();
        if (userDoc.exists && userDoc.data().token) {
          workerTokens.push(userDoc.data().token);
        }
      }

      const allTokens = [...new Set([...adminTokens, ...workerTokens])];
      if (allTokens.length > 0) {
        const titles = stalled
          .map(d => d.data().title || d.data().incidence || d.id)
          .slice(0, 3);
        const body =
          stalled.length === 1
            ? `1 incidencia lleva ${STALE_DAYS}+ dias sin cambios: "${titles[0]}"`
            : `${stalled.length} incidencias llevan ${STALE_DAYS}+ dias sin cambios. Revisa el panel de incidencias.`;

        await admin.messaging().sendMulticast({
          tokens: allTokens,
          notification: {
            title: 'Incidencias estancadas',
            body
          },
          apns: {
            payload: {
              aps: { sound: 'default' }
            }
          },
          data: {
            type: 'entity',
            collection: 'incidences',
            screen: 'Incidences'
          }
        });
      }

      const settingsDoc = await db.collection('settings').doc('general').get();
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
          `Would send reminder email to: ${emailRecipients.join(', ')} (${stalled.length} stalled). Email sending not implemented; enable in scheduledIncidenceReminders.js if needed.`
        );
      }

      console.log('Scheduled incidence reminders finished.');
      return { success: true, stalledCount: stalled.length };
    } catch (error) {
      console.error('Error in scheduled incidence reminders:', error);
      return { success: false, error: error.message };
    }
  });
