import { getFirestore } from "firebase-admin/firestore";
import { initializeApp } from "firebase-admin/app";
import { logger } from "firebase-functions";
import { onSchedule } from "firebase-functions/v2/scheduler";

initializeApp();

const PAGE_SIZE = 500;

function subtractTwoCalendarYears(date) {
  const year = date.getUTCFullYear() - 2;
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const cutoff = new Date(date);
  cutoff.setUTCFullYear(year, month, Math.min(day, lastDay));
  return cutoff;
}

export const deleteExpiredReports = onSchedule(
  {
    schedule: "every day 03:00",
    timeZone: "Etc/UTC",
    timeoutSeconds: 540,
    memory: "256MiB",
  },
  async () => {
    const db = getFirestore();
    const cutoff = subtractTwoCalendarYears(new Date());
    let deleted = 0;

    while (true) {
      const expired = await db
        .collection("reports")
        .where("createdAt", "<=", cutoff.getTime())
        .orderBy("createdAt", "asc")
        .limit(PAGE_SIZE)
        .get();
      if (expired.empty) break;

      const batch = db.batch();
      expired.docs.forEach((report) => batch.delete(report.ref));
      await batch.commit();
      deleted += expired.size;
      if (expired.size < PAGE_SIZE) break;
    }

    logger.info("Expired report cleanup completed", {
      deleted,
      cutoff: cutoff.toISOString(),
    });
  },
);
