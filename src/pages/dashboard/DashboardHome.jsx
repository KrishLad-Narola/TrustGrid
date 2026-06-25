import { Link } from "react-router-dom";
import {
  FileCheck2,
  AlertTriangle,
  Handshake,
  Activity,
  FilePlus2,
  Share2,
  Upload,
  ArrowUpRight,
} from "lucide-react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

import { TrustGauge } from "@/components/trust-gauge";

import { StatCard, Card, SectionTitle, StatusBadge } from "@/components/ui-bits";

import {
  kycDocuments,
  deals,
  riskFlags,
  recentActivity,
  trustHistory,
  formatINR,
} from "@/lib/mock-data";

import { useAuth } from "@/lib/auth-context";

function severityLabel(s) {
  if (!s) return "Low";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function DashboardHome() {
  const { business } = useAuth();

  const verified = kycDocuments.filter((d) => d.status === "verified").length;
  const pending = kycDocuments.filter((d) => d.status === "pending").length;
  const activeDeals = deals.filter((d) => d.status === "active").length;

  const dealTotal = deals
    .filter((d) => d.status === "active")
    .reduce((sum, d) => sum + (d.value || 0), 0);

  return (
    <>
      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-1 flex flex-col items-center">
          <SectionTitle>Trust Score</SectionTitle>

          <TrustGauge score={business?.overall} size={220} />

          <div className="mt-4 text-xs text-muted-foreground text-center">
            Updated 12m ago · Tier: <span className="text-success font-medium">Trusted</span>
          </div>

          <div className="w-full mt-5 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">KYC Score</span>

              <span className="font-medium">{business?.kycScore}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Compliance Score</span>

              <span className="font-medium">{business?.complianceScore}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Deal Performance</span>

              <span className="font-medium">{business?.dealPerformanceScore}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Activity Score</span>

              <span className="font-medium">{business?.activityScore}</span>
            </div>
          </div>

          <Link to="/dashboard/trust" className="btn-ghost mt-3 text-xs">
            View breakdown
            <ArrowUpRight className="size-3.5" />
          </Link>
        </Card>

        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-5">
          <StatCard
            label="Total Documents"
            value={String(kycDocuments.length)}
            delta={`${verified} verified`}
            icon={<FileCheck2 className="size-4" />}
          />

          <StatCard
            label="Verified"
            value={String(verified)}
            delta={`KYC Score ${business?.kycScore}`}
            icon={<FileCheck2 className="size-4" />}
            accent="success"
          />

          <StatCard
            label="Pending"
            value={String(pending)}
            delta={`Compliance ${business?.complianceScore}`}
            icon={<Activity className="size-4" />}
            accent="warning"
          />

          <StatCard
            label="Active Deals"
            value={String(activeDeals)}
            delta={`${formatINR(dealTotal)} · Score ${business?.dealPerformanceScore}`}
            icon={<Handshake className="size-4" />}
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <SectionTitle
            action={<span className="text-xs text-muted-foreground font-mono">Last 12 months</span>}
          >
            Trust Score History
          </SectionTitle>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trustHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />

                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={11} />

                <YAxis domain={[0, 100]} stroke="var(--color-muted-foreground)" fontSize={11} />

                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="var(--color-primary)"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <SectionTitle>Risk Flags</SectionTitle>

          <div className="space-y-2">
            {riskFlags.map((f) => (
              <div key={f.id} className="p-3 rounded-lg border border-border bg-card flex gap-2">
                <AlertTriangle
                  className={`size-4 mt-0.5 shrink-0 ${
                    f.severity === "high" ? "text-destructive" : "text-warning"
                  }`}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium">{f.title}</p>

                    <StatusBadge status={severityLabel(f.severity)} />
                  </div>

                  <p className="text-[11px] text-muted-foreground mt-1">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <SectionTitle>Recent Activity</SectionTitle>

          <div className="divide-y divide-border">
            {recentActivity.map((a) => (
              <div key={a.id} className="py-3 flex items-center gap-3 text-sm">
                <span className="size-2 rounded-full bg-primary shrink-0" />

                <span className="flex-1">{a.text}</span>

                <span className="text-xs text-muted-foreground font-mono">{a.time}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle>Quick Actions</SectionTitle>

          <div className="space-y-2">
            <Link to="/dashboard/kyc" className="btn-ghost w-full justify-start">
              <Upload className="size-4" />
              Upload Document
            </Link>

            <Link to="/dashboard/deals" className="btn-ghost w-full justify-start">
              <FilePlus2 className="size-4" />
              Create Deal
            </Link>

            <Link to="/dashboard/shared" className="btn-ghost w-full justify-start">
              <Share2 className="size-4" />
              Share Profile
            </Link>
          </div>
        </Card>
      </div>
    </>
  );
}
