import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Edit3,
  GripVertical,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { FIELD_TYPES } from "../../../core/Constants/app";
import {
  getProject,
  getTemplate,
  updateTemplate,
} from "../../../core/Services/firestoreService";
import { makeId } from "../../../core/Utils/id";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Input from "../../components/Input";
import Modal from "../../components/Modal";
import Select from "../../components/Select";
import Textarea from "../../components/Textarea";
import PageHeader from "../../components/PageHeader";
import { useToast } from "../../components/Toast";

const emptyField = {
  label: "",
  type: "status",
  required: false,
  placeholder: "",
};
const move = (arr, index, dir) => {
  const next = [...arr];
  const target = index + dir;
  if (target < 0 || target >= next.length) return next;
  [next[index], next[target]] = [next[target], next[index]];
  return next;
};

export default function TemplateBuilderPage() {
  const { projectId, templateId } = useParams();
  const navigate = useNavigate();
  const { show } = useToast();
  const [project, setProject] = useState(null);
  const [template, setTemplate] = useState(null);
  const [sections, setSections] = useState([]);
  const [sectionModal, setSectionModal] = useState(null);
  const [fieldModal, setFieldModal] = useState(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    Promise.all([getProject(projectId), getTemplate(templateId)]).then(
      ([p, t]) => {
        setProject(p);
        setTemplate(t);
        setSections(t?.sections || []);
      },
    );
  }, [projectId, templateId]);
  if (!template || !project)
    return <div className="text-sm text-slate-500">Loading template...</div>;
  const save = async () => {
    setSaving(true);
    try {
      await updateTemplate(templateId, {
        name: template.name,
        subtitle: template.subtitle || "",
        sections,
      });
      show("Template structure saved");
    } finally {
      setSaving(false);
    }
  };
  const saveSection = (data) => {
    setSections((prev) =>
      sectionModal?.id
        ? prev.map((s) => (s.id === sectionModal.id ? { ...s, ...data } : s))
        : [
            ...prev,
            {
              id: makeId("section"),
              title: data.title,
              description: data.description || "",
              fields: [],
            },
          ],
    );
    setSectionModal(null);
  };
  const deleteSection = (id) =>
    setSections((prev) => prev.filter((s) => s.id !== id));
  const saveField = (data) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== fieldModal.sectionId) return s;
        const fields = fieldModal.field?.id
          ? s.fields.map((f) =>
              f.id === fieldModal.field.id ? { ...f, ...data } : f,
            )
          : [...(s.fields || []), { id: makeId("field"), ...data }];
        return { ...s, fields };
      }),
    );
    setFieldModal(null);
  };
  const deleteField = (sectionId, fieldId) =>
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, fields: s.fields.filter((f) => f.id !== fieldId) }
          : s,
      ),
    );
  return (
    <>
      <PageHeader
        eyebrow={project.name}
        title="Report Structure"
        description={`${template.name} — build once, reuse every day.`}
        actions={
          <>
            <Button
              variant="secondary"
              onClick={() => navigate(`/projects/${projectId}`)}
            >
              <ArrowLeft size={16} />
              Back
            </Button>
            <Button onClick={save} disabled={saving}>
              <Save size={16} />
              {saving ? "Saving..." : "Save Structure"}
            </Button>
          </>
        }
      />
      <Card className="mb-5 p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Template Name"
            value={template.name}
            onChange={(e) => setTemplate({ ...template, name: e.target.value })}
          />
          <Input
            label="Subtitle"
            value={template.subtitle || ""}
            onChange={(e) =>
              setTemplate({ ...template, subtitle: e.target.value })
            }
          />
        </div>
        <div className="mt-3">
          <Button
            variant="secondary"
            onClick={async () => {
              await updateTemplate(templateId, {
                name: template.name,
                subtitle: template.subtitle || "",
                sections,
              });
              show("Template details saved");
            }}
          >
            <Save size={15} />
            Save Details
          </Button>
        </div>
      </Card>
      <div className="space-y-4">
        {sections.map((section, sIndex) => (
          <Card key={section.id} className="overflow-hidden">
            <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3">
              <GripVertical size={17} className="text-slate-300" />
              <div className="min-w-0 flex-1">
                <div className="font-bold text-slate-900">{section.title}</div>
                {section.description && (
                  <div className="truncate text-xs text-slate-500">
                    {section.description}
                  </div>
                )}
              </div>
              <button
                onClick={() => setSections(move(sections, sIndex, -1))}
                className="rounded-lg p-2 text-slate-400 hover:bg-white"
              >
                <ChevronUp size={16} />
              </button>
              <button
                onClick={() => setSections(move(sections, sIndex, 1))}
                className="rounded-lg p-2 text-slate-400 hover:bg-white"
              >
                <ChevronDown size={16} />
              </button>
              <button
                onClick={() => setSectionModal(section)}
                className="rounded-lg p-2 text-slate-400 hover:bg-white"
              >
                <Edit3 size={16} />
              </button>
              <button
                onClick={() => deleteSection(section.id)}
                className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <div className="p-4">
              <div className="space-y-2">
                {(section.fields || []).map((field, fIndex) => (
                  <div
                    key={field.id}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3"
                  >
                    <GripVertical size={16} className="text-slate-300" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-slate-800">
                        {field.label}
                      </div>
                      <div className="mt-0.5 text-xs text-slate-400">
                        {FIELD_TYPES.find((t) => t.value === field.type)
                          ?.label || field.type}
                        {field.required ? " • Required" : ""}
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        setSections((prev) =>
                          prev.map((s) =>
                            s.id === section.id
                              ? { ...s, fields: move(s.fields, fIndex, -1) }
                              : s,
                          ),
                        )
                      }
                      className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                    >
                      <ChevronUp size={15} />
                    </button>
                    <button
                      onClick={() =>
                        setSections((prev) =>
                          prev.map((s) =>
                            s.id === section.id
                              ? { ...s, fields: move(s.fields, fIndex, 1) }
                              : s,
                          ),
                        )
                      }
                      className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                    >
                      <ChevronDown size={15} />
                    </button>
                    <button
                      onClick={() =>
                        setFieldModal({ sectionId: section.id, field })
                      }
                      className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => deleteField(section.id, field.id)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
              <Button
                variant="secondary"
                className="mt-3"
                onClick={() =>
                  setFieldModal({ sectionId: section.id, field: null })
                }
              >
                <Plus size={15} />
                Add Field
              </Button>
            </div>
          </Card>
        ))}
        <button
          onClick={() => setSectionModal({})}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-white py-5 text-sm font-semibold text-slate-500 hover:border-slate-400 hover:text-slate-800"
        >
          <Plus size={18} />
          Add Section / Heading
        </button>
      </div>
      <SectionModal
        value={sectionModal}
        onClose={() => setSectionModal(null)}
        onSave={saveSection}
      />
      <FieldModal
        value={fieldModal}
        onClose={() => setFieldModal(null)}
        onSave={saveField}
      />
    </>
  );
}

function SectionModal({ value, onClose, onSave }) {
  const [form, setForm] = useState({ title: "", description: "" });
  useEffect(() => {
    if (value)
      setForm({
        title: value.title || "",
        description: value.description || "",
      });
  }, [value]);
  return (
    <Modal
      open={!!value}
      onClose={onClose}
      title={value?.id ? "Edit Section" : "Add Section"}
    >
      <div className="space-y-4">
        <Input
          label="Heading"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="e.g. Product Management"
        />
        <Textarea
          label="Description (optional)"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={!form.title.trim()} onClick={() => onSave(form)}>
            Save Section
          </Button>
        </div>
      </div>
    </Modal>
  );
}
function FieldModal({ value, onClose, onSave }) {
  const [form, setForm] = useState(emptyField);
  useEffect(() => {
    if (value) setForm({ ...emptyField, ...(value.field || {}) });
  }, [value]);
  return (
    <Modal
      open={!!value}
      onClose={onClose}
      title={value?.field ? "Edit Field" : "Add Field"}
    >
      <div className="space-y-4">
        <Input
          label="Field / Test Name"
          value={form.label}
          onChange={(e) => setForm({ ...form, label: e.target.value })}
          placeholder="e.g. Product Barcode Scanning"
        />
        <Select
          label="Field Type"
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
        >
          {FIELD_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </Select>
        <Input
          label="Placeholder (optional)"
          value={form.placeholder || ""}
          onChange={(e) => setForm({ ...form, placeholder: e.target.value })}
        />
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={!!form.required}
            onChange={(e) => setForm({ ...form, required: e.target.checked })}
          />
          Required
        </label>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={!form.label.trim()} onClick={() => onSave(form)}>
            Save Field
          </Button>
        </div>
      </div>
    </Modal>
  );
}
