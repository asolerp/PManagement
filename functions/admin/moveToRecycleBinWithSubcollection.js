const functions = require('firebase-functions');
const admin = require('firebase-admin');


const moveToRecycleBinWithSubcollection =  functions
.runWith({
  timeoutSeconds: 540,
  memory: '2GB',
})
.https.onCall(async (data, context) => {
    // Verificar la autenticación del usuario (opcional)
    if (!context.auth) {
        // Throwing an HttpsError so that the client gets the error details.
        throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
    }

    // Obtener el ID del documento desde los datos enviados a la función
    const docId = data.docId;
    if (!docId) {
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with document ID.');
    }

    const originalDocRef = admin.firestore().collection('checklists').doc(docId);
    const docSnapshot = await originalDocRef.get();

    if (!docSnapshot.exists) {
        throw new functions.https.HttpsError('not-found', 'Document to move does not exist.');
    }

    const recycleData = docSnapshot.data();
    const recycleBinDocRef = admin.firestore().collection('recycleBin').doc(docId);

    // Mover el documento principal a la papelera de reciclaje
    await recycleBinDocRef.set(recycleData);

    // Mover la subcolección 'check'
    const checkSubcollectionRef = originalDocRef.collection('checks');
    const checkSnapshot = await checkSubcollectionRef.get();
    
    if (!checkSnapshot.empty) {
        const copyPromises = checkSnapshot.docs.map(async doc => {
            const docData = doc.data();
            await recycleBinDocRef.collection('checks').doc(doc.id).set(docData);
            // Opcional: eliminar el documento de la subcolección original
            await doc.ref.delete();
        });

        await Promise.all(copyPromises);
    }

    return {message: 'Document and subcollection moved to recycle bin successfully.'};
});

module.exports = {moveToRecycleBinWithSubcollection};