import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AppShell } from "@/components/app-shell";
import { adminHeaders, resolveHeader } from "@/lib/app-headers";
import { useAuth } from "@/lib/auth-context";
import { GlobalLoader } from "@/App";

export default function AdminLayout() {
  const { pathname } = useLocation();
  const { user, loading } = useAuth();
  const header = resolveHeader(pathname, adminHeaders, adminHeaders["/admin"]);
  if (loading) return <GlobalLoader />;
  if (user?.scope !== "SYSTEM") return <Navigate to="/dashboard" replace />;
  return (
    <AppShell kind="admin" header={header}>
      <Outlet />
    </AppShell>
  );
}
