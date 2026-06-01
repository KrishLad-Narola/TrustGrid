import { Outlet, useLocation } from "react-router-dom";
import { AppShell } from "@/components/app-shell";
import { adminHeaders, resolveHeader } from "@/lib/app-headers";

export default function AdminLayout() {
  const { pathname } = useLocation();

  const header = resolveHeader(pathname, adminHeaders, adminHeaders["/admin"]);

  return (
    <AppShell kind="admin" header={header}>
      <Outlet />
    </AppShell>
  );
}
