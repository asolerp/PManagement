/**
 * Callable function to get work shifts for the admin dashboard
 */
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { REGION } = require("../utils");
const { requireAdmin } = require("../lib/tenantAuth");

/**
 * Get work shifts with filters
 * Only accessible by admin users
 */
exports.getWorkShifts = onCall({ region: REGION }, async (request) => {
  try {
    const tenant = await requireAdmin(request);

    const db = admin.firestore();

    const {
      startDate,
      endDate,
      workerId,
      status,
      limit = 100,
    } = request.data || {};

    let query = db
      .collection("workShifts")
      .where("companyId", "==", tenant.companyId);

    if (startDate) {
      query = query.where("date", ">=", startDate);
    }
    if (endDate) {
      query = query.where("date", "<=", endDate);
    }

    if (workerId) {
      query = query.where("workerId", "==", workerId);
    }

    if (status) {
      query = query.where("status", "==", status);
    }

    query = query.orderBy("date", "desc").limit(limit);

    const snapshot = await query.get();

    const shifts = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      shifts.push({
        id: doc.id,
        ...data,
        firstEntry: data.firstEntry?.toDate()?.toISOString() || null,
        lastExit: data.lastExit?.toDate()?.toISOString() || null,
        createdAt: data.createdAt?.toDate()?.toISOString() || null,
        updatedAt: data.updatedAt?.toDate()?.toISOString() || null,
      });
    });

    return {
      success: true,
      shifts,
      count: shifts.length,
    };
  } catch (error) {
    console.error("Error in getWorkShifts:", error);
    if (error instanceof HttpsError) {
      throw error;
    }
    // Si falla por índice no creado o similar, devolver vacío para no romper el dashboard
    if (error?.code === 8 || error?.message?.includes("index")) {
      return { success: true, shifts: [], count: 0 };
    }
    throw new HttpsError(
      "internal",
      "Failed to get work shifts.",
      error.message,
    );
  }
});

/**
 * Get dashboard stats for admins
 */
exports.getWorkShiftStats = onCall({ region: REGION }, async (request) => {
  try {
    const tenant = await requireAdmin(request);

    const db = admin.firestore();

    const { date } = request.data || {};
    const targetDate = date || new Date().toISOString().split("T")[0];

    const todayShifts = await db
      .collection("workShifts")
      .where("companyId", "==", tenant.companyId)
      .where("date", "==", targetDate)
      .get();

    let totalWorkers = 0;
    let completedShifts = 0;
    let inProgressShifts = 0;
    let totalMinutes = 0;

    todayShifts.forEach((doc) => {
      const shift = doc.data();
      totalWorkers++;

      if (shift.status === "completed") {
        completedShifts++;
        totalMinutes += shift.totalMinutes || 0;
      } else {
        inProgressShifts++;
      }
    });

    const workersSnapshot = await db
      .collection("users")
      .where("companyId", "==", tenant.companyId)
      .where("role", "==", "worker")
      .get();

    return {
      success: true,
      stats: {
        date: targetDate,
        totalWorkersToday: totalWorkers,
        completedShifts,
        inProgressShifts,
        totalMinutesWorked: totalMinutes,
        totalHoursWorked: Math.round((totalMinutes / 60) * 100) / 100,
        totalRegisteredWorkers: workersSnapshot.size,
      },
    };
  } catch (error) {
    console.error("Error in getWorkShiftStats:", error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError(
      "internal",
      "Failed to get work shift stats.",
      error.message,
    );
  }
});

/**
 * Get all workers for filter dropdown
 */
exports.getWorkers = onCall({ region: REGION }, async (request) => {
  try {
    const tenant = await requireAdmin(request);

    const db = admin.firestore();

    const snapshot = await db
      .collection("users")
      .where("companyId", "==", tenant.companyId)
      .where("role", "==", "worker")
      .get();

    const workers = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      let photo =
        data.profileImage?.small ||
        data.profileImage?.thumbnail ||
        data.profileImage?.original ||
        (typeof data.profileImage === "string" ? data.profileImage : null) ||
        data.photoURL ||
        data.photo ||
        null;

      workers.push({
        id: doc.id,
        name:
          `${data.firstName || ""} ${data.lastName || ""}`.trim() ||
          data.name ||
          data.email,
        email: data.email,
        photo,
      });
    });

    workers.sort((a, b) => a.name.localeCompare(b.name));

    return {
      success: true,
      workers,
      count: workers.length,
    };
  } catch (error) {
    console.error("Error in getWorkers:", error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError("internal", "Failed to get workers.", error.message);
  }
});
