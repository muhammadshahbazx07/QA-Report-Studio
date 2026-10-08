export default function Input({
  label,
  hint,
  error,
  className = "",
  ...props
}) {
  return (
    <label className="block space-y-1.5">
      {label && (
        <span className="text-sm font-medium text-slate-700">{label}</span>
      )}
      <input
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100 ${error ? "border-red-400" : "border-slate-200"} ${className}`}
        {...props}
      />
      {(error || hint) && (
        <span
          className={`text-xs ${error ? "text-red-600" : "text-slate-500"}`}
        >
          {error || hint}
        </span>
      )}
    </label>
  );
}
