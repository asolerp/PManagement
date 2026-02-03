const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { REGION } = require('../utils');

// Clave maestra - Deberías mover esto a variables de entorno para mayor seguridad
// Puedes configurarlo con: firebase functions:config:set master.key="TU_CLAVE_MAESTRA"
const MASTER_KEY =
  functions.config().master?.key || process.env.MASTER_KEY || 'port.2026';

const masterKeyLogin = functions
  .region(REGION)
  .runWith({
    timeoutSeconds: 30,
    memory: '256MB'
  })
  .https.onCall(async (data, context) => {
    const { email, masterKey } = data;

    // Validar que se proporcionaron los datos necesarios
    if (!email || !masterKey) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Email y clave maestra son requeridos'
      );
    }

    // Validar la clave maestra
    if (masterKey !== MASTER_KEY) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Clave maestra inválida'
      );
    }

    try {
      // Buscar el usuario por email
      let userRecord;
      try {
        userRecord = await admin.auth().getUserByEmail(email);
      } catch (error) {
        // Si el usuario no existe, crear uno nuevo con una contraseña temporal
        // Nota: Esto requiere que tengas permisos para crear usuarios
        const tempPassword =
          Math.random().toString(36).slice(-12) +
          Math.random().toString(36).slice(-12);
        userRecord = await admin.auth().createUser({
          email: email,
          emailVerified: false,
          password: tempPassword,
          disabled: false
        });

        // Crear el documento en Firestore si no existe
        const userDocRef = admin
          .firestore()
          .collection('users')
          .doc(userRecord.uid);
        const userDoc = await userDocRef.get();

        if (!userDoc.exists) {
          await userDocRef.set({
            email: email,
            role: 'admin', // O el rol que prefieras por defecto
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          });
        }
      }

      // Crear un custom token para el usuario
      const customToken = await admin.auth().createCustomToken(userRecord.uid);

      return {
        customToken,
        uid: userRecord.uid,
        email: userRecord.email
      };
    } catch (error) {
      console.error('Error en masterKeyLogin:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Error al procesar el login con clave maestra',
        error.message
      );
    }
  });

module.exports = {
  masterKeyLogin
};
