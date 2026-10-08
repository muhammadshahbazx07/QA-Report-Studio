import {
  addDoc,
  collection,
  getCountFromServer,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "../Firebase/firebase";
import { DEFAULT_STATUSES, REPORT_PAGE_SIZE } from "../Constants/app";

const now = () => Date.now();

export async function listProjects() {
  const snap = await getDocs(collection(db, "projects"));
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
}

export async function getProject(id) {
  const snap = await getDoc(doc(db, "projects", id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function createProject(data) {
  return addDoc(collection(db, "projects"), {
    ...data,
    createdAt: now(),
    updatedAt: now(),
  });
}

export async function updateProject(id, data) {
  return updateDoc(doc(db, "projects", id), { ...data, updatedAt: now() });
}

export async function deleteProject(id) {
  const templates = await listTemplates(id);
  await deleteReports({ projectId: id });
  await Promise.all(
    templates.map((item) => deleteDoc(doc(db, "templates", item.id))),
  );
  await deleteDoc(doc(db, "projects", id));
}

export async function listTemplates(projectId) {
  const snap = await getDocs(collection(db, "templates"));
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((item) => !projectId || item.projectId === projectId)
    .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
}

export async function getTemplate(id) {
  const snap = await getDoc(doc(db, "templates", id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function createTemplate(data) {
  return addDoc(collection(db, "templates"), {
    ...data,
    sections: data.sections || [],
    createdAt: now(),
    updatedAt: now(),
  });
}

export async function updateTemplate(id, data) {
  return updateDoc(doc(db, "templates", id), { ...data, updatedAt: now() });
}

export async function deleteTemplate(id) {
  await deleteReports({ templateId: id });
  await deleteDoc(doc(db, "templates", id));
}

function reportConstraints(filters = {}) {
  const constraints = [];
  if (filters.projectId) {
    constraints.push(where("projectId", "==", filters.projectId));
  }
  if (filters.templateId) {
    constraints.push(where("templateId", "==", filters.templateId));
  }
  if (filters.published !== undefined) {
    constraints.push(where("published", "==", filters.published));
  }
  if (filters.startDate) {
    constraints.push(where("reportDate", ">=", filters.startDate));
  }
  if (filters.endDate) {
    constraints.push(where("reportDate", "<=", filters.endDate));
  }
  return constraints;
}

export async function getReportsPage(
  filters = {},
  cursor = null,
  pageSize = REPORT_PAGE_SIZE,
) {
  const constraints = [
    ...reportConstraints(filters),
    orderBy("reportDate", "desc"),
  ];
  if (cursor) constraints.push(startAfter(cursor));
  constraints.push(limit(pageSize + 1));
  const snap = await getDocs(query(collection(db, "reports"), ...constraints));
  const hasNext = snap.docs.length > pageSize;
  const visibleDocs = snap.docs.slice(0, pageSize);
  return {
    reports: visibleDocs.map((d) => ({ id: d.id, ...d.data() })),
    hasNext,
    cursor: visibleDocs.at(-1) || null,
  };
}

export async function getReportsCount(filters = {}) {
  const snap = await getCountFromServer(
    query(collection(db, "reports"), ...reportConstraints(filters)),
  );
  return snap.data().count;
}

async function deleteReports(filters = {}) {
  const constraints = reportConstraints(filters);
  while (true) {
    const snap = await getDocs(
      query(collection(db, "reports"), ...constraints, limit(500)),
    );
    if (snap.empty) return;
    const batch = writeBatch(db);
    snap.docs.forEach((report) => batch.delete(report.ref));
    await batch.commit();
    if (snap.size < 500) return;
  }
}

export async function getReport(id) {
  const snap = await getDoc(doc(db, "reports", id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function createReport(data) {
  const createdAt = now();
  const expirationDate = new Date(createdAt);
  const originalDay = expirationDate.getUTCDate();
  expirationDate.setUTCFullYear(expirationDate.getUTCFullYear() + 2);
  if (expirationDate.getUTCDate() !== originalDay) {
    expirationDate.setUTCDate(0);
  }
  const ref = await addDoc(collection(db, "reports"), {
    ...data,
    createdAt,
    expiresAt: Timestamp.fromDate(expirationDate),
    updatedAt: createdAt,
  });
  return ref;
}

export async function updateReport(id, data) {
  return updateDoc(doc(db, "reports", id), { ...data, updatedAt: now() });
}

export async function deleteReport(id) {
  return deleteDoc(doc(db, "reports", id));
}

export async function getStatuses() {
  const snap = await getDoc(doc(db, "settings", "statuses"));
  if (
    !snap.exists() ||
    !Array.isArray(snap.data().items) ||
    !snap.data().items.length
  ) {
    await setDoc(doc(db, "settings", "statuses"), {
      items: DEFAULT_STATUSES,
      updatedAt: now(),
    });
    return DEFAULT_STATUSES;
  }
  return snap.data().items;
}

export async function saveStatuses(items) {
  await setDoc(
    doc(db, "settings", "statuses"),
    { items, updatedAt: now() },
    { merge: true },
  );
}
