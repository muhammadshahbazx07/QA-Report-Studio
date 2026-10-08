import { ChevronDown, Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { statusColor } from "../../core/Utils/colors";
export default function StatusSelect({ statuses, value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const selected = statuses.find((s) => s.id === value);
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-left text-sm font-semibold hover:border-slate-300"
      >
        <span className="flex items-center gap-2">
          {selected ? (
            <>
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: statusColor(selected.colorKey) }}
              />
              {selected.label}
            </>
          ) : (
            <span className="font-normal text-slate-400">Select result</span>
          )}
        </span>
        <ChevronDown size={16} className="text-slate-400" />
      </button>
      {open && (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
          {statuses.map((s) => (
            <button
              type="button"
              key={s.id}
              onClick={() => {
                onChange(s);
                setOpen(false);
              }}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-slate-50"
            >
              <span className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: statusColor(s.colorKey) }}
                />
                {s.label}
              </span>
              {s.id === value && <Check size={15} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
