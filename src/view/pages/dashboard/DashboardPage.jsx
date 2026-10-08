import { useEffect, useState } from "react";
import {
  FolderKanban,
  FileText,
  Plus,
  ArrowRight,
  Layers3,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  createProject,
  getReportsCount,
  listProjects,
  listTemplates,
} from "../../../core/Services/firestoreService";
import { projectColor } from "../../../core/Utils/colors";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";
import Card from "../../components/Card";
import EmptyState from "../../components/EmptyState";
import ProjectFormModal from "../../components/ProjectFormModal";
import ReportsList from "../../components/ReportsList";
import { useToast } from "../../components/Toast";

export default function DashboardPage() {
  const [projects, setProjects] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [reportCount, setReportCount] = useState(0);
  const [projectReportCounts, setProjectReportCounts] = useState({});
  const [open, setOpen] = useState(false);
  const { show } = useToast();
  const load = async () => {
    const [p, t, count] = await Promise.all([
      listProjects(),
      listTemplates(),
      getReportsCount(),
    ]);
    const counts = await Promise.all(
      p.map(async (project) => [
        project.id,
        await getReportsCount({ projectId: project.id }),
      ]),
    );
    setProjects(p);
    setTemplates(t);
    setReportCount(count);
    setProjectReportCounts(Object.fromEntries(counts));
  };
  useEffect(() => {
    load();
  }, []);
  const save = async (form) => {
    await createProject(form);
    show("Project created");
    await load();
  };
  return (
    <>
      <PageHeader
        eyebrow="Workspace"
        title="Dashboard"
        description="Manage companies/projects, report templates and daily QA reports."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus size={17} />
            New Project
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <div className="text-sm text-slate-500">Projects</div>
          <div className="mt-2 text-3xl font-bold">{projects.length}</div>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-slate-500">Saved Reports</div>
          <div className="mt-2 text-3xl font-bold">{reportCount}</div>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-slate-500">Retention</div>
          <div className="mt-2 text-3xl font-bold">2 years</div>
          <div className="mt-1 text-xs text-slate-400">
            Reports expire from their creation date
          </div>
        </Card>
      </div>
      <div className="mt-7 flex items-center justify-between">
        <h2 className="text-lg font-bold">Projects</h2>
      </div>
      <div className="mt-3">
        {projects.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title="No projects yet"
            text="Create a project/company, then add one or many report templates inside it."
            action={
              <Button onClick={() => setOpen(true)}>
                <Plus size={16} />
                Create Project
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((p) => {
              const count = projectReportCounts[p.id] || 0;
              return (
                <Link key={p.id} to={`/projects/${p.id}`} className="group">
                  <Card className="h-full overflow-hidden p-5 transition hover:-translate-y-0.5 hover:shadow-lg">
                    <div
                      className="mb-4 h-1.5 w-14 rounded-full"
                      style={{ background: projectColor(p.colorKey) }}
                    />
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-slate-950">{p.name}</h3>
                        <p className="mt-1 text-sm text-slate-500">
                          {p.clientName || "No client name"}
                        </p>
                      </div>
                      <ArrowRight
                        size={18}
                        className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-700"
                      />
                    </div>
                    <div className="mt-5 flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <FileText size={14} />
                        {count} reports
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Layers3 size={14} />
                        Multiple templates
                      </span>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
      <div className="mt-8">
        <ReportsList projects={projects} templates={templates} />
      </div>
      <ProjectFormModal
        open={open}
        onClose={() => setOpen(false)}
        onSave={save}
      />
    </>
  );
}
