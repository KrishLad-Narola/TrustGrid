import React from "react";
import { Routes, Route, Link, Navigate, Outlet } from "react-router-dom";
import { Toaster } from "sonner";

import { AuthProvider, useAuth } from "@/lib/auth-context";
import { ThemeProvider } from "../src/lib/ThemeContext";
import { useTheme } from "@/lib/ThemeContext";

/* Public Pages */
import Landing from "@/pages/Landing";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import VerifyEmail from "@/pages/Verifyemail";
import ResetPassword from "@/pages/ResetPassword";

/* Protected Pages */
import ProfilePage from "@/pages/ProfilePage";
import ChangePassword from "@/pages/ChnagePassword";
import KycSubmitPage from "@/pages/KycSubmitPage";

/* Dashboard Pages */
import DashboardLayout from "@/pages/dashboard/DashboardLayout";
import DashboardHome from "@/pages/dashboard/DashboardHome";
import KycPage from "@/pages/dashboard/KycPage";
import TrustPage from "@/pages/dashboard/TrustPage";
import DealsPage from "@/pages/dashboard/DealsPage";
import DirectoryPage from "@/pages/dashboard/DirectoryPage";
import SharedPage from "@/pages/dashboard/SharedPage";
import AuditPage from "@/pages/dashboard/AuditPage";
import SettingsPage from "@/pages/dashboard/SettingsPage";

/* Admin Pages */
import AdminLayout from "@/pages/admin/AdminLayout";
import AdminHome from "@/pages/admin/AdminHome";
import AdminBusinesses from "@/pages/admin/AdminBusinesses";
import AdminKyc from "@/pages/admin/AdminKyc";
import AdminTrust from "@/pages/admin/AdminTrust";
import AdminDisputes from "@/pages/admin/AdminDisputes";
import AdminAudit from "@/pages/admin/AdminAudit";
import AdminSettings from "@/pages/admin/AdminSettings";

import PublicRoutes from "./routes/PublicRoutes";
import KycCompletePage from "./pages/kycComplete";

export function GlobalLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="h-10 w-10 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
    </div>
  );
}

function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-slate-950 px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-slate-900 dark:text-white">404</h1>

        <h2 className="mt-4 text-xl font-semibold text-slate-800 dark:text-slate-200">
          Page not found
        </h2>

        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="mt-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <GlobalLoader />;
  if (!isAuthenticated) return <Navigate to="/" replace />;

  return <Outlet />;
}

function KycFlowCheck() {
  const { business, loading, user } = useAuth();

  if (loading) return <GlobalLoader />;

  if (user?.scope === "SYSTEM") {
    return <Navigate to="/admin" replace />;
  }

  const kycStatus = business?.kycStatus?.trim()?.toUpperCase() || "DRAFT";

  if (kycStatus === "VERIFIED" || kycStatus === "APPROVED") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

function MainAppGuard() {
  const { business, user, loading } = useAuth();

  if (loading) return <GlobalLoader />;

  if (user?.scope === "SYSTEM") {
    return <Outlet />;
  }

  const kycStatus = business?.kycStatus?.trim()?.toUpperCase() || "DRAFT";

  if (kycStatus === "VERIFIED" || kycStatus === "APPROVED") {
    return <Outlet />;
  }

  if (kycStatus === "SUBMITTED" || kycStatus === "UNDER_REVIEW") {
    return <Navigate to="/kyc-complete" replace />;
  }

  return <Navigate to="/kyc-submit" replace />;
}

function DefaultRedirect() {
  const { user, business, loading } = useAuth();

  if (loading) return <GlobalLoader />;

  if (user?.scope === "SYSTEM") {
    return <Navigate to="/admin" replace />;
  }

  const kycStatus = business?.kycStatus?.trim()?.toUpperCase();

  if (kycStatus === "VERIFIED" || kycStatus === "APPROVED") {
    return <Navigate to="/dashboard" replace />;
  }

  if (kycStatus === "SUBMITTED" || kycStatus === "UNDER_REVIEW") {
    return <Navigate to="/kyc-complete" replace />;
  }

  return <Navigate to="/kyc-submit" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicRoutes />}>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/profile" element={<ProfilePage />} />

        <Route element={<KycFlowCheck />}>
          <Route path="/kyc-submit" element={<KycSubmitPage />} />
          <Route path="/kyc-complete" element={<KycCompletePage />} />
        </Route>

        <Route element={<MainAppGuard />}>
          <Route path="/change-password" element={<ChangePassword />} />

          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="kyc" element={<KycPage />} />
            <Route path="trust" element={<TrustPage />} />
            <Route path="deals" element={<DealsPage />} />
            <Route path="directory" element={<DirectoryPage />} />
            <Route path="shared" element={<SharedPage />} />
            <Route path="audit" element={<AuditPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminHome />} />
            <Route path="businesses" element={<AdminBusinesses />} />
            <Route path="kyc" element={<AdminKyc />} />
            <Route path="trust" element={<AdminTrust />} />
            <Route path="disputes" element={<AdminDisputes />} />
            <Route path="audit" element={<AdminAudit />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Route>
      </Route>

      <Route path="/home" element={<DefaultRedirect />} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function AppContent() {
  console.log("AppContent rendered");

  const { theme } = useTheme();

  return (
    <>
      <AppRoutes />
      <Toaster theme={theme} />
    </>
  );
}
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
