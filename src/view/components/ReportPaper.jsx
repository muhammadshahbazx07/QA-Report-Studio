import { CheckCircle2, AlertCircle } from "lucide-react";
import { formatReportDate } from "../../core/Utils/date";
import { projectColor, statusColor } from "../../core/Utils/colors";

const displayValue = (field, response) => {
  if (!response) return "—";
  if (field.type === "status") return response.label || "—";
  if (field.type === "checkbox") return response.value ? "Yes" : "No";
  return response.value || "—";
};

export default function ReportPaper({ report, paperRef }) {
  const accent = projectColor(report.projectColorKey);
  const statusRows = (report.sections || [])
    .flatMap((s) => s.fields || [])
    .filter((f) => f.type === "status")
    .map((f) => report.responses?.[f.id])
    .filter(Boolean);
  const counts = statusRows.reduce((acc, r) => {
    const key = r.label || "Unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  return (
    <div
      ref={paperRef}
      id="report-paper"
      className="report-paper"
      style={{ "--report-accent": accent }}
    >
      <div className="h-2" style={{ background: accent }} />
      <div className="px-[clamp(1rem,4vw,14mm)] py-[clamp(1.5rem,4vw,13mm)]">
        <header className="border-b border-slate-200 pb-6">
          <div className="flex items-start justify-between gap-8">
            <div>
              <div
                className="text-xs font-bold uppercase tracking-[.22em]"
                style={{ color: accent }}
              >
                Daily QA Report
              </div>
              <h1 className="mt-2 text-[28px] font-bold leading-tight text-slate-950">
                {report.templateName}
              </h1>
              {report.templateSubtitle && (
                <p className="mt-2 text-sm text-slate-500">
                  {report.templateSubtitle}
                </p>
              )}
            </div>
            <div className="min-w-40 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-right">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Report Date
              </div>
              <div className="mt-1 text-sm font-bold text-slate-900">
                {formatReportDate(report.reportDate)}
              </div>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-400">
                Project / Company
              </div>
              <div className="mt-1 font-semibold">{report.projectName}</div>
              {report.projectClientName && (
                <div className="text-xs text-slate-500">
                  {report.projectClientName}
                </div>
              )}
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-400">
                Tested By
              </div>
              <div className="mt-1 font-semibold">
                {report.testerName || "—"}
              </div>
            </div>
          </div>
        </header>
        <main className="mt-7 space-y-7">
          {(report.sections || []).map((section, index) => (
            <section key={section.id} className="report-section">
              <div className="mb-3 flex items-center gap-3">
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-white"
                  style={{ background: accent }}
                >
                  {String(index + 1).padStart(2, "0")}
                </div>
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-[.08em] text-slate-900">
                    {section.title}
                  </h2>
                  {section.description && (
                    <p className="mt-0.5 text-xs text-slate-500">
                      {section.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="overflow-hidden rounded-xl border border-slate-200">
                {(section.fields || []).map((field, idx) => {
                  const response = report.responses?.[field.id];
                  return (
                    <div
                      key={field.id}
                      className={`report-row grid grid-cols-[minmax(0,1fr)_minmax(0,40%)] gap-x-4 gap-y-0 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_190px] ${idx ? "border-t border-slate-100" : ""}`}
                    >
                      <div className="min-w-0">
                        <div className="break-words text-sm font-medium text-slate-800">
                          {field.label}
                        </div>
                      </div>
                      <div className="min-w-0 text-right">
                        {field.type === "status" && response ? (
                          <span
                            className="inline-flex max-w-full flex-wrap items-center justify-end gap-1.5 break-words rounded-full px-2.5 py-1 text-left text-xs font-bold"
                            style={{
                              color: statusColor(response.colorKey),
                              background: "#ffffff",
                              border: `1px solid ${statusColor(response.colorKey)}`,
                            }}
                          >
                            <span
                              className="h-1.5 w-1.5 rounded-full"
                              style={{
                                background: statusColor(response.colorKey),
                              }}
                            />
                            {displayValue(field, response)}
                          </span>
                        ) : field.type === "url" && response?.value ? (
                          <a
                            href={response.value}
                            className="break-all text-xs font-medium underline"
                            style={{ color: accent }}
                          >
                            {response.value}
                          </a>
                        ) : (
                          <span className="text-sm font-semibold text-slate-700">
                            {displayValue(field, response)}
                          </span>
                        )}
                      </div>
                      {response?.issue && (
                        <div className="col-span-2 mt-2 min-w-0 rounded-lg border border-red-100 bg-red-50 px-3 py-2 sm:col-span-1">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-red-600">
                            <AlertCircle size={12} />
                            Issue / Remarks
                          </div>
                          <div className="mt-1 break-words text-xs leading-relaxed text-red-800">
                            {response.issue}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </main>
        {statusRows.length > 0 && (
          <section className="report-section mt-8 rounded-xl border border-slate-200 bg-slate-50 p-5">
            <div className="mb-3 flex items-center gap-2">
              <CheckCircle2 size={17} style={{ color: accent }} />
              <h2 className="text-sm font-bold uppercase tracking-wider">
                Summary
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(counts).map(([label, count]) => (
                <div
                  key={label}
                  className="rounded-lg bg-white px-3 py-2 text-xs shadow-sm ring-1 ring-slate-200"
                >
                  <span className="text-slate-500">{label}</span>
                  <span className="ml-2 font-bold text-slate-900">{count}</span>
                </div>
              ))}
            </div>
          </section>
        )}
        <footer className="mt-10 border-t border-slate-200 pt-4 text-center text-[10px] leading-relaxed text-slate-400">
          {report.copyrightText || "Generated by QA Report Studio"}
        </footer>
      </div>
    </div>
  );
}
