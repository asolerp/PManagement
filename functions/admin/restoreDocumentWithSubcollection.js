const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { REGION } = require('../utils');

const restoreDocumentWithSubcollection = functions
  .region(REGION)
  .https.onCall(async data => {
    // Asumiendo que 'data' incluye el 'docId' del documento a restaurar
    const docId = data.docId;
    if (!docId)
      throw new functions.https.HttpsError(
        'invalid-argument',
        'The function must be called with the argument "docId".'
      );

    // Referencias a la ubicación en la papelera de reciclaje y la ubicación original
    const recycleBinDocRef = admin
      .firestore()
      .collection('recycleBin')
      .doc(docId);
    const originalDocRef = admin
      .firestore()
      .collection('checklists')
      .doc(docId);

    // Leer el documento de la papelera de reciclaje
    const docSnapshot = await recycleBinDocRef.get();
    if (!docSnapshot.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'Document to restore does not exist in recycle bin.'
      );
    }
    const docData = docSnapshot.data();

    // Restaurar el documento principal a su ubicación original
    await originalDocRef.set(docData);

    // Restaurar la subcolección 'check'
    const checkSubcollectionRef = recycleBinDocRef.collection('checks');
    const checkSnapshot = await checkSubcollectionRef.get();

    if (!checkSnapshot.empty) {
      // Preparar las promesas para restaurar cada documento de 'check'
      const restorePromises = checkSnapshot.docs.map(doc => {
        const docData = doc.data();
        // Crear una referencia a la ubicación original del documento
        const originalLocationRef = originalDocRef
          .collection('checks')
          .doc(doc.id);
        // Restaurar el documento a la ubicación original
        return originalLocationRef.set(docData);
      });

      // Esperar a que todas las restauraciones se completen
      await Promise.all(restorePromises);
    }

    // Opcionalmente, borrar el documento y sus subcolecciones de la papelera de reciclaje después de la restauración
    // Primero, borrar subcolecciones
    await Promise.all(
      checkSnapshot.docs.map(doc => checkSubcollectionRef.doc(doc.id).delete())
    );
    // Luego, borrar el documento principal de la papelera de reciclaje
    await recycleBinDocRef.delete();

    return { message: 'Document and subcollection restored successfully.' };
  });

module.exports = { restoreDocumentWithSubcollection };
