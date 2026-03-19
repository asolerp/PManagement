#!/usr/bin/env node
/**
 * Migration script: Rename Firestore collections
 *
 * Copies all documents (and their subcollections) from old collection names
 * to new collection names in the same Firestore database.
 *
 * Usage:
 *   cd functions
 *   GOOGLE_APPLICATION_CREDENTIALS=path/to/key.json node migrations/renameCollections.js [--delete-old]
 *
 * Options:
 *   --delete-old   Delete documents from old collections after copying (default: keep both)
 *
 * Collections renamed:
 *   houses      -> properties
 *   incidences  -> incidents
 *   entrances   -> timeEntries
 *   checks      -> checkTemplates  (root catalog only)
 */

const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const DELETE_OLD = process.argv.includes("--delete-old");
const BATCH_SIZE = 400;

const RENAMES = [
  {
    from: "houses",
    to: "properties",
    subcollections: [],
  },
  {
    from: "incidences",
    to: "incidents",
    subcollections: ["messages", "photos"],
  },
  {
    from: "entrances",
    to: "timeEntries",
    subcollections: [],
  },
  {
    from: "checks",
    to: "checkTemplates",
    subcollections: [],
  },
];

async function copyDocument(sourceRef, destRef) {
  const snap = await sourceRef.get();
  if (!snap.exists) return false;
  await destRef.set(snap.data());
  return true;
}

async function copySubcollection(sourceDocRef, destDocRef, subName) {
  const snapshot = await sourceDocRef.collection(subName).get();
  if (snapshot.empty) return 0;

  let count = 0;
  let batch = db.batch();
  let batchCount = 0;

  for (const doc of snapshot.docs) {
    const destSubRef = destDocRef.collection(subName).doc(doc.id);
    batch.set(destSubRef, doc.data());
    count++;
    batchCount++;

    if (batchCount >= BATCH_SIZE) {
      await batch.commit();
      batch = db.batch();
      batchCount = 0;
    }
  }

  if (batchCount > 0) {
    await batch.commit();
  }

  return count;
}

async function deleteCollection(collectionRef) {
  const snapshot = await collectionRef.get();
  if (snapshot.empty) return 0;

  let count = 0;
  let batch = db.batch();
  let batchCount = 0;

  for (const doc of snapshot.docs) {
    batch.delete(doc.ref);
    count++;
    batchCount++;

    if (batchCount >= BATCH_SIZE) {
      await batch.commit();
      batch = db.batch();
      batchCount = 0;
    }
  }

  if (batchCount > 0) {
    await batch.commit();
  }

  return count;
}

async function migrateCollection({ from, to, subcollections }) {
  console.log(`\n--- Migrating: ${from} -> ${to} ---`);

  const sourceSnapshot = await db.collection(from).get();
  if (sourceSnapshot.empty) {
    console.log(`  Collection "${from}" is empty. Skipping.`);
    return;
  }

  console.log(`  Found ${sourceSnapshot.size} documents in "${from}"`);

  let docsCopied = 0;
  let subDocsCopied = 0;

  for (const sourceDoc of sourceSnapshot.docs) {
    const sourceRef = db.collection(from).doc(sourceDoc.id);
    const destRef = db.collection(to).doc(sourceDoc.id);

    const copied = await copyDocument(sourceRef, destRef);
    if (copied) docsCopied++;

    for (const subName of subcollections) {
      const subCount = await copySubcollection(sourceRef, destRef, subName);
      subDocsCopied += subCount;
      if (subCount > 0) {
        console.log(`    ${sourceDoc.id}/${subName}: ${subCount} docs`);
      }
    }
  }

  console.log(`  Copied: ${docsCopied} docs + ${subDocsCopied} subdocs`);

  if (DELETE_OLD) {
    console.log(`  Deleting old collection "${from}"...`);
    for (const sourceDoc of sourceSnapshot.docs) {
      for (const subName of subcollections) {
        await deleteCollection(
          db.collection(from).doc(sourceDoc.id).collection(subName),
        );
      }
    }
    const deleted = await deleteCollection(db.collection(from));
    console.log(`  Deleted: ${deleted} docs from "${from}"`);
  }
}

async function main() {
  console.log("=== Firestore Collection Rename Migration ===");
  console.log(
    `Mode: ${DELETE_OLD ? "COPY + DELETE old" : "COPY only (old preserved)"}`,
  );
  console.log(
    `Project: ${process.env.GCLOUD_PROJECT || admin.app().options.projectId || "default"}`,
  );

  for (const rename of RENAMES) {
    await migrateCollection(rename);
  }

  console.log("\n=== Migration complete ===");

  if (!DELETE_OLD) {
    console.log(
      "\nOld collections preserved. Run with --delete-old to remove them.",
    );
  }
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
