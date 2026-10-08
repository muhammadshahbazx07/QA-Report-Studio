import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-[var(--app-bg)]">
      <Sidebar />
      <main className="min-h-screen lg:pl-72">
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
