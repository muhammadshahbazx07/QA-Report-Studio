export default function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
      {Icon && (
        <div className="mb-4 rounded-2xl bg-slate-100 p-3 text-slate-500">
          <Icon size={24} />
        </div>
      )}
      <h3 className="font-bold text-slate-900">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-slate-500">{text}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
