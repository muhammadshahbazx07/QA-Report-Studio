import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Send } from "lucide-react";
import {
  createReport,
  getProject,
  getStatuses,
  getTemplate,
} from "../../../core/Services/firestoreService";
import { localDateInputValue } from "../../../core/Utils/date";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Input from "../../components/Input";
import Textarea from "../../components/Textarea";
import StatusSelect from "../../components/StatusSelect";
import PageHeader from "../../components/PageHeader";
import { useToast } from "../../components/Toast";

export default function NewReportPage() {
  const { projectId, templateId } = useParams();
  const navigate = useNavigate();
  const { show } = useToast();
  const [project, setProject] = useState(null);
  const [template, setTemplate] = useState(null);
  const [statuses, setStatuses] = useState([]);
  const [reportDate, setReportDate] = useState(localDateInputValue());
  const [testerName, setTesterName] = useState("");
  const [responses, setResponses] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    Promise.all([
      getProject(projectId),
      getTemplate(templateId),
      getStatuses(),
    ]).then(([p, t, s]) => {
      setProject(p);
      setTemplate(t);
      setStatuses(s);
    });
  }, [projectId, templateId]);
  const totalFields = useMemo(
    () =>
      template?.sections?.reduce((n, s) => n + (s.fields?.length || 0), 0) || 0,
    [template],
  );
  if (!project || !template)
    return <div className="text-sm text-slate-500">Loading report form...</div>;
  const setResponse = (fieldId, patch) =>
    setResponses((prev) => ({
      ...prev,
      [fieldId]: { ...(prev[fieldId] || {}), ...patch },
    }));
  const validate = () => {
    if (!testerName.trim()) return "Tester name is required.";
    for (const section of template.sections || [])
      for (const f of section.fields || [])
        if (f.required) {
          const r = responses[f.id];
          if (f.type === "status" ? !r?.value : !String(r?.value ?? "").trim())
            return `${f.label} is required.`;
        }
    return "";
  };
  const save = async (published) => {
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const ref = await createReport({
        projectId,
        projectName: project.name,
        projectClientName: project.clientName || "",
        projectColorKey: project.colorKey,
        copyrightText: project.copyrightText || "",
        templateId,
        templateName: template.name,
        templateSubtitle: template.subtitle || "",
        reportDate,
        testerName: testerName.trim(),
        sections: template.sections || [],
        responses,
        published,
      });
      show(published ? "Report published" : "Draft saved");
      navigate(`/reports/${ref.id}`);
    } catch (e) {
      setError(e.message || "Could not save report.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <PageHeader
        eyebrow={project.name}
        title={template.name}
        description={`${totalFields} fields • Daily date is pre-filled automatically.`}
        actions={
          <Button
            variant="secondary"
            onClick={() => navigate(`/projects/${projectId}`)}
          >
            <ArrowLeft size={16} />
            Back
          </Button>
        }
      />
      <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {(template.sections || []).map((section, index) => (
            <Card key={section.id} className="overflow-visible">
              <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
                <div className="text-xs font-bold uppercase tracking-[.16em] text-slate-400">
                  Section {String(index + 1).padStart(2, "0")}
                </div>
                <h2 className="mt-1 font-bold">{section.title}</h2>
                {section.description && (
                  <p className="mt-1 text-sm text-slate-500">
                    {section.description}
                  </p>
                )}
              </div>
              <div className="divide-y divide-slate-100">
                {(section.fields || []).map((field) => (
                  <FieldInput
                    key={field.id}
                    field={field}
                    response={responses[field.id]}
                    statuses={statuses}
                    onChange={(patch) => setResponse(field.id, patch)}
                  />
                ))}
              </div>
            </Card>
          ))}
        </div>
        <div className="xl:sticky xl:top-8 xl:self-start">
          <Card className="p-5">
            <h3 className="font-bold">Report Details</h3>
            <div className="mt-4 space-y-4">
              <Input
                label="Report Date"
                type="date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                required
              />
              <Input
                label="Tester Name"
                value={testerName}
                onChange={(e) => setTesterName(e.target.value)}
                placeholder="Click and enter tester name"
                required
              />
            </div>
            {error && (
              <div className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}
            <div className="mt-5 grid gap-2">
              <Button
                variant="secondary"
                disabled={busy}
                onClick={() => save(false)}
              >
                <Save size={16} />
                Save Draft
              </Button>
              <Button disabled={busy} onClick={() => save(true)}>
                <Send size={16} />
                {busy ? "Saving..." : "Publish Report"}
              </Button>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-slate-400">
              Published reports get a public URL. Reports are retained for two
              years from their original creation date, then automatically
              removed.
            </p>
          </Card>
        </div>
      </div>
    </>
  );
}

function FieldInput({ field, response = {}, statuses, onChange }) {
  const common = {
    value: response.value ?? "",
    onChange: (e) => onChange({ value: e.target.value }),
  };
  return (
    <div className="grid gap-3 p-5 md:grid-cols-[minmax(220px,1fr)_minmax(260px,1fr)] md:items-start">
      <div>
        <div className="text-sm font-semibold text-slate-800">
          {field.label}
          {field.required && <span className="ml-1 text-red-500">*</span>}
        </div>
        <div className="mt-1 text-xs text-slate-400">
          {field.type === "status"
            ? "Choose a result from your status settings."
            : field.placeholder || "Enter value"}
        </div>
      </div>
      <div>
        {field.type === "status" ? (
          <>
            <StatusSelect
              statuses={statuses}
              value={response.value}
              onChange={(s) =>
                onChange({
                  value: s.id,
                  label: s.label,
                  colorKey: s.colorKey,
                  requiresIssue: !!s.requiresIssue,
                  issue: s.requiresIssue ? response.issue || "" : "",
                })
              }
            />
            {response.requiresIssue && (
              <div className="mt-3">
                <Textarea
                  label="Issue / Remarks"
                  value={response.issue || ""}
                  onChange={(e) => onChange({ issue: e.target.value })}
                  placeholder="Describe the issue clearly..."
                />
              </div>
            )}
          </>
        ) : field.type === "textarea" ? (
          <Textarea {...common} placeholder={field.placeholder} />
        ) : field.type === "checkbox" ? (
          <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-3 text-sm">
            <input
              type="checkbox"
              checked={!!response.value}
              onChange={(e) => onChange({ value: e.target.checked })}
            />
            Yes / Completed
          </label>
        ) : (
          <Input
            type={
              field.type === "url"
                ? "url"
                : field.type === "number"
                  ? "number"
                  : field.type === "date"
                    ? "date"
                    : "text"
            }
            {...common}
            placeholder={field.placeholder}
          />
        )}
      </div>
    </div>
  );
}
