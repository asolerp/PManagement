/**
 * Cloud Function unificada para borrar documentos
 *
 * Flujo:
 * 1. Valida autenticación y permisos
 * 2. Mueve el documento y subcolecciones a recycleBin (si aplica)
 * 3. Borra el documento original y sus subcolecciones
 * 4. Borra archivos de Storage asociados
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const firebase_tools = require('firebase-tools');
const { REGION } = require('../utils');

// Colecciones que soportan papelera de reciclaje
const RECYCLABLE_COLLECTIONS = ['checklists'];

// Roles permitidos para borrar
const ALLOWED_ROLES = ['admin', 'owner'];

/**
 * Copia un documento y sus subcolecciones a otra ubicación
 */
async function copyDocumentWithSubcollections(
  sourceRef,
  destRef,
  subcollectionNames = []
) {
  const sourceDoc = await sourceRef.get();

  if (!sourceDoc.exists) {
    return false;
  }

  // Copiar documento principal
  await destRef.set({
    ...sourceDoc.data(),
    deletedAt: admin.firestore.FieldValue.serverTimestamp(),
    originalPath: sourceRef.path
  });

  // Copiar subcolecciones
  for (const subcollectionName of subcollectionNames) {
    const subcollectionRef = sourceRef.collection(subcollectionName);
    const snapshot = await subcollectionRef.get();

    if (!snapshot.empty) {
      const batch = admin.firestore().batch();
      snapshot.docs.forEach(doc => {
        const destSubDoc = destRef.collection(subcollectionName).doc(doc.id);
        batch.set(destSubDoc, doc.data());
      });
      await batch.commit();
    }
  }

  return true;
}

/**
 * Obtiene el rol del usuario desde Firestore
 */
async function getUserRole(uid) {
  const userDoc = await admin.firestore().collection('users').doc(uid).get();
  return userDoc.exists ? userDoc.data()?.role : null;
}

const deleteDocument = functions
  .region(REGION)
  .runWith({
    timeoutSeconds: 540,
    memory: '2GB'
  })
  .https.onCall(async (data, context) => {
    // 1. Validar autenticación
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Debes estar autenticado para realizar esta acción.'
      );
    }

    const { collection, docId } = data;
    const uid = context.auth.uid;

    // 2. Validar parámetros
    if (!collection || !docId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Se requiere collection y docId.'
      );
    }

    // 3. Validar permisos del usuario
    const userRole = await getUserRole(uid);
    if (!ALLOWED_ROLES.includes(userRole)) {
      console.warn(
        `Usuario ${uid} con rol ${userRole} intentó borrar ${collection}/${docId}`
      );
      throw new functions.https.HttpsError(
        'permission-denied',
        'No tienes permisos para realizar esta acción.'
      );
    }

    console.log(
      `[deleteDocument] Usuario ${uid} (${userRole}) borrando ${collection}/${docId}`
    );

    const db = admin.firestore();
    const docRef = db.collection(collection).doc(docId);
    const docSnapshot = await docRef.get();

    if (!docSnapshot.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'El documento no existe.'
      );
    }

    try {
      // 4. Mover a papelera si es una colección que lo soporta
      if (RECYCLABLE_COLLECTIONS.includes(collection)) {
        const recycleBinRef = db.collection('recycleBin').doc(docId);

        // Definir subcolecciones por tipo de colección
        const subcollections = {
          checklists: ['checks']
        };

        const copied = await copyDocumentWithSubcollections(
          docRef,
          recycleBinRef,
          subcollections[collection] || []
        );

        if (copied) {
          console.log(
            `[deleteDocument] Documento movido a recycleBin: ${docId}`
          );
        }
      }

      // 5. Borrar documento y subcolecciones de Firestore
      const path = `${collection}/${docId}`;
      await firebase_tools.firestore.delete(path, {
        project: process.env.GCLOUD_PROJECT,
        recursive: true,
        yes: true,
        force: true,
        token: process.env.FB_TOKEN
      });

      console.log(`[deleteDocument] Documento borrado de Firestore: ${path}`);

      // 6. Borrar archivos de Storage asociados
      const bucket = admin.storage().bucket();
      try {
        await bucket.deleteFiles({
          prefix: path
        });
        console.log(`[deleteDocument] Archivos de Storage borrados: ${path}`);
      } catch (storageError) {
        // No fallar si no hay archivos - es esperado en algunos casos
        console.log(
          `[deleteDocument] No se encontraron archivos en Storage para: ${path}`
        );
      }

      return {
        success: true,
        message: 'Documento eliminado correctamente',
        docId,
        collection,
        movedToRecycleBin: RECYCLABLE_COLLECTIONS.includes(collection)
      };
    } catch (error) {
      console.error(
        `[deleteDocument] Error borrando ${collection}/${docId}:`,
        error
      );
      throw new functions.https.HttpsError(
        'internal',
        'Error al eliminar el documento. Por favor, inténtalo de nuevo.'
      );
    }
  });

module.exports = { deleteDocument };
