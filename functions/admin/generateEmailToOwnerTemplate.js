/**
 * Genera una plantilla de email para propietarios (asunto, cuerpo texto y HTML)
 * usando OpenAI. Guarda el resultado en el cliente; esta función solo genera.
 */
const admin = require('firebase-admin');
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const { REGION } = require('../utils');

const OPENAI_API_KEY = defineSecret('OPENAI_API_KEY');

const SYSTEM_PROMPT = `Eres un diseñador de emails que genera plantillas profesionales en español para empresas de mantenimiento de propiedades de lujo.
El email se envía al propietario cuando se finaliza una revisión de su propiedad.

Debes devolver ÚNICAMENTE un objeto JSON válido con exactamente estas tres claves (sin markdown, sin comentarios):
- "subject": asunto del email. Usa placeholders {{nombrePropiedad}} y {{fecha}} donde encaje.
- "body": versión en texto plano del mismo contenido (para clientes sin HTML).
- "htmlBody": HTML del email con DISEÑO ATRACTIVO. Requisitos:
  * Estilos inline en cada elemento (emails no soportan <style> en muchos clientes).
  * Contenedor principal: max-width 560px, margin auto, font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif.
  * CABECERA: bloque con fondo en color (por ejemplo #0e5a82 o #126D9B), texto blanco, padding 24px, título tipo "Resumen de revisión" o similar, tipografía clara.
  * CUERPO: fondo blanco o #f9fafb, padding 24px, texto gris oscuro (#1f2937), line-height 1.6. Incluir un saludo y una frase que use {{nombrePropiedad}} y {{fecha}}.
  * BLOQUE DESTACADO para el resumen: una caja con fondo suave (ej. #f0f9ff o #ecfdf5), borde izquierdo de color (ej. #126D9B o #059669), padding 16px, margin arriba/abajo. Dentro poner el placeholder {{resumen}} con estilo de texto legible (blanco de espacio, listas si conviene).
  * PIE: texto pequeño (#6b7280), padding 24px, posible línea superior (#e5e7eb), despedida cordial.
  * Sin JavaScript, solo HTML y estilos inline. Diseño que se vea moderno y cuidado, no un correo plano.`;

const USER_PROMPT = companyName =>
  `Genera la plantilla para la empresa${companyName ? ` "${companyName}"` : ''}. El tono debe ser cercano y profesional. El HTML debe verse con buen diseño visual, no soso.`;

async function callOpenAI(apiKey, companyName) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: USER_PROMPT(companyName) }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.6
    })
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('OpenAI API error:', res.status, err);
    throw new HttpsError(
      'internal',
      'Error al generar la plantilla. Comprueba que OPENAI_API_KEY esté configurado.'
    );
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new HttpsError('internal', 'Respuesta vacía de OpenAI.');

  try {
    return JSON.parse(content);
  } catch (_) {
    console.error('OpenAI JSON parse error:', content);
    throw new HttpsError('internal', 'La IA no devolvió un formato válido.');
  }
}

const generateEmailToOwnerTemplate = onCall(
  {
    region: REGION,
    timeoutSeconds: 60,
    memory: '256MiB',
    invoker: 'public',
    secrets: [OPENAI_API_KEY]
  },
  async request => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated.');
    }
    const apiKey = OPENAI_API_KEY.value();
    if (!apiKey) {
      throw new HttpsError(
        'failed-precondition',
        'No está configurada la clave OPENAI_API_KEY. Configúrala en Firebase: firebase functions:secrets:set OPENAI_API_KEY'
      );
    }

    let companyName = null;
    const settingsSnap = await admin
      .firestore()
      .collection('settings')
      .doc('general')
      .get();
    if (settingsSnap.exists) {
      companyName = settingsSnap.data().companyName ?? null;
    }

    const result = await callOpenAI(apiKey, companyName);

    return {
      subject: result.subject ?? '',
      body: result.body ?? '',
      htmlBody: result.htmlBody ?? ''
    };
  }
);

module.exports = {
  generateEmailToOwnerTemplate
};
