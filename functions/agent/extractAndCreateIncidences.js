/**
 * A partir de una transcripción de voz, extrae propiedad e incidencias con el LLM
 * y crea las incidencias usando la tool createIncidence.
 */

const OPENAI_API = 'https://api.openai.com/v1/chat/completions';

const EXTRACT_SYSTEM = `Eres un asistente que analiza transcripciones de inspecciones de viviendas.
Del texto debes extraer:
1. propertyName: nombre o identificador de la propiedad/casa (ej: "Casa Bendinat", "Bendinat", "Apartamento 3").
2. incidents: lista de incidencias o averías mencionadas. Cada una con title (título breve) y opcionalmente description (detalle).

Responde ÚNICAMENTE con un JSON válido, sin markdown ni texto alrededor, con esta forma:
{"propertyName":"nombre de la casa","incidents":[{"title":"Título de la incidencia","description":"opcional detalle"},...]}

Si no se puede identificar la propiedad, usa propertyName "". Si no hay incidencias claras, devuelve incidents: [].`;

async function extractFromTranscription(apiKey, transcription) {
  const res = await fetch(OPENAI_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: EXTRACT_SYSTEM },
        { role: 'user', content: transcription }
      ],
      max_tokens: 800,
      temperature: 0.2,
      response_format: { type: 'json_object' }
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI extract error: ${res.status} ${err}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error('Empty extraction response');

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (_) {
    throw new Error('La respuesta del modelo no es JSON válido');
  }

  const propertyName =
    typeof parsed.propertyName === 'string' ? parsed.propertyName.trim() : '';
  const incidents = Array.isArray(parsed.incidents)
    ? parsed.incidents
        .filter(i => i && typeof i.title === 'string' && i.title.trim())
        .map(i => ({
          title: String(i.title).trim(),
          description:
            typeof i.description === 'string' ? i.description.trim() : undefined
        }))
    : [];

  return { propertyName, incidents };
}

async function createIncidencesFromExtraction(
  _companyId,
  extraction,
  runToolFn,
  photoUrls = [],
  overrideProperty = null
) {
  const { propertyName, incidents } = extraction;
  const propName = overrideProperty?.propertyName || propertyName || '';
  const propId = overrideProperty?.propertyId || null;
  if (!propName && !propId) {
    return {
      created: 0,
      message:
        'No se pudo identificar la propiedad en la transcripción. Indica el nombre de la casa en el audio.'
    };
  }
  if (incidents.length === 0) {
    return {
      created: 0,
      message:
        'No se encontraron incidencias en la transcripción. Describe las averías o problemas en el audio.'
    };
  }

  let created = 0;
  let needConfirm = null;
  const photos = Array.isArray(photoUrls) ? photoUrls : [];

  for (const inc of incidents) {
    const args = {
      title: inc.title,
      description: inc.description || undefined,
      photoUrls: photos
    };
    if (propId) {
      args.propertyId = propId;
    } else {
      args.propertyName = propName;
    }
    const result = await runToolFn('createIncidence', args);
    if (result.includes('Varias propiedades coinciden')) {
      needConfirm = result;
      break;
    }
    if (result.includes('Incidencia creada correctamente')) {
      created += 1;
    } else {
      break;
    }
  }

  if (needConfirm) {
    return {
      created,
      message:
        'Hay varias propiedades con ese nombre. Confirma cuál es en el mensaje anterior y luego vuelve a escribir "Crear incidencias" con el número o ID.',
      needConfirm
    };
  }
  if (created === 0) {
    return {
      created: 0,
      message:
        'No se pudo crear ninguna incidencia. Comprueba que el nombre de la propiedad exista (usa "lista de propiedades" en el bot).'
    };
  }
  return {
    created,
    message: `Se han creado ${created} incidencia${created !== 1 ? 's' : ''} en "${propName}".`
  };
}

module.exports = {
  extractFromTranscription,
  createIncidencesFromExtraction
};
