/**
 * Motor de reglas deterministas: ajusta prioridades según categoría y palabras clave.
 * Se aplica sobre OperationalAssessment.issues y overallPriority después del reasoning.
 */

const { maxPriority, priorityLevel } = require("../domain");

const SAFETY_KEYWORDS = [
  "seguridad",
  "fuga",
  "escape",
  "humo",
  "cristal",
  "eléctric",
  "enchufe",
  "cable",
  "incendio",
  "gas",
  "leak",
  "flood",
  "smoke",
  "glass",
  "electrical",
];
const CRITICAL_CATEGORIES = ["safety"];
const HIGH_CATEGORIES = ["maintenance", "cleanliness"];
const COSMETIC_CATEGORY = "cosmetic";

/**
 * Sube prioridad si el título/descripción contienen palabras de seguridad o riesgo.
 * @param {string} priority
 * @param {string} title
 * @param {string} description
 * @param {string} category
 * @returns {string} nueva prioridad
 */
function applySafetyRules(priority, title, description, category) {
  const text = `${title} ${description}`.toLowerCase();
  const isSafetyKeyword = SAFETY_KEYWORDS.some((kw) => text.includes(kw));
  if (category === "safety" || isSafetyKeyword) {
    return maxPriority(priority, "critical");
  }
  if (HIGH_CATEGORIES.includes(category) && isSafetyKeyword) {
    return maxPriority(priority, "high");
  }
  return priority;
}

/**
 * Baja prioridad si es solo cosmético.
 * @param {string} priority
 * @param {string} category
 * @returns {string}
 */
function applyCosmeticRule(priority, category) {
  if (
    category === COSMETIC_CATEGORY &&
    priorityLevel(priority) > priorityLevel("low")
  ) {
    return "low";
  }
  return priority;
}

/**
 * Aplica reglas a un issue y devuelve el issue con priority actualizada.
 * @param {object} issue - AssessedIssue
 * @returns {object} issue con priority posiblemente modificada
 */
function applyRulesToIssue(issue) {
  let p = issue.priority;
  p = applySafetyRules(
    p,
    issue.title || "",
    issue.description || "",
    issue.category || "",
  );
  p = applyCosmeticRule(p, issue.category || "");
  return { ...issue, priority: p };
}

/**
 * Aplica reglas a todo el assessment: issues y overallPriority.
 * @param {{ mainContext: string, overallPriority: string, requiresImmediateAction: boolean, issues: object[] }} assessment
 * @returns {{ mainContext: string, overallPriority: string, requiresImmediateAction: boolean, issues: object[] }}
 */
function runRules(assessment) {
  const issues = (assessment.issues || []).map(applyRulesToIssue);
  let overall = assessment.overallPriority || "none";
  for (const i of issues) {
    overall = maxPriority(overall, i.priority);
  }
  const requiresImmediateAction =
    assessment.requiresImmediateAction ||
    overall === "critical" ||
    issues.some((i) => i.priority === "critical" || i.category === "safety");
  return {
    mainContext: assessment.mainContext,
    transcriptionSummary: assessment.transcriptionSummary,
    overallPriority: overall,
    requiresImmediateAction,
    issues,
  };
}

module.exports = {
  runRules,
  applyRulesToIssue,
};
