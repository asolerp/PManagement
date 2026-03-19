/**
 * Firestore trigger for entrances collection
 * Updates workShifts collection when entrances are created or updated.
 * Propagates companyId from the entrance to the workShift for tenant isolation.
 */
const {
  onDocumentCreated,
  onDocumentUpdated,
} = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
const { REGION } = require("../utils");
const { getDateString, calculateMinutes, generateShiftId } = require("./utils");

/**
 * Trigger when an entrance document is created
 * Creates or updates the corresponding workShift
 */
exports.onEntranceCreated = onDocumentCreated(
  { document: "entrances/{entranceId}", region: REGION },
  async (event) => {
    const entrance = event.data.data();
    const entranceId = event.params.entranceId;

    try {
      if (!entrance.worker?.id || !entrance.date) {
        console.log("Invalid entrance data, skipping:", entranceId);
        return null;
      }

      const db = admin.firestore();
      const workerId = entrance.worker.id;
      const companyId = entrance.companyId || null;
      const dateString = getDateString(entrance.date);
      const shiftId = generateShiftId(workerId, dateString);

      const shiftRef = db.collection("workShifts").doc(shiftId);
      const shiftDoc = await shiftRef.get();

      if (shiftDoc.exists) {
        const shiftData = shiftDoc.data();
        const entranceIds = shiftData.entranceIds || [];

        const currentFirstEntry = shiftData.firstEntry;
        const isEarlier =
          entrance.date.toMillis() < currentFirstEntry.toMillis();

        const updateData = {
          entranceIds: admin.firestore.FieldValue.arrayUnion(entranceId),
          ...(isEarlier && {
            firstEntry: entrance.date,
            entryLocation: entrance.location || null,
          }),
          entranceCount: entranceIds.length + 1,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        if (companyId && !shiftData.companyId) {
          updateData.companyId = companyId;
        }

        await shiftRef.update(updateData);

        console.log(`Updated workShift ${shiftId} with entrance ${entranceId}`);
      } else {
        await shiftRef.set({
          workerId: workerId,
          companyId: companyId,
          workerName:
            entrance.worker.name ||
            `${entrance.worker.firstName || ""} ${entrance.worker.lastName || ""}`.trim(),
          workerEmail: entrance.worker.email || "",
          workerPhoto:
            entrance.worker.profileImage?.small ||
            entrance.worker.profileImage?.thumbnail ||
            null,
          date: dateString,
          firstEntry: entrance.date,
          lastExit: null,
          totalMinutes: 0,
          status: "in_progress",
          entranceIds: [entranceId],
          entranceCount: 1,
          entryLocation: entrance.location || null,
          exitLocation: null,
          house: entrance.house || null,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log(
          `Created new workShift ${shiftId} for entrance ${entranceId}`,
        );
      }

      return null;
    } catch (error) {
      console.error("Error in onEntranceCreated:", error);
      throw error;
    }
  },
);

/**
 * Trigger when an entrance document is updated
 * Updates the workShift when exit is registered
 */
exports.onEntranceUpdated = onDocumentUpdated(
  { document: "entrances/{entranceId}", region: REGION },
  async (event) => {
    const before = event.data.before.data();
    const after = event.data.after.data();
    const entranceId = event.params.entranceId;

    try {
      if (before.exitDate || !after.exitDate) {
        console.log("No new exit registered, skipping:", entranceId);
        return null;
      }

      if (!after.worker?.id || !after.date) {
        console.log("Invalid entrance data, skipping:", entranceId);
        return null;
      }

      const db = admin.firestore();
      const workerId = after.worker.id;
      const dateString = getDateString(after.date);
      const shiftId = generateShiftId(workerId, dateString);

      const shiftRef = db.collection("workShifts").doc(shiftId);
      const shiftDoc = await shiftRef.get();

      if (!shiftDoc.exists) {
        console.log("WorkShift not found for update:", shiftId);
        return null;
      }

      const shiftData = shiftDoc.data();

      const currentLastExit = shiftData.lastExit;
      const isLater =
        !currentLastExit ||
        after.exitDate.toMillis() > currentLastExit.toMillis();

      if (isLater) {
        const totalMinutes = calculateMinutes(
          shiftData.firstEntry,
          after.exitDate,
        );

        const updateData = {
          lastExit: after.exitDate,
          exitLocation: after.exitLocation || null,
          totalMinutes: totalMinutes,
          status: "completed",
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        if (after.companyId && !shiftData.companyId) {
          updateData.companyId = after.companyId;
        }

        await shiftRef.update(updateData);

        console.log(
          `Updated workShift ${shiftId} with exit. Total: ${totalMinutes} minutes`,
        );
      }

      return null;
    } catch (error) {
      console.error("Error in onEntranceUpdated:", error);
      throw error;
    }
  },
);
