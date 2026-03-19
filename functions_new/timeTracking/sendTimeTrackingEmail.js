const admin = require("firebase-admin");
const { REGION } = require("../utils");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { requireAdmin } = require("../lib/tenantAuth");
const { runExportTimeTrackingToExcel } = require("./exportTimeTrackingToExcel");

/**
 * Genera el informe de tiempo y devuelve el enlace de descarga.
 * Envío por email desactivado.
 */
exports.sendTimeTrackingEmail = onCall(
  { region: REGION, timeoutSeconds: 540, memory: "1GiB" },
  async (request) => {
    try {
      const tenant = await requireAdmin(request);

      const { startDate, endDate, workerId } = request.data;

      if (!startDate || !endDate) {
        throw new HttpsError(
          "invalid-argument",
          "startDate and endDate are required.",
        );
      }

      const exportResult = await runExportTimeTrackingToExcel(
        { startDate, endDate, workerId },
        request.auth,
        tenant.companyId,
      );

      if (!exportResult.success) {
        throw new HttpsError("internal", "Failed to generate Excel report.");
      }

      return {
        success: true,
        message: "Report generated. Email sending is disabled.",
        downloadUrl: exportResult.downloadUrl,
        fileName: exportResult.fileName,
        recordCount: exportResult.recordCount,
      };
    } catch (error) {
      if (error instanceof HttpsError) {
        throw error;
      }
      console.error("Error generating time tracking report:", error);
      throw new HttpsError(
        "internal",
        "Failed to generate time tracking report.",
        error.message,
      );
    }
  },
);
