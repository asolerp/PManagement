const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { REGION } = require('../utils');

const createJobsForQuadrant = functions.region(REGION).firestore
  .document('quadrants/{quadrantId}/jobs/{jobId}')
  .onCreate(async (snap, context) => {
    const job = snap.data();

    try {
      const house = await admin
        .firestore()
        .collection('houses')
        .doc(job.houseId)
        .get();

      const newJobForQuadrant = {
        date: job.date,
        done: false,
        quadrant: true,
        quadrantId: job.quadrantId,
        quadrantStartHour: job.startHour,
        quadrantEndHour: job.endHour,
        house: {id: house.id, ...house.data()},
        houseId: house.id,
        observations: 'Sin observaciones',
        task: {
          desc: 'Servicio de limpieza',
          icon: 'housekeeping',
          id: 'IfhkYuHj2wRHpdxFR6QN',
          locales: {
            en: {
              desc: 'Cleaning service',
              name: 'Cleaning',
            },
            es: {
              desc: 'Servicio de limpieza',
              name: 'Limpieza',
            },
          },
          name: 'Limpieza',
        },
        workers: [job.worker],
        workersId: [job.worker.id],
      };

      const jobResponse = await admin
        .firestore()
        .collection('jobs')
        .add(newJobForQuadrant);

      let notification = {
        title: 'Manos a la obra! 📝',
        body: `Se te ha asignado al cuadrante de hoy ✅`,
      };

      let data = {
        type: 'entity',
        collection: 'jobs',
        docId: jobResponse.id,
      };

      if (job.worker.token) {
        await admin.messaging().sendMulticast({
          tokens: [job.worker.token],
          notification,
          apns: {
            payload: {
              aps: {
                'content-available': 1,
                mutableContent: 1,
                sound: 'default',
              },
            },
          },
          data,
        });
      }
    } catch (err) {
      console.log(err);
    }
  });

module.exports = {createJobsForQuadrant};
