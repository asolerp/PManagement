/**
 * Cloud Function unificada para borrar documentos
 *
 * Flujo:
 * 1. Valida autenticación y permisos
 * 2. Mueve el documento y subcolecciones a recycleBin (si aplica)
 * 3. Borra el documento original y sus subcolecciones
 * 4. Borra archivos de Storage asociados
 */

const admin = require("firebase-admin");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const firebase_tools = require("firebase-tools");
const { REGION } = require("../utils");

const RECYCLABLE_COLLECTIONS = ["checklists"];
const ALLOWED_ROLES = ["admin", "owner"];

async function copyDocumentWithSubcollections(
  sourceRef,
  destRef,
  subcollectionNames = [],
) {
  const sourceDoc = await sourceRef.get();

  if (!sourceDoc.exists) {
    return false;
  }

  await destRef.set({
    ...sourceDoc.data(),
    deletedAt: admin.firestore.FieldValue.serverTimestamp(),
    originalPath: sourceRef.path,
  });

  for (const subcollectionName of subcollectionNames) {
    const subcollectionRef = sourceRef.collection(subcollectionName);
    const snapshot = await subcollectionRef.get();

    if (!snapshot.empty) {
      const batch = admin.firestore().batch();
      snapshot.docs.forEach((doc) => {
        const destSubDoc = destRef.collection(subcollectionName).doc(doc.id);
        batch.set(destSubDoc, doc.data());
      });
      await batch.commit();
    }
  }

  return true;
}

async function getUserRole(uid) {
  const userDoc = await admin.firestore().collection("users").doc(uid).get();
  return userDoc.exists ? userDoc.data()?.role : null;
}

const deleteDocument = onCall(
  { region: REGION, timeoutSeconds: 540, memory: "2GiB" },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "Debes estar autenticado para realizar esta acción.",
      );
    }

    const { collection, docId } = request.data;
    const uid = request.auth.uid;

    if (!collection || !docId) {
      throw new HttpsError(
        "invalid-argument",
        "Se requiere collection y docId.",
      );
    }

    const userRole = await getUserRole(uid);
    if (!ALLOWED_ROLES.includes(userRole)) {
      console.warn(
        `Usuario ${uid} con rol ${userRole} intentó borrar ${collection}/${docId}`,
      );
      throw new HttpsError(
        "permission-denied",
        "No tienes permisos para realizar esta acción.",
      );
    }

    console.log(
      `[deleteDocument] Usuario ${uid} (${userRole}) borrando ${collection}/${docId}`,
    );

    const db = admin.firestore();
    const docRef = db.collection(collection).doc(docId);
    const docSnapshot = await docRef.get();

    if (!docSnapshot.exists) {
      throw new HttpsError("not-found", "El documento no existe.");
    }

    try {
      if (RECYCLABLE_COLLECTIONS.includes(collection)) {
        const recycleBinRef = db.collection("recycleBin").doc(docId);

        const subcollections = {
          checklists: ["checks"],
        };

        const copied = await copyDocumentWithSubcollections(
          docRef,
          recycleBinRef,
          subcollections[collection] || [],
        );

        if (copied) {
          console.log(
            `[deleteDocument] Documento movido a recycleBin: ${docId}`,
          );
        }
      }

      const path = `${collection}/${docId}`;
      await firebase_tools.firestore.delete(path, {
        project: process.env.GCLOUD_PROJECT,
        recursive: true,
        yes: true,
        force: true,
        token: process.env.FB_TOKEN,
      });

      console.log(`[deleteDocument] Documento borrado de Firestore: ${path}`);

      const bucket = admin.storage().bucket();
      try {
        await bucket.deleteFiles({
          prefix: path,
        });
        console.log(`[deleteDocument] Archivos de Storage borrados: ${path}`);
      } catch (storageError) {
        console.log(
          `[deleteDocument] No se encontraron archivos en Storage para: ${path}`,
        );
      }

      return {
        success: true,
        message: "Documento eliminado correctamente",
        docId,
        collection,
        movedToRecycleBin: RECYCLABLE_COLLECTIONS.includes(collection),
      };
    } catch (error) {
      console.error(
        `[deleteDocument] Error borrando ${collection}/${docId}:`,
        error,
      );
      throw new HttpsError(
        "internal",
        "Error al eliminar el documento. Por favor, inténtalo de nuevo.",
      );
    }
  },
);

module.exports = { deleteDocument };
