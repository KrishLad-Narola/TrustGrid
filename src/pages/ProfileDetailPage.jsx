import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axiosInstance from "@/API/axiosInstance";
import { toast } from "sonner";

import { Card, StatusBadge } from "@/components/ui-bits";

import {
  ArrowLeft,
  MapPin,
  Building2,
  ShieldCheck,
  Calendar,
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  Clock3,
  FileText,
  Undo2,
} from "lucide-react";

export default function ProfileDetailPage() {
  const { id } = useParams();

  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchProfile = async () => {
      try {
        setLoading(true);

        const res = await axiosInstance.get(`/businesses/${id}/profile`);

        if (!mounted) return;
        const profileData = res?.data;

        if (!profileData) {
          throw new Error("Business profile not found");
        }

        setBusiness(profileData);
      } catch (error) {
        console.error("Profile fetch error:", error);

        toast.error(error?.response?.data?.message || "Failed to load business profile");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading business profile...</p>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="mx-auto mt-10 max-w-lg">
        <Card className="p-8 text-center">
          <h2 className="mb-2 text-lg font-semibold">Business Not Found</h2>

          <p className="mb-6 text-sm text-muted-foreground">
            Unable to load the requested business profile.
          </p>

          <Link
            to="/dashboard/directory"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            <ArrowLeft size={16} />
            Back to Directory
          </Link>
        </Card>
      </div>
    );
  }

  const basicInfo = business?.basicInfo || {};
  const verification = business?.verification || {};
  const dealStats = business?.dealStats || {};

  const tradeName = basicInfo?.tradeName || "Unknown Business";

  const initials = tradeName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const memberSince = basicInfo?.memberSince
    ? new Date(basicInfo.memberSince).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      })
    : "N/A";

  const statCards = [
    {
      title: "Total Deals",
      value: dealStats?.totalDeals ?? 0,
      icon: Briefcase,
    },
    {
      title: "Active Deals",
      value: dealStats?.activeDeals ?? 0,
      icon: Clock3,
    },
    {
      title: "Completed",
      value: dealStats?.completedDeals ?? 0,
      icon: CheckCircle2,
    },
    {
      title: "Disputed",
      value: dealStats?.disputedDeals ?? 0,
      icon: AlertTriangle,
    },
    {
      title: "Completion Rate",
      value: `${dealStats?.completionRate ?? 0}%`,
      icon: ShieldCheck,
    },
  ];

  const InfoItem = ({ label, value }) => (
    <div className="space-y-1">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="font-medium break-words">{value || "-"}</p>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
      {/* Back */}
      <Link
        to="/dashboard/directory"
        className="inline-flex btn-ghost items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <Undo2 size={16} />
        Back to Directory
      </Link>

      {/* Hero Section */}
      <Card className="overflow-hidden border-0 bg-gradient-to-r from-primary/10 via-background to-accent/10 p-0">
        <div className="p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-5">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl btn-primary text-2xl font-bold text-primary-foreground shadow-lg">
                {initials}
              </div>

              <div>
                <h1 className="text-3xl font-bold tracking-tight">{tradeName}</h1>

                <p className="mt-1 text-muted-foreground">
                  {basicInfo?.industry || "Industry Not Available"}
                </p>

                <div className="mt-4 flex flex-wrap gap-3">
                  <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs">
                    <MapPin size={14} />
                    {basicInfo?.city}, {basicInfo?.state}
                  </div>

                  <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs">
                    <Calendar size={14} />
                    Member Since {memberSince}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-start gap-3 md:items-end">
              <div className="rounded-xl border bg-background px-4 py-3 shadow-sm">
                <p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">
                  Verification Status
                </p>

                <StatusBadge status={verification?.kycStatus || "PENDING"} />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {statCards.map((item) => {
          const Icon = item.icon;

          return (
            <Card
              key={item.title}
              className="p-5 transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mb-4 flex items-center justify-between">
                <Icon className="h-5 w-5 text-primary" />
              </div>

              <div className="text-3xl font-bold">{item.value}</div>

              <p className="mt-2 text-sm text-muted-foreground">{item.title}</p>
            </Card>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Business Information */}
        <Card className="lg:col-span-2 p-6">
          <div className="mb-6 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />

            <h2 className="text-lg font-semibold">Business Information</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <InfoItem label="Trade Name" value={basicInfo?.tradeName} />

            <InfoItem label="Legal Name" value={basicInfo?.legalName} />

            <InfoItem label="Company Type" value={basicInfo?.companyType?.replaceAll("_", " ")} />

            <InfoItem label="Industry" value={basicInfo?.industry} />

            <InfoItem label="City" value={basicInfo?.city} />

            <InfoItem label="State" value={basicInfo?.state} />
          </div>
        </Card>

        {/* Verification */}
        <Card className="p-6">
          <div className="mb-6 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />

            <h2 className="text-lg font-semibold">Verification</h2>
          </div>

          <div className="mb-5">
            <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
              KYC Status
            </p>

            <StatusBadge status={verification?.kycStatus || "PENDING"} />
          </div>

          <div>
            <p className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">
              Verified Documents
            </p>

            {verification?.verifiedDocs?.length ? (
              <div className="flex flex-wrap gap-2">
                {verification.verifiedDocs.map((doc) => (
                  <span
                    key={doc}
                    className="inline-flex items-center gap-1 rounded-full border bg-primary/5 px-3 py-1.5 text-xs font-medium"
                  >
                    <FileText size={12} />

                    {doc.replaceAll("_", " ")}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No verified documents found.</p>
            )}
          </div>
        </Card>
      </div>

      {/* Deal Insights */}
      <Card className="p-6">
        <div className="mb-6 flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary" />

          <h2 className="text-lg font-semibold">Deal Performance Overview</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-xl border p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Total Deals</p>

            <p className="mt-2 text-2xl font-bold">{dealStats?.totalDeals ?? 0}</p>
          </div>

          <div className="rounded-xl border p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Active Deals</p>

            <p className="mt-2 text-2xl font-bold">{dealStats?.activeDeals ?? 0}</p>
          </div>

          <div className="rounded-xl border p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Completed Deals
            </p>

            <p className="mt-2 text-2xl font-bold">{dealStats?.completedDeals ?? 0}</p>
          </div>

          <div className="rounded-xl border p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Disputed Deals</p>

            <p className="mt-2 text-2xl font-bold">{dealStats?.disputedDeals ?? 0}</p>
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">Completion Rate</span>

            <span className="text-sm font-semibold">{dealStats?.completionRate ?? 0}%</span>
          </div>

          <div className="h-3 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full btn-primary transition-all duration-500"
              style={{
                width: `${dealStats?.completionRate ?? 0}%`,
              }}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
