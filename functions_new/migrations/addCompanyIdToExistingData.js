/**
 * Migration: Add companyId to all existing documents.
 *
 * Run with:
 *   node addCompanyIdToExistingData.js <companyId>
 *
 * This script assigns a single companyId to ALL existing documents
 * in the main collections, since before multi-tenant everything
 * belongs to the same (original) company.
 *
 * It also sets Firebase Auth Custom Claims (companyId + role)
 * for each user so their tokens carry tenant info.
 *
 * Idempotent: skips documents that already have a companyId.
 */

const admin = require("firebase-admin");

const serviceAccount = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!serviceAccount) {
  console.error(
    "Set GOOGLE_APPLICATION_CREDENTIALS to your service account key path.",
  );
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const db = admin.firestore();

const COLLECTIONS_TO_MIGRATE = [
  "users",
  "checklists",
  "incidents",
  "jobs",
  "properties",
  "timeEntries",
  "workShifts",
  "recycleBin",
];

const BATCH_LIMIT = 400;

async function migrateCollection(collectionName, companyId) {
  console.log(`\n--- Migrating "${collectionName}" ---`);

  let migrated = 0;
  let skipped = 0;
  let lastDoc = null;
  let hasMore = true;

  while (hasMore) {
    let query = db.collection(collectionName).limit(BATCH_LIMIT);
    if (lastDoc) {
      query = query.startAfter(lastDoc);
    }

    const snapshot = await query.get();

    if (snapshot.empty) {
      hasMore = false;
      break;
    }

    const batch = db.batch();
    let batchCount = 0;

    for (const doc of snapshot.docs) {
      const data = doc.data();

      if (data.companyId) {
        skipped++;
      } else {
        batch.update(doc.ref, { companyId });
        batchCount++;
        migrated++;
      }
    }

    if (batchCount > 0) {
      await batch.commit();
    }

    lastDoc = snapshot.docs[snapshot.docs.length - 1];

    if (snapshot.size < BATCH_LIMIT) {
      hasMore = false;
    }
  }

  console.log(
    `  "${collectionName}": ${migrated} migrated, ${skipped} skipped (already had companyId)`,
  );

  return { migrated, skipped };
}

async function migrateUserClaims(companyId) {
  console.log("\n--- Setting Custom Claims for users ---");

  const usersSnapshot = await db.collection("users").get();
  let updated = 0;
  let errors = 0;

  for (const doc of usersSnapshot.docs) {
    const userData = doc.data();
    const uid = doc.id;
    const role = userData.role || "worker";

    try {
      const currentUser = await admin.auth().getUser(uid);
      const currentClaims = currentUser.customClaims || {};

      if (currentClaims.companyId === companyId) {
        continue;
      }

      await admin.auth().setCustomUserClaims(uid, {
        ...currentClaims,
        companyId,
        role,
      });

      updated++;
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        console.warn(
          `  User ${uid} not found in Auth (orphaned doc), skipping`,
        );
      } else {
        console.error(`  Error setting claims for ${uid}:`, err.message);
      }
      errors++;
    }
  }

  console.log(`  Claims: ${updated} updated, ${errors} errors/skipped`);
  return { updated, errors };
}

async function main() {
  const companyId = process.argv[2];

  if (!companyId) {
    console.error("Usage: node addCompanyIdToExistingData.js <companyId>");
    console.error(
      '\nTo find your company ID, check the "companies" collection in Firestore.',
    );
    console.error(
      "Or first run registerCompany to create a company, then use the returned ID.",
    );
    process.exit(1);
  }

  console.log(`\nMigrating all data to companyId: ${companyId}`);
  console.log("=".repeat(50));

  const companyDoc = await db.collection("companies").doc(companyId).get();
  if (!companyDoc.exists) {
    console.error(`\nCompany "${companyId}" not found in Firestore.`);
    console.error(
      "Create the company first with registerCompany, then run this script.",
    );
    process.exit(1);
  }

  console.log(`Company found: ${companyDoc.data().name || companyId}`);

  const totals = { migrated: 0, skipped: 0 };

  for (const collection of COLLECTIONS_TO_MIGRATE) {
    const result = await migrateCollection(collection, companyId);
    totals.migrated += result.migrated;
    totals.skipped += result.skipped;
  }

  const claimsResult = await migrateUserClaims(companyId);

  console.log("\n" + "=".repeat(50));
  console.log("MIGRATION COMPLETE");
  console.log(`  Documents migrated: ${totals.migrated}`);
  console.log(`  Documents skipped:  ${totals.skipped}`);
  console.log(`  User claims set:    ${claimsResult.updated}`);
  console.log(`  Claim errors:       ${claimsResult.errors}`);

  process.exit(0);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
