const admin = require("firebase-admin");
const {
  onDocumentCreated,
  onDocumentUpdated,
  onDocumentDeleted,
} = require("firebase-functions/v2/firestore");
const { REGION } = require("../utils");

const AUDIT_LOG = "auditLog";

function serializeForAudit(data) {
  if (!data || typeof data !== "object") return data;
  const out = {};
  for (const [k, v] of Object.entries(data)) {
    if (v && typeof v.toDate === "function") {
      out[k] = v.toDate().toISOString();
    } else if (v && typeof v.toMillis === "function") {
      out[k] = new Date(v.toMillis()).toISOString();
    } else if (
      v &&
      typeof v === "object" &&
      !Array.isArray(v) &&
      (v.seconds != null || v._seconds)
    ) {
      out[k] = new Date((v.seconds || v._seconds) * 1000).toISOString();
    } else {
      out[k] = v;
    }
  }
  return out;
}

function getActor(data) {
  const last = data?.lastModifiedBy || data?.createdBy;
  if (last && typeof last === "object") {
    return { uid: last.uid, email: last.email || last.emailAddress };
  }
  return null;
}

function buildSummary(resourceType, action, data, resourceId) {
  const title = data?.title || data?.jobName || data?.houseName || resourceId;
  const part = typeof title === "string" ? title.slice(0, 80) : resourceId;
  const actionLabel =
    { created: "Creado", updated: "Actualizado", deleted: "Eliminado" }[
      action
    ] || action;
  return `${resourceType} ${actionLabel}: ${part}`;
}

async function writeAuditLog(companyId, payload) {
  if (!companyId) return;
  const ref = admin.firestore().collection(AUDIT_LOG).doc();
  await ref.set({
    companyId,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    ...payload,
  });
}

function createAuditHandlers(collectionName, resourceTypeLabel) {
  const created = onDocumentCreated(
    { document: `${collectionName}/{docId}`, region: REGION },
    async (event) => {
      const data = event.data.data();
      const companyId = data?.companyId;
      const docId = event.params.docId;
      const actor = getActor(data);
      await writeAuditLog(companyId, {
        action: "created",
        resourceType: resourceTypeLabel,
        resourceId: docId,
        userId: actor?.uid,
        userEmail: actor?.email,
        summary: buildSummary(resourceTypeLabel, "created", data, docId),
      });
    },
  );

  const updated = onDocumentUpdated(
    { document: `${collectionName}/{docId}`, region: REGION },
    async (event) => {
      const before = event.data.before.data();
      const after = event.data.after.data();
      const companyId = after?.companyId || before?.companyId;
      const docId = event.params.docId;
      const actor = getActor(after);
      const changes = {};
      const allKeys = new Set([
        ...Object.keys(before || {}),
        ...Object.keys(after || {}),
      ]);
      for (const key of allKeys) {
        const b = before?.[key];
        const a = after?.[key];
        if (
          JSON.stringify(serializeForAudit(b)) !==
          JSON.stringify(serializeForAudit(a))
        ) {
          changes[key] = {
            before: serializeForAudit(b),
            after: serializeForAudit(a),
          };
        }
      }
      await writeAuditLog(companyId, {
        action: "updated",
        resourceType: resourceTypeLabel,
        resourceId: docId,
        userId: actor?.uid,
        userEmail: actor?.email,
        summary: buildSummary(resourceTypeLabel, "updated", after, docId),
        changes: Object.keys(changes).length ? changes : undefined,
      });
    },
  );

  const deleted = onDocumentDeleted(
    { document: `${collectionName}/{docId}`, region: REGION },
    async (event) => {
      const data = event.data.data();
      const companyId = data?.companyId;
      const docId = event.params.docId;
      const actor = getActor(data);
      await writeAuditLog(companyId, {
        action: "deleted",
        resourceType: resourceTypeLabel,
        resourceId: docId,
        userId: actor?.uid,
        userEmail: actor?.email,
        summary: buildSummary(resourceTypeLabel, "deleted", data, docId),
      });
    },
  );

  return { created, updated, deleted };
}

const incidents = createAuditHandlers("incidents", "incident");
const jobs = createAuditHandlers("jobs", "job");
const checklists = createAuditHandlers("checklists", "checklist");

module.exports = {
  auditLogIncidentCreated: incidents.created,
  auditLogIncidentUpdated: incidents.updated,
  auditLogIncidentDeleted: incidents.deleted,
  auditLogJobCreated: jobs.created,
  auditLogJobUpdated: jobs.updated,
  auditLogJobDeleted: jobs.deleted,
  auditLogChecklistCreated: checklists.created,
  auditLogChecklistUpdated: checklists.updated,
  auditLogChecklistDeleted: checklists.deleted,
};
