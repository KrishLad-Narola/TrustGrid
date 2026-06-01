/** Route → AppHeader copy (reference UX, current paths) */

export const dashboardHeaders = {
  "/dashboard": {
    title: "Dashboard",
    subtitle: "Snapshot of your trust posture & activity",
  },
  "/dashboard/kyc": {
    title: "KYC Documents",
    subtitle: "Upload, verify, and manage your compliance artifacts",
  },
  "/dashboard/trust": {
    title: "Trust Score",
    subtitle: "Composite trust signal and benchmark history",
  },
  "/dashboard/deals": {
    title: "My Deals",
    subtitle: "Track and manage counterparty transactions",
  },
  "/dashboard/directory": {
    title: "Business Directory",
    subtitle: "Discover verified businesses on the network",
  },
  "/dashboard/shared": {
    title: "Shared Profiles",
    subtitle: "Permissioned trust profiles you've shared",
  },
  "/dashboard/audit": {
    title: "Audit Logs",
    subtitle: "Immutable record of account activity",
  },
  "/dashboard/settings": {
    title: "Settings",
    subtitle: "Account, notifications, and security",
  },
};

export const adminHeaders = {
  "/admin": {
    title: "Admin Dashboard",
    subtitle: "System-wide oversight of verifications and disputes",
  },
  "/admin/businesses": {
    title: "Businesses",
    subtitle: "Search, audit, and manage network businesses",
  },
  "/admin/kyc": {
    title: "KYC Verifications",
    subtitle: "Approve, reject, or escalate document submissions",
  },
  "/admin/trust": {
    title: "Trust Score Management",
    subtitle: "Override, recalibrate, or audit trust scores",
  },
  "/admin/disputes": {
    title: "Disputes",
    subtitle: "Review escalations and apply governance actions",
  },
  "/admin/audit": {
    title: "Audit Logs",
    subtitle: "Network-wide immutable activity ledger",
  },
  "/admin/settings": {
    title: "Admin Settings",
    subtitle: "Platform thresholds and operator preferences",
  },
};

export function resolveHeader(pathname, map, fallback) {
  return map[pathname] ?? fallback;
}
