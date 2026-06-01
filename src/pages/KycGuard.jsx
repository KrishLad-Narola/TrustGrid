import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";

export default function KycGuard() {
  const { user, business, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/" replace />;
  }

  const kycStatus =
    business?.kycStatus?.toUpperCase();

  console.log("KYC STATUS =>", kycStatus);

  if (!kycStatus) {
    return (
      <Navigate
        to="/kyc-submit"
        replace
      />
    );
  }

  // KYC INCOMPLETE
  if (
    kycStatus === "DRAFT" ||
    kycStatus === "PENDING" ||
    kycStatus === "IN_PROGRESS"
  ) {
    return (
      <Navigate
        to="/kyc-submit"
        replace
      />
    );
  }

  // KYC COMPLETED
  else if (
    kycStatus === "SUBMITTED" ||
    kycStatus === "APPROVED" ||
    kycStatus === "COMPLETED"
  ) {
    return <Outlet />;
  }

  return (
    <Navigate
      to="/kyc-submit"
      replace
    />
  );
}