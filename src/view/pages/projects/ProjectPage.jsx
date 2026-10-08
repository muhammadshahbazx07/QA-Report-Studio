import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  Edit3,
  FilePlus2,
  Layers3,
  Plus,
  Trash2,
} from "lucide-react";
import {
  createTemplate,
  deleteProject,
  deleteReport,
  deleteTemplate,
  getProject,
  getReportsCount,
  listTemplates,
  updateProject,
} from "../../../core/Services/firestoreService";
import { projectColor } from "../../../core/Utils/colors";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";
import Card from "../../components/Card";
import EmptyState from "../../components/EmptyState";
import ProjectFormModal from "../../components/ProjectFormModal";
import TemplateFormModal from "../../components/TemplateFormModal";
import ConfirmDialog from "../../components/ConfirmDialog";
import ReportsList from "../../components/ReportsList";
import { useToast } from "../../components/Toast";

export default function ProjectPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { show } = useToast();
  const [project, setProject] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [templateCounts, setTemplateCounts] = useState({});
  const [reportListVersion, setReportListVersion] = useState(0);
  const [projectModal, setProjectModal] = useState(false);
  const [templateModal, setTemplateModal] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const load = async () => {
    const [p, t] = await Promise.all([
      getProject(projectId),
      listTemplates(projectId),
    ]);
    const counts = await Promise.all(
      t.map(async (template) => [
        template.id,
        await getReportsCount({
          projectId,
          templateId: template.id,
        }),
      ]),
    );
    setProject(p);
    setTemplates(t);
    setTemplateCounts(Object.fromEntries(counts));
  };
  useEffect(() => {
    load();
  }, [projectId]);
  if (!project)
    return <div className="text-sm text-slate-500">Loading project...</div>;
  const saveProject = async (form) => {
    await updateProject(projectId, form);
    show("Project updated");
    await load();
  };
  const saveTemplate = async (form) => {
    const ref = await createTemplate({ ...form, projectId });
    show("Template created");
    setTemplateModal(false);
    navigate(`/projects/${projectId}/templates/${ref.id}/edit`);
  };
  return (
    <>
      <PageHeader
        eyebrow="Project"
        title={project.name}
        description={
          project.clientName || "Manage templates and saved daily reports."
        }
        actions={
          <>
            <Button variant="secondary" onClick={() => setProjectModal(true)}>
              <Edit3 size={16} />
              Edit Project
            </Button>
            <Button onClick={() => setTemplateModal(true)}>
              <Plus size={16} />
              New Template
            </Button>
          </>
        }
      />
      <Card className="mb-6 overflow-hidden">
        <div
          className="h-1.5"
          style={{ background: projectColor(project.colorKey) }}
        />
        <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-900">
              Project identity
            </div>
            <div className="mt-1 text-sm text-slate-500">
              Selected color is used in sidebar, public reports and PDF accents.
            </div>
            {project.copyrightText && (
              <div className="mt-2 text-xs text-slate-400">
                Footer: {project.copyrightText}
              </div>
            )}
          </div>
          <Button
            variant="danger"
            onClick={() => setConfirm({ type: "project" })}
          >
            <Trash2 size={16} />
            Delete Project
          </Button>
        </div>
      </Card>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold">Report Templates / Portals</h2>
        <span className="text-sm text-slate-400">
          {templates.length} templates
        </span>
      </div>
      {templates.length === 0 ? (
        <EmptyState
          icon={Layers3}
          title="No templates yet"
          text="One project can contain multiple portals, products or report formats."
          action={
            <Button onClick={() => setTemplateModal(true)}>
              <Plus size={16} />
              Create Template
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {templates.map((t) => (
            <Card key={t.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold">{t.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {t.subtitle || "Daily testing template"}
                  </p>
                </div>
                <button
                  onClick={() => setConfirm({ type: "template", item: t })}
                  className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 size={17} />
                </button>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link to={`/projects/${projectId}/templates/${t.id}/edit`}>
                  <Button variant="secondary">
                    <Edit3 size={15} />
                    Structure
                  </Button>
                </Link>
                <Link
                  to={`/projects/${projectId}/templates/${t.id}/report/new`}
                >
                  <Button>
                    <FilePlus2 size={15} />
                    New Report
                  </Button>
                </Link>
              </div>
              <div className="mt-4 text-xs text-slate-400">
                {templateCounts[t.id] || 0} saved reports
              </div>
            </Card>
          ))}
        </div>
      )}
      <div className="mt-8">
        <ReportsList
          key={projectId}
          projects={[]}
          templates={templates}
          fixedProjectId={projectId}
          refreshKey={reportListVersion}
          onDelete={(report) => setConfirm({ type: "report", item: report })}
        />
      </div>
      <ProjectFormModal
        open={projectModal}
        initial={project}
        onClose={() => setProjectModal(false)}
        onSave={saveProject}
      />
      <TemplateFormModal
        open={templateModal}
        onClose={() => setTemplateModal(false)}
        onSave={saveTemplate}
      />
      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title={
          confirm?.type === "project"
            ? "Delete entire project?"
            : "Delete this item?"
        }
        text={
          confirm?.type === "project"
            ? "This deletes the project, all templates and all its saved reports."
            : "This action cannot be undone."
        }
        onConfirm={async () => {
          const c = confirm;
          setConfirm(null);
          if (c.type === "project") {
            await deleteProject(projectId);
            navigate("/dashboard");
            return;
          }
          if (c.type === "template") {
            await deleteTemplate(c.item.id);
            setReportListVersion((version) => version + 1);
          }
          if (c.type === "report") {
            await deleteReport(c.item.id);
            setReportListVersion((version) => version + 1);
          }
          show("Deleted");
          await load();
        }}
      />
    </>
  );
}
