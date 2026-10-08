import { PROJECT_COLORS, STATUS_COLORS } from "../Constants/app";

const findColor = (list, key, fallback) =>
  list.find((item) => item.key === key)?.css || fallback;

export const projectColor = (key) =>
  findColor(PROJECT_COLORS, key, "var(--color-blue)");
export const statusColor = (key) =>
  findColor(STATUS_COLORS, key, "var(--color-gray)");
