import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileCheck2,
  Gauge,
  Handshake,
  Building2,
  Share2,
  ScrollText,
  Settings,
  ShieldCheck,
  Users,
  ClipboardList,
  AlertOctagon,
  Sparkles,
  LogOut,
} from "lucide-react";

import { useAuth } from "@/lib/auth-context";

const businessNav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/dashboard/kyc", label: "KYC Documents", icon: FileCheck2 },
  { to: "/dashboard/trust", label: "Trust Score", icon: Gauge },
  { to: "/dashboard/deals", label: "My Deals", icon: Handshake },
  { to: "/dashboard/directory", label: "Business Directory", icon: Building2 },
  { to: "/dashboard/shared", label: "Shared Profiles", icon: Share2 },
  { to: "/dashboard/audit", label: "Audit Logs", icon: ScrollText },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
];

const adminNav = [
  { to: "/admin", label: "Admin Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/businesses", label: "Businesses", icon: Users },
  { to: "/admin/kyc", label: "KYC Verifications", icon: ShieldCheck },
  { to: "/admin/trust", label: "Trust Score Mgmt", icon: Gauge },
  { to: "/admin/disputes", label: "Disputes", icon: AlertOctagon },
  { to: "/admin/audit", label: "Audit Logs", icon: ClipboardList },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

function initials(name) {
  if (!name || typeof name !== "string") return "U";
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function AppSidebar({ kind }) {
  const { pathname } = useLocation();
  const { user, business, logout } = useAuth();

  const nav = kind === "admin" ? adminNav : businessNav;
  const variant = kind === "admin" ? "admin" : "business";

  const businessName =
    business?.legalName || user?.businessName || user?.name || "User";

  const displayName = user?.name || user?.email?.split("@")[0] || "User";
  const displayCompany =
    kind === "admin"
      ? "TrustGrid Admin"
      : business?.legalName || user?.businessName || user?.company || businessName;

  const handleLogout = () => logout();

  return (
   <aside className="w-64 h-screen sticky top-0 shrink-0 bg-sidebar border-r border-sidebar-border flex flex-col overflow-hidden">

  {/* Header */}
  <div className="px-5 py-5 border-b border-sidebar-border shrink-0">
  <Link to="/dashboard" className="flex items-start gap-3 min-w-0">
    {/* Fixed-size logo */}
    <div className="size-9 flex-shrink-0 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-sm">
      <Sparkles className="size-5 text-primary-foreground" />
    </div>

    {/* Text container */}
    <div className="min-w-0 flex-1">
      <div className="font-display font-bold tracking-tight text-sidebar-foreground truncate">
        TrustGrid
      </div>

      <div
        className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground "
        title={variant === "admin" ? "Admin Console" : businessName}
      >
        {variant === "admin" ? "Admin Console" : businessName}
      </div>
    </div>
  </Link>
</div>

  {/* Navigation */}
  <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
    {nav.map((item) => {
      const active = item.exact
        ? pathname === item.to
        : pathname === item.to || pathname.startsWith(item.to + "/");

      const Icon = item.icon;

      return (
        <Link
          key={item.to}
          to={item.to}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
            active
              ? "bg-primary/10 text-primary border border-primary/20 font-medium"
              : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
          }`}
        >
          <Icon className="size-4 shrink-0" />

          <span className="truncate">{item.label}</span>

          {active && (
            <span className="ml-auto size-1.5 rounded-full bg-primary shrink-0" />
          )}
        </Link>
      );
    })}
  </nav>

  {/* Footer */}
  <div className="p-3 border-t border-sidebar-border shrink-0">
    <div className="flex items-center gap-2 px-2 py-2 rounded-lg bg-sidebar-accent">
      <div className="size-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-semibold text-primary-foreground shrink-0">
        {initials(displayName)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium truncate">
          {displayName}
        </div>

        <div className="text-[10px] text-muted-foreground truncate">
          {displayCompany}
        </div>
      </div>

      <button
        type="button"
        onClick={handleLogout}
        className="text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
        aria-label="Sign out"
      >
        <LogOut className="size-4" />
      </button>
    </div>
  </div>
</aside>
  );
}
