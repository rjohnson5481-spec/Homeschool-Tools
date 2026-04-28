// One-time data migration for Phase 3 Session 4.1.
// Reshapes Firestore from family-wide compliance to per-student compliance.
// Run locally on Rob's machine; firebase-admin reads credentials from
// GOOGLE_APPLICATION_CREDENTIALS env var. Deleted after successful run.

import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}
const db = admin.firestore();

const DRY_RUN = process.env.DRY_RUN === 'true';

console.log(`\n=== Per-Student Compliance Migration ===`);
console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no writes)' : 'LIVE (writes will happen)'}`);
console.log(``);

async function migrate() {
  // Iterate every user (forward-compatible for Phase 4 multi-family).
  // Today there is one user; the script handles N >= 0 cleanly.
  const usersSnapshot = await db.collection('users').get();

  console.log(`Found ${usersSnapshot.size} user(s).`);

  if (usersSnapshot.size === 0) {
    console.log('No users to migrate. Exiting.');
    return;
  }

  let totalWrites = 0;

  for (const userDoc of usersSnapshot.docs) {
    const uid = userDoc.id;
    console.log(`\n--- Processing user: ${uid} ---`);

    // 1. Read student names.
    const studentsDoc = await db.doc(`users/${uid}/settings/students`).get();
    if (!studentsDoc.exists) {
      console.log(`  ⚠ No settings/students doc for ${uid}, skipping user.`);
      continue;
    }
    const names = studentsDoc.data().names || [];
    if (names.length === 0) {
      console.log(`  ⚠ Empty names array for ${uid}, skipping user.`);
      continue;
    }
    console.log(`  Students: ${names.join(', ')}`);

    // 2. Read compliance settings.
    const complianceDoc = await db.doc(`users/${uid}/settings/compliance`).get();
    if (!complianceDoc.exists) {
      console.log(`  ⚠ No settings/compliance doc for ${uid}, skipping user.`);
      continue;
    }
    const compliance = complianceDoc.data();
    const oldRequiredDays  = compliance.requiredDays  ?? 0;
    const oldRequiredHours = compliance.requiredHours ?? 0;
    console.log(`  Old top-level: requiredDays=${oldRequiredDays}, requiredHours=${oldRequiredHours}`);

    // 3. Build requiredByStudent map.
    const requiredByStudent = {};
    for (const name of names) {
      requiredByStudent[name] = {
        requiredDays: oldRequiredDays,
        requiredHours: oldRequiredHours,
      };
    }
    console.log(`  New requiredByStudent:`, JSON.stringify(requiredByStudent, null, 2));

    // 4. Add requiredByStudent to compliance doc. Top-level
    //    requiredDays/requiredHours are PRESERVED — old app code still
    //    reads them. They will be removed in Session 4.4 after the new
    //    app code consumes requiredByStudent (expand-then-contract).
    if (!DRY_RUN) {
      await db.doc(`users/${uid}/settings/compliance`).update({
        requiredByStudent,
      });
    }
    totalWrites++;
    console.log(`  ✓ ${DRY_RUN ? 'WOULD update' : 'Updated'} compliance doc`);

    // 5. Read all schoolDays docs.
    const schoolDaysSnapshot = await db.collection(`users/${uid}/schoolDays`).get();
    console.log(`  Found ${schoolDaysSnapshot.size} schoolDays doc(s)`);

    if (schoolDaysSnapshot.size > 0) {
      const example = schoolDaysSnapshot.docs[0];
      console.log(`  Example before: ${example.id} = ${JSON.stringify(example.data())}`);
    }

    // 6. Replace each schoolDays doc with { hoursByStudent: {} }.
    //    .set() with no merge option fully overwrites the doc, dropping
    //    the old hoursLogged field (test data per Rob's call).
    if (schoolDaysSnapshot.size > 0) {
      const batch = db.batch();
      for (const dayDoc of schoolDaysSnapshot.docs) {
        if (!DRY_RUN) {
          batch.set(dayDoc.ref, { hoursByStudent: {} });
        }
        totalWrites++;
      }
      if (!DRY_RUN) {
        await batch.commit();
      }
      console.log(`  ✓ ${DRY_RUN ? 'WOULD migrate' : 'Migrated'} ${schoolDaysSnapshot.size} schoolDays doc(s)`);
      console.log(`  Example after: ${schoolDaysSnapshot.docs[0].id} = {"hoursByStudent":{}}`);
    }
  }

  console.log(`\n=== Migration ${DRY_RUN ? 'DRY RUN' : 'LIVE'} Complete ===`);
  console.log(`Total writes ${DRY_RUN ? 'that WOULD be performed' : 'performed'}: ${totalWrites}`);
  if (DRY_RUN) {
    console.log(`\nTo execute for real, run again WITHOUT DRY_RUN=true`);
  }
}

migrate()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('\n❌ Migration failed:', err);
    process.exit(1);
  });
