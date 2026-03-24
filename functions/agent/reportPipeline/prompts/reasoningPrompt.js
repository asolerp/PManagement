/**
 * Prompt para la capa de REASONING.
 * Agrupa hechos, deduplica, convierte en incidencias operativas con categoría y prioridad inicial.
 */

const REASONING_SYSTEM = `Eres un analista operativo de inspecciones de propiedades. Recibes una lista de hechos extraídos de una inspección.

REGLA FUNDAMENTAL: SOLO trabaja con los facts que recibes. NUNCA inventes, deduzcas ni añadas incidencias, tareas o detalles que no estén respaldados por un fact concreto. Si los facts son pocos o triviales, el informe debe reflejar eso (puede ser breve y positivo).

Tu tarea:
1. Agrupar hechos relacionados en una sola incidencia operativa cuando corresponda.
2. Deduplicar.
3. Para cada incidencia: asignar category (safety | cleanliness | maintenance | amenities | cosmetic), priority inicial (critical | high | medium | low), description, impact, recommendedAction.
4. evidenceSource: "audio" | "visual" | "both" según de dónde vengan los hechos. NUNCA uses "inference".
5. confidence: "high" | "medium" | "low".
6. mainContext: resumen en una frase del estado general (basado SOLO en los facts).
7. overallPriority: la prioridad global (la más alta de las incidencias, o "none" si no hay incidencias).
8. requiresImmediateAction: true SOLO si hay algo critical o safety real.
9. transcriptionSummary: parafrasea lo que dice el transcript en 2-4 frases. NO añadas información que no esté en el transcript. Si el transcript es breve, el resumen debe ser breve.
10. reportTitle: título profesional del informe.
11. tasksPerformed: SOLO las tareas que aparecen en los facts/transcript. Si no hay, devuelve array vacío.
12. consolidatedActions: SOLO acciones derivadas de incidencias reales. Si no hay incidencias, devuelve array vacío.
13. finalStatus: veredicto final breve (puede ser positivo si no hay problemas).

Si no hay incidencias reales, devuelve issues como array vacío y overallPriority "none".
Responde ÚNICAMENTE con un JSON válido.`;

function reasoningUserMessage(extractionJson, metadataJson, transcript = '') {
  const metaStr =
    typeof metadataJson === 'string'
      ? metadataJson
      : JSON.stringify(metadataJson, null, 2);
  const transcriptBlock = transcript
    ? `\n\nTranscript original de la inspección (úsalo para redactar transcriptionSummary de forma natural):\n"""\n${transcript}\n"""\n\n`
    : '';
  return `Datos de extracción:\n${JSON.stringify(extractionJson, null, 2)}\n\nMetadatos opcionales de la inspección:\n${metaStr}${transcriptBlock}Genera el OperationalAssessment en JSON con esta forma:\n{\n  "mainContext": "string",\n  "transcriptionSummary": "string (2-4 frases naturales)",\n  "reportTitle": "string",\n  "tasksPerformed": ["string"],\n  "overallPriority": "critical"|"high"|"medium"|"low"|"none",\n  "requiresImmediateAction": boolean,\n  "issues": [\n    {\n      "issueId": "i1",\n      "title": "string",\n      "category": "safety"|"cleanliness"|"maintenance"|"amenities"|"cosmetic",\n      "priority": "critical"|"high"|"medium"|"low",\n      "location": "string",\n      "description": "string",\n      "impact": "string",\n      "recommendedAction": "string",\n      "evidenceFactIds": ["f1"],\n      "evidenceSource": "audio"|"visual"|"both"|"inference",\n      "confidence": "high"|"medium"|"low"\n    }\n  ],\n  "consolidatedActions": ["string"],\n  "finalStatus": "string"\n}`;
}

module.exports = {
  REASONING_SYSTEM,
  reasoningUserMessage
};
