export const APP_NAME = "QA Report Studio";
export const REPORT_PAGE_SIZE = 10;

export const PROJECT_COLORS = [
  { key: "blue", label: "Blue", css: "var(--color-blue)" },
  { key: "violet", label: "Violet", css: "var(--color-violet)" },
  { key: "emerald", label: "Emerald", css: "var(--color-emerald)" },
  { key: "orange", label: "Orange", css: "var(--color-orange)" },
  { key: "rose", label: "Rose", css: "var(--color-rose)" },
  { key: "cyan", label: "Cyan", css: "var(--color-cyan)" },
  { key: "pink", label: "Pink", css: "var(--color-pink)" },
  { key: "slate", label: "Slate", css: "var(--color-slate)" },
];

export const STATUS_COLORS = [
  { key: "green", label: "Green", css: "var(--color-green)" },
  { key: "red", label: "Red", css: "var(--color-red)" },
  { key: "amber", label: "Amber", css: "var(--color-amber)" },
  { key: "blue", label: "Blue", css: "var(--color-blue)" },
  { key: "gray", label: "Gray", css: "var(--color-gray)" },
  { key: "violet", label: "Violet", css: "var(--color-violet)" },
  { key: "emerald", label: "Emerald", css: "var(--color-emerald)" },
  { key: "orange", label: "Orange", css: "var(--color-orange)" },
  { key: "rose", label: "Rose", css: "var(--color-rose)" },
  { key: "cyan", label: "Cyan", css: "var(--color-cyan)" },
  { key: "pink", label: "Pink", css: "var(--color-pink)" },
  { key: "slate", label: "Slate", css: "var(--color-slate)" },
  { key: "teal", label: "Teal", css: "var(--color-teal)" },
  { key: "lime", label: "Lime", css: "var(--color-lime)" },
  { key: "yellow", label: "Yellow", css: "var(--color-yellow)" },
  { key: "indigo", label: "Indigo", css: "var(--color-indigo)" },
  { key: "purple", label: "Purple", css: "var(--color-purple)" },
  { key: "fuchsia", label: "Fuchsia", css: "var(--color-fuchsia)" },
  { key: "sky", label: "Sky", css: "var(--color-sky)" },
  { key: "brown", label: "Brown", css: "var(--color-brown)" },
];

export const DEFAULT_STATUSES = [
  { id: "pass", label: "Pass", colorKey: "green", requiresIssue: false },
  { id: "failed", label: "Failed", colorKey: "red", requiresIssue: true },
  { id: "pending", label: "Pending", colorKey: "amber", requiresIssue: false },
  {
    id: "not-tested",
    label: "Not Tested",
    colorKey: "gray",
    requiresIssue: false,
  },
  { id: "na", label: "N/A", colorKey: "blue", requiresIssue: false },
];

export const FIELD_TYPES = [
  { value: "status", label: "Status" },
  { value: "text", label: "Short Text" },
  { value: "textarea", label: "Long Text" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "url", label: "URL" },
  { value: "checkbox", label: "Checkbox" },
];
