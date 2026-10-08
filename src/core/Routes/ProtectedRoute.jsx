import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import LoadingScreen from "../../view/components/LoadingScreen";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <LoadingScreen />;
  if (!user)
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}
