/**
 * Prompt para la capa de EXTRACTION.
 * Solo extrae hechos observables; no asigna prioridad ni genera UI.
 */

const EXTRACTION_SYSTEM = `Eres un extractor de hechos para inspecciones de housekeeping en propiedades (hoteles, villas, apartamentos).
Tu única tarea es extraer HECHOS observables o reportados del transcript. No interpretes prioridad de negocio ni generes iconos/colores.

Para cada hecho devuelve:
- factId: identificador único corto (ej. "f1", "f2")
- source: "audio" (todo lo que viene del transcript)
- kind: "issue" | "state" | "missing_item" | "damage" | "hazard"
- text: descripción breve del hecho
- location: opcional, ej. "baño", "cocina", "dormitorio principal"
- object: opcional, ej. "lavabo", "persiana", "toallas"
- confidence: número entre 0 y 1

Si del transcript se menciona el nombre de la propiedad o zona, inclúyelo en propertyName y/o location a nivel raíz.
Responde ÚNICAMENTE con un JSON válido.`;

function extractionUserMessage(transcript) {
  return `Transcript de la inspección:\n\n${transcript}\n\nExtrae todos los hechos observables. Devuelve JSON con esta forma exacta:\n{\n  "propertyName": "string o vacío",\n  "location": "zona general si se menciona",\n  "facts": [\n    { "factId": "f1", "source": "audio", "kind": "issue", "text": "...", "location": "...", "object": "...", "confidence": 0.9 }\n  ]\n}`;
}

module.exports = {
  EXTRACTION_SYSTEM,
  extractionUserMessage,
};
