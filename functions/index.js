const functions = require('firebase-functions');
const admin = require('firebase-admin');
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
const FieldValue = require('firebase-admin').firestore.FieldValue;

admin.initializeApp(functions.config().firebase);

exports.helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info('Hello logs!', {structuredData: true});
  response.send('Hello from Firebase!');
});

exports.newUser = functions.auth.user().onCreate((user) => {
  admin.firestore().collection(`users`).doc(user.uid).set({email: user.email});
});

exports.onDeleteTask = functions.firestore
  .document('jobs/{jobId}/tasks/{taskId}')
  .onDelete((snap, context) => {
    const decrement = FieldValue.increment(-1);
    const taskDeleted = snap.data();

    let promises = [];

    const deleteTaskStat = () => {
      admin
        .firestore()
        .collection('stats')
        .where('taskId', '==', context.params.taskId)
        .limit(1)
        .get()
        .then((query) => {
          const stat = query.docs[0];
          return stat.ref.delete();
        })
        .catch((err) => console.log(err));
    };

    const decrementStats = () => {
      admin
        .firestore()
        .collection(`jobs`)
        .doc(taskDeleted.jobId)
        .update({
          'stats.total': decrement,
          'stats.done': taskDeleted.done ? decrement : FieldValue.increment(0),
        });
    };

    promises.push(deleteTaskStat());
    promises.push(decrementStats());

    return Promise.all(promises);
  });

exports.onCreateJob = functions.firestore
  .document('jobs/{jobId}')
  .onCreate((snap, context) => {
    const jobCreated = snap.data();

    const addNewStats = () => {
      admin.firestore().collection('stats').add({
        jobId: snap.id,
        priority: jobCreated.priority,
        date: jobCreated.date,
        done: false,
      });
    };

    return Promise.all([addNewStats()]);
  });

exports.sendPushNotificationUpdateStatusJob = functions.firestore
  .document('jobs/{jobId}')
  .onUpdate(async (change, context) => {
    try {
      const taskAfter = change.after.data();
      let status;
      if (taskAfter.done) {
        status = 'finished';
      }

      const jobSnapshot = await admin
        .firestore()
        .collection('jobs')
        .doc(context.params.jobId)
        .get();

      let notificationFinish = {
        title: 'Actualización de trabajo 🚨',
        body: `Se ha finalizado la tarea en ${taskAfter.house[0].houseName}. ${taskAfter.task.desc}`,
      };

      let notificationUnfinish = {
        title: 'Actualización de trabajo',
        body: `Se ha vuelto a abrir la tarea en ${
          taskAfter.house[0].houseName
        }. ${taskAfter.task.desc ? taskAfter.task.desc : ''}`,
      };

      let data = {
        screen: 'JobScreen',
        jobId: change.after.id,
      };

      const workersId = jobSnapshot.data().workersId;

      const users = await Promise.all(
        workersId.map(
          async (workerId) =>
            await admin.firestore().collection('users').doc(workerId).get(),
        ),
      );

      const workersTokens = users.map((user) => user.data().token);

      const adminsSnapshot = await admin
        .firestore()
        .collection('users')
        .where('role', '==', 'admin')
        .get();

      const adminTokens = adminsSnapshot.docs.map((doc) => doc.data().token);

      await admin.messaging().sendMulticast({
        tokens: adminTokens.concat(workersTokens),
        notification:
          status === 'finished' ? notificationFinish : notificationUnfinish,
        data,
      });
    } catch (err) {
      console.log(err);
    }
  });

exports.sendPushNotificationNewMessage = functions.firestore
  .document('jobs/{jobId}/messages/{messageId}')
  .onCreate(async (snap, context) => {
    try {
      const message = snap.data();

      const jobSnapshot = await admin
        .firestore()
        .collection('jobs')
        .doc(context.params.jobId)
        .get();

      const workersId = jobSnapshot.data().workersId;

      const users = await Promise.all(
        workersId.map(
          async (workerId) =>
            await admin.firestore().collection('users').doc(workerId).get(),
        ),
      );

      const workersTokens = users.map((user) => user.data().token);
      console.log(workersTokens);

      const adminsSnapshot = await admin
        .firestore()
        .collection('users')
        .where('role', '==', 'admin')
        .get();

      const adminTokens = adminsSnapshot.docs.map((doc) => doc.data().token);

      let notification = {
        title: 'Tienes un nuevo mensaje 💬',
        body: message.text
          ? `${
              message.user.name + 'dice: ' + message.text.length > 25
                ? message.text.substring(0, 25 - 3) + '...'
                : message.text
            }`
          : 'Nueva imagen...',
      };

      await admin.messaging().sendMulticast({
        tokens: adminTokens.concat(workersTokens),
        notification,
        // data,
      });
    } catch (err) {
      console.log(err);
    }
  });

exports.sendPushNotificationNewIncidence = functions.firestore
  .document('incidences/{incidenceId}')
  .onCreate(async (snap, context) => {
    try {
      const incidence = snap.data();

      const adminsSnapshot = await admin
        .firestore()
        .collection('users')
        .where('role', '==', 'admin')
        .get();

      const adminTokens = adminsSnapshot.docs.map((doc) => doc.data().token);

      let notification = {
        title: 'Se ha creado una incidencia! 🚨',
        body: `${incidence.user.firstName} ha creado una nueva incidencia...`,
      };

      await admin.messaging().sendMulticast({
        tokens: adminTokens,
        notification,
        priority: 'high',
        // data,
      });
    } catch (err) {
      console.log(err);
    }
  });

exports.updateProfileImage = functions.firestore
  .document('users/{userId}')
  .onUpdate(async (change, context) => {
    console.log('Updating images');
    const userAfter = change.after.data();
    // Create a new batch instance
    const batch = admin.firestore().batch();

    try {
      const querySnapshot = await admin
        .firestore()
        .collection('jobs')
        .where('workersId', 'array-contains', context.params.userId)
        .get();
      querySnapshot.forEach((doc) => {
        const job = doc.data();
        const findUserIndex = job.workers.findIndex(
          (w) => w.id === context.params.userId,
        );
        job.workers[findUserIndex] = {...userAfter, id: context.params.userId};
        const docRef = admin.firestore().collection('jobs').doc(doc.id);
        batch.update(docRef, job);
      });
      await batch.commit();
    } catch (err) {
      console.log(err);
    }
  });

exports.updateHouseImageJobs = functions.firestore
  .document('houses/{houseId}')
  .onUpdate(async (change, context) => {
    console.log('Updating images');
    const houseAfter = change.after.data();
    // Create a new batch instance
    const batch = admin.firestore().batch();

    try {
      const querySnapshot = await admin
        .firestore()
        .collection('jobs')
        .where('houseId', '==', context.params.houseId)
        .get();
      querySnapshot.forEach((doc) => {
        const job = doc.data();
        console.log('job', job);
        job.house[0] = {...houseAfter, id: context.params.houseId};
        const docRef = admin.firestore().collection('jobs').doc(doc.id);
        batch.update(docRef, job);
      });
      await batch.commit();
    } catch (err) {
      console.log(err);
    }
  });
