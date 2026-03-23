/**
 * Prompt para la capa de REASONING.
 * Agrupa hechos, deduplica, convierte en incidencias operativas con categoría y prioridad inicial.
 */

const REASONING_SYSTEM = `Eres un analista operativo de housekeeping. Recibes una lista de hechos extraídos de una inspección (audio/imágenes).
Tu tarea:
1. Agrupar hechos relacionados en una sola incidencia operativa cuando corresponda.
2. Deduplicar.
3. Para cada incidencia: asignar category (safety | cleanliness | maintenance | amenities | cosmetic), priority inicial (critical | high | medium | low), description, impact, recommendedAction.
4. evidenceSource: "audio" | "visual" | "both" | "inference" según de dónde vengan los hechos.
5. confidence: "high" | "medium" | "low".
6. mainContext: resumen en una frase del estado general.
7. overallPriority: la prioridad global (la más alta de las incidencias, o "none" si no hay).
8. requiresImmediateAction: true si hay algo critical o safety.
9. transcriptionSummary: resumen de la inspección en 2-4 frases, lenguaje natural y fluido (para mostrar en el dashboard en lugar del texto crudo). Incluye propiedad, qué se ha revisado y el estado o incidencias principales.
10. reportTitle: título profesional del informe (ej: "INFORME DE REVISIÓN - VILLA AZUL").
11. tasksPerformed: lista final de tareas realizadas (refinada/agrupada, sin duplicados).
12. consolidatedActions: lista priorizada de acciones recomendadas (sin duplicados, ordenadas por urgencia).
13. finalStatus: veredicto final breve del estado de la propiedad.

No inventes hechos. Solo razona a partir de los facts recibidos. Responde ÚNICAMENTE con un JSON válido.`;

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
