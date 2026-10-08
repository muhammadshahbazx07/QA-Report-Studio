import Modal from "./Modal";
import Button from "./Button";
export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Delete item?",
  text = "This action cannot be undone.",
}) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-sm text-slate-600">{text}</p>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          Delete
        </Button>
      </div>
    </Modal>
  );
}
