export default function ColorPicker({
  label = "Color",
  colors,
  value,
  onChange,
}) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-slate-700">{label}</div>
      <div className="flex flex-wrap gap-2.5">
        {colors.map((c) => (
          <button
            key={c.key}
            type="button"
            title={c.label}
            onClick={() => onChange(c.key)}
            className={`h-9 w-9 rounded-xl border-4 transition ${value === c.key ? "border-slate-900 scale-110" : "border-white shadow ring-1 ring-slate-200"}`}
            style={{ background: c.css }}
          />
        ))}
      </div>
    </div>
  );
}
