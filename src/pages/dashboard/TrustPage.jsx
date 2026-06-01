import { useState, useMemo } from "react";
import { ChevronDown, AlertTriangle } from "lucide-react";
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";

import { Card, SectionTitle, StatusBadge } from "@/components/ui-bits";
import { TrustGauge } from "@/components/trust-gauge";
import { trustHistory, riskFlags } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth-context";

const faqs = [
  {
    q: "What affects my trust score?",
    a: "Your score blends KYC authenticity (40%), legal compliance (30%), and transaction history (30%). Each factor is updated continuously from primary registries and on-platform deal performance.",
  },
  {
    q: "How often is my score recalculated?",
    a: "Scores are recomputed in real-time on any verified event — new deal completion, document refresh, dispute resolution, or external risk signal.",
  },
  {
    q: "Can a counterparty see all my documents?",
    a: "No. Only verification status is shared by default. Full document access requires explicit permission grant via Shared Profiles.",
  },
  {
    q: "How do I improve my score?",
    a: "Resolve open risk flags, complete pending KYC artefacts, and close active deals successfully. Most businesses see a 5–10 point lift within 60 days.",
  },
];

function severityLabel(s) {
  if (!s) return "Low";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function TrustPage() {
  const [open, setOpen] = useState(0);

  const { business } = useAuth();

  const trustBreakdown = useMemo(
    () => [
      {
        factor: "KYC Verification",
        weight: 40,
        score: business?.kycScore ?? 0,
        max: 40,
      },
      {
        factor: "Legal Compliance",
        weight: 30,
        score: business?.complianceScore ?? 0,
        max: 30,
      },
      {
        factor: "Deal Performance",
        weight: 20,
        score: business?.dealPerformanceScore ?? 0,
        max: 20,
      },
      {
        factor: "Business Activity",
        weight: 10,
        score: business?.activityScore ?? 0,
        max: 10,
      },
    ],
    [business]
  );

  const total =
    business?.overall ??
    trustBreakdown.reduce((sum, item) => sum + item.score, 0);

  return (
    <>
      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="flex flex-col items-center">
          <TrustGauge score={total} size={240} />

          <div className="text-xs text-muted-foreground mt-2 text-center">
            Out of 100 · Top{" "}
            <span className="text-foreground font-medium">
              12%
            </span>{" "}
            in Logistics
          </div>

          <div className="grid grid-cols-3 gap-3 mt-6 w-full">
            {[
              { l: "30d", v: "+3" },
              { l: "90d", v: "+7" },
              { l: "1y", v: "+14" },
            ].map((s) => (
              <div
                key={s.l}
                className="rounded-lg border border-border py-2.5 text-center"
              >
                <div className="text-[10px] uppercase text-muted-foreground">
                  {s.l}
                </div>

                <div className="font-mono text-success font-semibold">
                  {s.v}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <SectionTitle>Score Breakdown</SectionTitle>

          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[480px]">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left py-2">Factor</th>
                  <th className="text-right">Weight</th>
                  <th className="text-right">Score</th>
                  <th className="text-right w-40">Performance</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {trustBreakdown.map((b) => {
                  const pct =
                    b.max > 0 ? (b.score / b.max) * 100 : 0;

                  return (
                    <tr key={b.factor}>
                      <td className="py-3 font-medium">
                        {b.factor}
                      </td>

                      <td className="py-3 text-right font-mono">
                        {b.weight}%
                      </td>

                      <td className="py-3 text-right font-mono">
                        {b.score}/{b.max}
                      </td>

                      <td className="py-3 text-right gap-2">
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{
                              width: `${Math.min(pct, 100)}%`,
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Card>
        <SectionTitle
          action={
            <span className="text-xs text-muted-foreground font-mono">
              12-month trend
            </span>
          }
        >
          Score History
        </SectionTitle>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trustHistory}>
              <defs>
                <linearGradient
                  id="scoreGrad"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="var(--color-primary)"
                    stopOpacity={0.5}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--color-primary)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border)"
              />

              <XAxis
                dataKey="month"
                stroke="var(--color-muted-foreground)"
                fontSize={11}
              />

              <YAxis
                domain={[60, 100]}
                stroke="var(--color-muted-foreground)"
                fontSize={11}
              />

              <Tooltip
                contentStyle={{
                  background: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                }}
              />

              <Area
                type="monotone"
                dataKey="score"
                stroke="var(--color-primary)"
                strokeWidth={2.5}
                fill="url(#scoreGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-5">
        <Card>
          <SectionTitle>
            <span className="inline-flex items-center gap-2">
              <AlertTriangle className="size-4 text-warning" />
              Risk Flags
            </span>
          </SectionTitle>

          <div className="space-y-2">
            {riskFlags.map((f) => (
              <div
                key={f.id}
                className="p-3 rounded-lg border border-border flex gap-2"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium">
                      {f.title}
                    </p>

                    <StatusBadge
                      status={severityLabel(f.severity)}
                    />
                  </div>

                  <p className="text-[11px] text-muted-foreground mt-1">
                    {f.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle>Frequently Asked</SectionTitle>

          <div className="divide-y divide-border">
            {faqs.map((f, i) => (
              <div key={i} className="py-3">
                <button
                  type="button"
                  onClick={() =>
                    setOpen(open === i ? null : i)
                  }
                  className="w-full flex items-center justify-between text-left"
                >
                  <span className="text-sm font-medium">
                    {f.q}
                  </span>

                  <ChevronDown
                    className={`size-4 text-muted-foreground transition-transform ${
                      open === i ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {open === i && (
                  <p className="text-sm text-muted-foreground mt-2 pr-8">
                    {f.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}