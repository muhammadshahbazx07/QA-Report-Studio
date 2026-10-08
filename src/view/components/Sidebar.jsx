import {
  LayoutDashboard,
  Settings,
  LogOut,
  FolderKanban,
  Menu,
  X,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { listProjects } from "../../core/Services/firestoreService";
import { projectColor } from "../../core/Utils/colors";
import { useAuth } from "../../core/Context/AuthContext";
import { APP_NAME } from "../../core/Constants/app";

const navClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${isActive ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"}`;

export default function Sidebar() {
  const [projects, setProjects] = useState([]);
  const [open, setOpen] = useState(false);
  const { logout, user } = useAuth();
  const location = useLocation();
  useEffect(() => {
    listProjects()
      .then(setProjects)
      .catch(() => {});
  }, [location.pathname]);
  const content = (
    <>
      <div className="flex h-20 items-center justify-between border-b border-[var(--sidebar-border)] px-5">
        <div>
          <div className="text-xs font-bold uppercase tracking-[.2em] text-blue-400">
            Shahbaz
          </div>
          <div className="font-bold text-white">{APP_NAME}</div>
        </div>
        <button
          className="text-slate-400 lg:hidden"
          onClick={() => setOpen(false)}
        >
          <X size={20} />
        </button>
      </div>
      <div className="scrollbar-thin flex-1 overflow-y-auto px-3 py-4">
        <NavLink
          to="/dashboard"
          className={navClass}
          onClick={() => setOpen(false)}
        >
          <LayoutDashboard size={18} />
          Dashboard
        </NavLink>
        <div className="mt-6 px-3 text-[11px] font-bold uppercase tracking-[.18em] text-slate-500">
          Projects
        </div>
        <div className="mt-2 space-y-1">
          {projects.map((p) => (
            <NavLink
              key={p.id}
              to={`/projects/${p.id}`}
              className={navClass}
              onClick={() => setOpen(false)}
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: projectColor(p.colorKey) }}
              />
              <span className="truncate">{p.name}</span>
            </NavLink>
          ))}
        </div>
      </div>
      <div className="border-t border-[var(--sidebar-border)] p-3">
        <NavLink
          to="/settings/statuses"
          className={navClass}
          onClick={() => setOpen(false)}
        >
          <Settings size={18} />
          Status Settings
        </NavLink>
        <button
          onClick={logout}
          className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white"
        >
          <LogOut size={18} />
          Sign out
        </button>
        <div className="mt-3 truncate px-3 text-xs text-slate-600">
          {user?.email}
        </div>
      </div>
    </>
  );
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-40 rounded-xl bg-slate-950 p-2.5 text-white shadow-lg lg:hidden"
      >
        <Menu size={20} />
      </button>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col bg-[var(--sidebar-bg)] lg:flex">
        {content}
      </aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-950/50"
            onClick={() => setOpen(false)}
          />
          <aside className="relative flex h-full w-72 flex-col bg-[var(--sidebar-bg)]">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
