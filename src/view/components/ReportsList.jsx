import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  getReportsCount,
  getReportsPage,
} from "../../core/Services/firestoreService";
import { REPORT_PAGE_SIZE } from "../../core/Constants/app";
import { formatReportDate } from "../../core/Utils/date";
import Button from "./Button";
import Card from "./Card";
import EmptyState from "./EmptyState";
import Input from "./Input";
import Select from "./Select";

export default function ReportsList({
  projects = [],
  templates = [],
  fixedProjectId,
  onDelete,
  refreshKey,
}) {
  const [filters, setFilters] = useState({
    projectId: fixedProjectId || "",
    templateId: "",
    status: "",
    startDate: "",
    endDate: "",
  });
  const [pagination, setPagination] = useState({ page: 0, cursors: [null] });
  const [reports, setReports] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [total, setTotal] = useState(null);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const requestId = useRef(0);
  const visibleTemplates = useMemo(
    () =>
      templates.filter(
        (template) =>
          !filters.projectId || template.projectId === filters.projectId,
      ),
    [filters.projectId, templates],
  );

  useEffect(() => {
    setFilters((current) => ({
      ...current,
      projectId: fixedProjectId || "",
      templateId: "",
    }));
    setPagination({ page: 0, cursors: [null] });
  }, [fixedProjectId]);

  const changeFilter = (name, value) => {
    setFilters((current) => ({
      ...current,
      [name]: value,
      ...(name === "projectId" ? { templateId: "" } : {}),
    }));
    setPagination({ page: 0, cursors: [null] });
  };

  useEffect(() => {
    const currentRequest = ++requestId.current;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError("");
      setReports([]);
      setNextCursor(null);
      if (
        filters.startDate &&
        filters.endDate &&
        filters.startDate > filters.endDate
      ) {
        setTotal(0);
        setHasNext(false);
        setError("Start date must be on or before the end date.");
        setLoading(false);
        return;
      }
      const queryFilters = {
        projectId: fixedProjectId || filters.projectId || undefined,
        templateId: filters.templateId || undefined,
        published:
          filters.status === "published"
            ? true
            : filters.status === "draft"
              ? false
              : undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
      };
      try {
        const [page, count] = await Promise.all([
          getReportsPage(
            queryFilters,
            pagination.cursors[pagination.page],
            REPORT_PAGE_SIZE,
          ),
          getReportsCount(queryFilters),
        ]);
        if (cancelled || currentRequest !== requestId.current) return;
        setReports(page.reports);
        setNextCursor(page.cursor);
        setHasNext(page.hasNext);
        setTotal(count);
        if (page.reports.length === 0 && pagination.page > 0) {
          setPagination((current) => ({
            page: current.page - 1,
            cursors: current.cursors.slice(0, -1),
          }));
        }
      } catch (e) {
        if (!cancelled && currentRequest === requestId.current) {
          setError(e.message || "Could not load reports.");
        }
      } finally {
        if (!cancelled && currentRequest === requestId.current) {
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [filters, fixedProjectId, pagination, refreshKey]);

  const pageStart = total === 0 ? 0 : pagination.page * REPORT_PAGE_SIZE + 1;
  const pageEnd =
    total === null
      ? pagination.page * REPORT_PAGE_SIZE + reports.length
      : Math.min((pagination.page + 1) * REPORT_PAGE_SIZE, total);
  const indexCreationUrl = error.match(/https:\/\/console\.firebase\.google\.com\/\S+/)?.[0];

  return (
    <section>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold">Recent Reports</h2>
        <span className="text-sm text-slate-500">
          {total === null ? "Loading count..." : `${total} reports`}
        </span>
      </div>
      <Card className="mb-4 p-4">
        <div
          className={`grid gap-3 sm:grid-cols-2 ${fixedProjectId ? "lg:grid-cols-4" : "lg:grid-cols-5"}`}
        >
          {!fixedProjectId && (
            <Select
              label="Project"
              value={filters.projectId}
              onChange={(event) => changeFilter("projectId", event.target.value)}
            >
              <option value="">All projects</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </Select>
          )}
          <Select
            label="Template"
            value={filters.templateId}
            onChange={(event) => changeFilter("templateId", event.target.value)}
          >
            <option value="">All templates</option>
            {visibleTemplates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </Select>
          <Select
            label="Status"
            value={filters.status}
            onChange={(event) => changeFilter("status", event.target.value)}
          >
            <option value="">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </Select>
          <Input
            label="From"
            type="date"
            value={filters.startDate}
            onChange={(event) => changeFilter("startDate", event.target.value)}
          />
          <Input
            label="To"
            type="date"
            value={filters.endDate}
            onChange={(event) => changeFilter("endDate", event.target.value)}
          />
        </div>
      </Card>

      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-950"
        >
          {indexCreationUrl ? (
            <>
              <div className="font-semibold">Firestore index needs to be enabled</div>
              <p className="mt-1 text-amber-900">
                Firebase needs a composite index to list reports for this
                project. Create it in Firebase Console, wait until its status is
                Enabled, then reload this page.
              </p>
              <a
                href={indexCreationUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex rounded-lg bg-amber-900 px-3 py-2 font-semibold text-white hover:bg-amber-800"
              >
                Create required Firestore index
              </a>
            </>
          ) : (
            <p>{error}</p>
          )}
        </div>
      ) : loading ? (
        <Card className="p-8 text-center text-sm text-slate-500">
          Loading reports...
        </Card>
      ) : reports.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No reports found"
          text="No reports match the selected filters."
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  {!fixedProjectId && <th className="px-4 py-3">Project</th>}
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Template</th>
                  <th className="px-4 py-3">Tester</th>
                  <th className="px-4 py-3">State</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id} className="border-t border-slate-100">
                    {!fixedProjectId && (
                      <td className="px-4 py-3 text-slate-600">
                        {report.projectName || "—"}
                      </td>
                    )}
                    <td className="px-4 py-3 font-medium">
                      {formatReportDate(report.reportDate)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {report.templateName}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {report.testerName || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${report.published ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}
                      >
                        {report.published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Link
                          to={`/reports/${report.id}`}
                          aria-label="Open report"
                          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                        >
                          <ExternalLink size={16} />
                        </Link>
                        {onDelete && (
                          <button
                            onClick={() => onDelete(report)}
                            aria-label="Delete report"
                            className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      <div className="mt-4 flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
        <span className="text-slate-500">
          {total === null
            ? `Page ${pagination.page + 1}`
            : `Page ${pagination.page + 1} · Showing ${pageStart}-${pageEnd} of ${total}`}
        </span>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            disabled={loading || pagination.page === 0}
            onClick={() =>
              setPagination((current) => ({
                page: current.page - 1,
                cursors: current.cursors.slice(0, -1),
              }))
            }
          >
            <ChevronLeft size={16} />
            Previous
          </Button>
          <Button
            variant="secondary"
            disabled={loading || !hasNext}
            onClick={() =>
              setPagination((current) => ({
                page: current.page + 1,
                cursors: [...current.cursors, nextCursor],
              }))
            }
          >
            Next
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    </section>
  );
}
