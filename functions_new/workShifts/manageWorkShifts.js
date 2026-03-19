/**
 * Functions for manual work shift management by admins
 */
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { REGION } = require("../utils");
const { requireAdmin } = require("../lib/tenantAuth");
const { generateShiftId, calculateMinutes } = require("./utils");

/**
 * Create a manual work shift (for admin corrections)
 */
exports.createWorkShift = onCall({ region: REGION }, async (request) => {
  try {
    const tenant = await requireAdmin(request);

    const db = admin.firestore();

    const { workerId, date, firstEntry, lastExit, notes } = request.data || {};

    if (!workerId || !date || !firstEntry) {
      throw new HttpsError(
        "invalid-argument",
        "workerId, date, and firstEntry are required.",
      );
    }

    const workerDoc = await db.collection("users").doc(workerId).get();
    if (!workerDoc.exists) {
      throw new HttpsError("not-found", "Worker not found.");
    }
    const workerData = workerDoc.data();

    if (workerData.companyId !== tenant.companyId) {
      throw new HttpsError(
        "permission-denied",
        "Worker does not belong to your company.",
      );
    }

    const shiftId = generateShiftId(workerId, date);

    const existingShift = await db.collection("workShifts").doc(shiftId).get();
    if (existingShift.exists) {
      throw new HttpsError(
        "already-exists",
        "A work shift already exists for this worker on this date.",
      );
    }

    const firstEntryTimestamp = admin.firestore.Timestamp.fromDate(
      new Date(firstEntry),
    );
    const lastExitTimestamp = lastExit
      ? admin.firestore.Timestamp.fromDate(new Date(lastExit))
      : null;

    const totalMinutes = lastExitTimestamp
      ? calculateMinutes(firstEntryTimestamp, lastExitTimestamp)
      : 0;

    const shiftData = {
      companyId: tenant.companyId,
      workerId,
      workerName:
        workerData.name ||
        `${workerData.firstName || ""} ${workerData.lastName || ""}`.trim(),
      workerEmail: workerData.email || "",
      workerPhoto:
        workerData.profileImage?.small ||
        workerData.profileImage?.thumbnail ||
        null,
      date,
      firstEntry: firstEntryTimestamp,
      lastExit: lastExitTimestamp,
      totalMinutes,
      status: lastExitTimestamp ? "completed" : "in_progress",
      entranceIds: [],
      entranceCount: 0,
      entryLocation: null,
      exitLocation: null,
      house: null,
      isManual: true,
      createdBy: tenant.uid,
      notes: notes || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection("workShifts").doc(shiftId).set(shiftData);

    console.log(`Admin ${tenant.uid} created manual shift ${shiftId}`);

    return {
      success: true,
      shiftId,
      message: "Work shift created successfully.",
    };
  } catch (error) {
    console.error("Error in createWorkShift:", error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError(
      "internal",
      "Failed to create work shift.",
      error.message,
    );
  }
});

/**
 * Update an existing work shift (for admin corrections)
 */
exports.updateWorkShift = onCall({ region: REGION }, async (request) => {
  try {
    const tenant = await requireAdmin(request);

    const db = admin.firestore();

    const { shiftId, firstEntry, lastExit, notes, status } = request.data || {};

    if (!shiftId) {
      throw new HttpsError("invalid-argument", "shiftId is required.");
    }

    const shiftRef = db.collection("workShifts").doc(shiftId);
    const shiftDoc = await shiftRef.get();

    if (!shiftDoc.exists) {
      throw new HttpsError("not-found", "Work shift not found.");
    }

    const currentData = shiftDoc.data();

    if (currentData.companyId && currentData.companyId !== tenant.companyId) {
      throw new HttpsError(
        "permission-denied",
        "You can only update work shifts from your company.",
      );
    }

    const updateData = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastModifiedBy: tenant.uid,
    };

    if (firstEntry) {
      updateData.firstEntry = admin.firestore.Timestamp.fromDate(
        new Date(firstEntry),
      );
    }

    if (lastExit !== undefined) {
      updateData.lastExit = lastExit
        ? admin.firestore.Timestamp.fromDate(new Date(lastExit))
        : null;
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const newFirstEntry = updateData.firstEntry || currentData.firstEntry;
    const newLastExit =
      updateData.lastExit !== undefined
        ? updateData.lastExit
        : currentData.lastExit;

    if (newFirstEntry && newLastExit) {
      updateData.totalMinutes = calculateMinutes(newFirstEntry, newLastExit);
      updateData.status = status || "completed";
    } else if (status) {
      updateData.status = status;
    }

    await shiftRef.update(updateData);

    console.log(`Admin ${tenant.uid} updated shift ${shiftId}`);

    return {
      success: true,
      message: "Work shift updated successfully.",
    };
  } catch (error) {
    console.error("Error in updateWorkShift:", error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError(
      "internal",
      "Failed to update work shift.",
      error.message,
    );
  }
});

/**
 * Delete a work shift (for admin corrections)
 */
exports.deleteWorkShift = onCall({ region: REGION }, async (request) => {
  try {
    const tenant = await requireAdmin(request);

    const db = admin.firestore();

    const { shiftId } = request.data || {};

    if (!shiftId) {
      throw new HttpsError("invalid-argument", "shiftId is required.");
    }

    const shiftRef = db.collection("workShifts").doc(shiftId);
    const shiftDoc = await shiftRef.get();

    if (!shiftDoc.exists) {
      throw new HttpsError("not-found", "Work shift not found.");
    }

    const currentData = shiftDoc.data();

    if (currentData.companyId && currentData.companyId !== tenant.companyId) {
      throw new HttpsError(
        "permission-denied",
        "You can only delete work shifts from your company.",
      );
    }

    await shiftRef.delete();

    console.log(`Admin ${tenant.uid} deleted shift ${shiftId}`);

    return {
      success: true,
      message: "Work shift deleted successfully.",
    };
  } catch (error) {
    console.error("Error in deleteWorkShift:", error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError(
      "internal",
      "Failed to delete work shift.",
      error.message,
    );
  }
});
