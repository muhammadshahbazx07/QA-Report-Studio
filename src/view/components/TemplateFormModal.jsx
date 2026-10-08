import { useEffect, useState } from "react";
import Modal from "./Modal";
import Input from "./Input";
import Button from "./Button";
export default function TemplateFormModal({ open, onClose, onSave, initial }) {
  const [form, setForm] = useState({ name: "", subtitle: "" });
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (open)
      setForm({ name: initial?.name || "", subtitle: initial?.subtitle || "" });
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
      title={initial ? "Edit Report Template" : "New Report Template"}
    >
      <form onSubmit={submit} className="space-y-4">
        <Input
          label="Template / Portal Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          placeholder="e.g. Admin Portal Daily Testing"
        />
        <Input
          label="Subtitle"
          value={form.subtitle}
          onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
          placeholder="Optional short description"
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={busy}>
            {busy ? "Saving..." : "Save Template"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
