import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import AdminLayout from "../../view/layouts/AdminLayout";
import LoginPage from "../../view/pages/auth/LoginPage";
import DashboardPage from "../../view/pages/dashboard/DashboardPage";
import ProjectPage from "../../view/pages/projects/ProjectPage";
import TemplateBuilderPage from "../../view/pages/templates/TemplateBuilderPage";
import NewReportPage from "../../view/pages/reports/NewReportPage";
import ReportViewPage from "../../view/pages/reports/ReportViewPage";
import StatusSettingsPage from "../../view/pages/settings/StatusSettingsPage";
import PublicReportPage from "../../view/pages/public/PublicReportPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/r/:reportId" element={<PublicReportPage />} />
      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/projects/:projectId" element={<ProjectPage />} />
        <Route
          path="/projects/:projectId/templates/:templateId/edit"
          element={<TemplateBuilderPage />}
        />
        <Route
          path="/projects/:projectId/templates/:templateId/report/new"
          element={<NewReportPage />}
        />
        <Route path="/reports/:reportId" element={<ReportViewPage />} />
        <Route path="/settings/statuses" element={<StatusSettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
