import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import {
  getStatuses,
  saveStatuses,
} from "../../../core/Services/firestoreService";
import { STATUS_COLORS } from "../../../core/Constants/app";
import { makeId } from "../../../core/Utils/id";
import { statusColor } from "../../../core/Utils/colors";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Input from "../../components/Input";
import Modal from "../../components/Modal";
import ColorPicker from "../../components/ColorPicker";
import { useToast } from "../../components/Toast";

const move = (arr, index, dir) => {
  const next = [...arr],
    to = index + dir;
  if (to < 0 || to >= arr.length) return next;
  [next[index], next[to]] = [next[to], next[index]];
  return next;
};
export default function StatusSettingsPage() {
  const [items, setItems] = useState([]);
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const { show } = useToast();
  useEffect(() => {
    getStatuses().then(setItems);
  }, []);
  const persist = async (next) => {
    setItems(next);
    setSaving(true);
    try {
      await saveStatuses(next);
      show("Statuses updated");
    } finally {
      setSaving(false);
    }
  };
  return (
    <>
      <PageHeader
        eyebrow="Global Settings"
        title="Report Statuses"
        description="These options appear in every status dropdown. Colors are controlled by global CSS variables."
        actions={
          <Button onClick={() => setModal({})}>
            <Plus size={16} />
            Add Status
          </Button>
        }
      />
      <Card className="overflow-hidden">
        <div className="divide-y divide-slate-100">
          {items.map((s, index) => (
            <div
              key={s.id}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ background: statusColor(s.colorKey) }}
                />
                <div>
                  <div className="font-semibold">{s.label}</div>
                  <div className="text-xs text-slate-400">
                    {s.requiresIssue
                      ? "Issue/remarks box opens automatically"
                      : "No conditional issue box"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => persist(move(items, index, -1))}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                >
                  <ChevronUp size={16} />
                </button>
                <button
                  onClick={() => persist(move(items, index, 1))}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                >
                  <ChevronDown size={16} />
                </button>
                <Button variant="secondary" onClick={() => setModal(s)}>
                  Edit
                </Button>
                <button
                  onClick={() => persist(items.filter((x) => x.id !== s.id))}
                  className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
      <StatusModal
        value={modal}
        onClose={() => setModal(null)}
        onSave={async (form) => {
          const next = modal?.id
            ? items.map((x) => (x.id === modal.id ? { ...x, ...form } : x))
            : [...items, { id: makeId("status"), ...form }];
          setModal(null);
          await persist(next);
        }}
      />
    </>
  );
}
function StatusModal({ value, onClose, onSave }) {
  const [form, setForm] = useState({
    label: "",
    colorKey: "green",
    requiresIssue: false,
  });
  useEffect(() => {
    if (value)
      setForm({
        label: value.label || "",
        colorKey: value.colorKey || "green",
        requiresIssue: !!value.requiresIssue,
      });
  }, [value]);
  return (
    <Modal
      open={!!value}
      onClose={onClose}
      title={value?.id ? "Edit Status" : "Add Status"}
    >
      <div className="space-y-4">
        <Input
          label="Status Name"
          value={form.label}
          onChange={(e) => setForm({ ...form, label: e.target.value })}
          placeholder="e.g. Blocked"
        />
        <ColorPicker
          label="Status Color"
          colors={STATUS_COLORS}
          value={form.colorKey}
          onChange={(colorKey) => setForm({ ...form, colorKey })}
        />
        <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-3">
          <input
            className="mt-1"
            type="checkbox"
            checked={form.requiresIssue}
            onChange={(e) =>
              setForm({ ...form, requiresIssue: e.target.checked })
            }
          />
          <span>
            <span className="block text-sm font-semibold">
              Require issue / remarks
            </span>
            <span className="block text-xs text-slate-500">
              When selected in a report, an issue text box opens automatically.
            </span>
          </span>
        </label>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={!form.label.trim()} onClick={() => onSave(form)}>
            Save Status
          </Button>
        </div>
      </div>
    </Modal>
  );
}
