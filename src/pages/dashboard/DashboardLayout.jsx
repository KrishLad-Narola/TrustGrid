import { Outlet, useLocation } from "react-router-dom";
import { AppShell } from "@/components/app-shell";
import { dashboardHeaders, resolveHeader } from "@/lib/app-headers";

export default function DashboardLayout() {
  const { pathname } = useLocation();

  const header = resolveHeader(pathname, dashboardHeaders, dashboardHeaders["/dashboard"]);

  return (
    <AppShell kind="business" header={header}>
      <Outlet />
    </AppShell>
  );
}
