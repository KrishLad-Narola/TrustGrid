import { useAuth } from "@/lib/auth-context";
import { Navigate, Outlet } from "react-router-dom";
import { GlobalLoader } from "@/App";

const PublicRoutes = () => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return <GlobalLoader />;

  if (isAuthenticated) {
    if (user?.scope === "SYSTEM") return <Navigate to="/admin" replace />;
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
};

export default PublicRoutes;
