import { useEffect, useState } from "react";
import Modal from "./Modal";
import Input from "./Input";
import Button from "./Button";
import ColorPicker from "./ColorPicker";
import { PROJECT_COLORS } from "../../core/Constants/app";

export default function ProjectFormModal({ open, onClose, onSave, initial }) {
  const [form, setForm] = useState({
    name: "",
    clientName: "",
    colorKey: "blue",
    copyrightText: "",
  });
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (open)
      setForm({
        name: initial?.name || "",
        clientName: initial?.clientName || "",
        colorKey: initial?.colorKey || "blue",
        copyrightText: initial?.copyrightText || "",
      });
  }, [open, initial]);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await onSave(form);
      onClose();
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? "Edit Project" : "Create Project"}
    >
      <form onSubmit={submit} className="space-y-4">
        <Input
          label="Project / Company Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          placeholder="e.g. POS Solution Plus"
        />
        <Input
          label="Client Name"
          value={form.clientName}
          onChange={(e) => setForm({ ...form, clientName: e.target.value })}
          placeholder="Optional"
        />
        <ColorPicker
          colors={PROJECT_COLORS}
          value={form.colorKey}
          onChange={(colorKey) => setForm({ ...form, colorKey })}
        />
        <Input
          label="Copyright line"
          value={form.copyrightText}
          onChange={(e) => setForm({ ...form, copyrightText: e.target.value })}
          placeholder="Optional — can be different for each project"
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={busy}>{busy ? "Saving..." : "Save Project"}</Button>
        </div>
      </form>
    </Modal>
  );
}
