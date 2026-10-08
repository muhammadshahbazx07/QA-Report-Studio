import { getFirestore } from "firebase-admin/firestore";
import { initializeApp } from "firebase-admin/app";

initializeApp();

const PAGE_SIZE = 500;
const db = getFirestore();

function addTwoCalendarYears(date) {
  const year = date.getUTCFullYear() + 2;
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const expiry = new Date(date);
  expiry.setUTCFullYear(year, month, Math.min(day, lastDay));
  return expiry;
}

async function migrate() {
  let cursor = null;
  let migrated = 0;

  while (true) {
    let request = db
      .collection("reports")
      .orderBy("createdAt", "asc")
      .limit(PAGE_SIZE);
    if (cursor) request = request.startAfter(cursor);
    const page = await request.get();
    if (page.empty) break;

    const batch = db.batch();
    let writes = 0;
    for (const report of page.docs) {
      const data = report.data();
      if (data.expiresAt) continue;
      if (
        typeof data.createdAt !== "number" ||
        !Number.isFinite(data.createdAt)
      ) {
        console.warn(`Skipping report ${report.id}: invalid createdAt value`);
        continue;
      }
      batch.update(report.ref, {
        expiresAt: addTwoCalendarYears(new Date(data.createdAt)),
      });
      writes += 1;
    }
    if (writes) {
      await batch.commit();
      migrated += writes;
    }
    cursor = page.docs.at(-1);
    if (page.size < PAGE_SIZE) break;
  }

  console.info(`Added expiry dates to ${migrated} legacy reports.`);
}

migrate().catch((error) => {
  console.error("Legacy report expiry migration failed:", error);
  process.exitCode = 1;
});
