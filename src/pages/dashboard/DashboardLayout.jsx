import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AppShell } from "@/components/app-shell";
import { dashboardHeaders, resolveHeader } from "@/lib/app-headers";
import { GlobalLoader } from "@/App";
import { useAuth } from "@/lib/auth-context";

export default function DashboardLayout() {
  const { pathname } = useLocation();
  const { user, loading } = useAuth();
  const header = resolveHeader(pathname, dashboardHeaders, dashboardHeaders["/dashboard"]);

  if (loading) return <GlobalLoader />;
  if (user?.scope !== "BUSINESS") return <Navigate to="/admin" replace />;

  return (
    <AppShell kind="business" header={header}>
      <Outlet />
    </AppShell>
  );
}
