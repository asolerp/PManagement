/**
 * Tool: lista los trabajadores/usuarios de la empresa (users con companyId).
 */
const admin = require("firebase-admin");

const schema = {
  type: "function",
  function: {
    name: "listWorkers",
    description:
      "Lista los trabajadores y usuarios de la empresa: nombre, email, rol (admin/worker/owner). Útil para 'quién trabaja', 'lista de trabajadores', 'cuántos usuarios hay'.",
    parameters: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Máximo número de usuarios a devolver (por defecto 30)",
        },
        role: {
          type: "string",
          description: "Filtrar por rol: admin, worker, owner. Opcional.",
        },
      },
      required: [],
    },
  },
};

async function run(companyId, args) {
  if (!companyId) return "Falta companyId.";
  const limit = Math.min(Number(args?.limit) || 30, 100);
  const roleFilter = args?.role ? String(args.role).toLowerCase() : null;
  const db = admin.firestore();
  let query = db
    .collection("users")
    .where("companyId", "==", companyId)
    .limit(limit);
  if (roleFilter) {
    query = query.where("role", "==", roleFilter);
  }
  const snap = await query.get();
  const list = snap.docs.map((d) => {
    const data = d.data();
    const name =
      [data.firstName, data.lastName].filter(Boolean).join(" ") ||
      "(sin nombre)";
    const email = data.email || "—";
    const role = data.role || "—";
    return `- [${d.id}] ${name} | ${email} | ${role}`;
  });
  if (list.length === 0) {
    return roleFilter
      ? `No hay usuarios con rol "${roleFilter}" en la empresa.`
      : "No hay usuarios en la empresa.";
  }
  return `Usuarios (${list.length}):\n${list.join("\n")}`;
}

module.exports = { schema, run };
