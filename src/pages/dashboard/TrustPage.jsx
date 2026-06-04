import { useState, useMemo, useEffect } from "react";
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

import axiosInstance from "@/API/axiosInstance";
import { Card, SectionTitle, StatusBadge } from "@/components/ui-bits";
import { TrustGauge } from "@/components/trust-gauge";
import { riskFlags } from "@/lib/mock-data";

const faqs = [
  {
    q: "What affects my trust score?",
    a: "Your score is based on KYC verification, compliance checks, successful deals, and account activity.",
  },
  {
    q: "How often is my score recalculated?",
    a: "Trust score recalculates automatically whenever trust-impacting events happen.",
  },
  {
    q: "Can a counterparty see all my documents?",
    a: "No. Only verification status is visible unless explicit access is granted.",
  },
  {
    q: "How do I improve my score?",
    a: "Complete KYC, resolve compliance issues, and maintain successful transactions.",
  },
];

const defaultScore = {
  overall: 0,
  kycScore: 0,
  complianceScore: 0,
  dealPerformanceScore: 0,
  activityScore: 0,
};

const num = (v) => Number(v) || 0;

function severityLabel(s) {
  if (!s) return "Low";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function TrustPage() {
  const [open, setOpen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trustScore, setTrustScore] = useState(defaultScore);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchTrustScore();
  }, []);

  const fetchTrustScore = async () => {
    try {
      setLoading(true);

      const response = await axiosInstance.get("/trustscore");

      const apiData = response?.data?.data || response?.data || {};
      const scoreData = apiData?.trustScore || apiData?.score || apiData;

      setTrustScore({
        overall: num(scoreData?.overall),
        kycScore: num(scoreData?.kycScore),
        complianceScore: num(scoreData?.complianceScore),
        dealPerformanceScore: num(scoreData?.dealPerformanceScore),
        activityScore: num(scoreData?.activityScore),
      });

      setHistory(Array.isArray(apiData?.history) ? apiData.history : []);
    } catch (error) {
      console.error("Trust score fetch failed:", error);
      setTrustScore(defaultScore);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const trustBreakdown = useMemo(
    () => [
      {
        factor: "KYC Verification",
        weight: 40,
        score: trustScore.kycScore,
        max: 40,
      },
      {
        factor: "Legal Compliance",
        weight: 20,
        score: trustScore.complianceScore,
        max: 20,
      },
      {
        factor: "Deal Performance",
        weight: 30,
        score: trustScore.dealPerformanceScore,
        max: 30,
      },
      {
        factor: "Business Activity",
        weight: 10,
        score: trustScore.activityScore,
        max: 10,
      },
    ],
    [trustScore]
  );

  const trustHistory = useMemo(() => {
    if (!history.length) {
      const current = trustScore.overall;

      return [
        { month: "Jan", score: 0 },
        { month: "Feb", score: Math.round(current * 0.15) },
        { month: "Mar", score: Math.round(current * 0.3) },
        { month: "Apr", score: Math.round(current * 0.5) },
        { month: "May", score: Math.round(current * 0.7) },
        { month: "Jun", score: Math.round(current * 0.85) },
        { month: "Now", score: current },
      ];
    }

    return history.map((item) => ({
      month: new Date(item.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      }),
      score: num(item.newScore),
    }));
  }, [history, trustScore]);

  const growth = useMemo(() => {
    if (!history.length) return trustScore.overall;
    const first = num(history[0]?.previousScore);
    return trustScore.overall - first;
  }, [history, trustScore]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-sm text-muted-foreground">
        Loading Trust Score...
      </div>
    );
  }

  return (
    <>
      {/* TOP */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="flex flex-col items-center p-5">
          <TrustGauge score={trustScore.overall} size={190} />

          <div className="text-[11px] text-muted-foreground mt-1">
            Out of 100
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4 w-full">
            <div className="rounded-md border py-2 text-center">
              <div className="text-[9px] uppercase tracking-wide text-muted-foreground">
                Current
              </div>
              <div className="text-sm font-semibold text-primary">
                {trustScore.overall}
              </div>
            </div>

            <div className="rounded-md border py-2 text-center">
              <div className="text-[9px] uppercase tracking-wide text-muted-foreground">
                Events
              </div>
              <div className="text-sm font-semibold text-primary">
                {history.length}
              </div>
            </div>

            <div className="rounded-md border py-2 text-center">
              <div className="text-[9px] uppercase tracking-wide text-muted-foreground">
                Growth
              </div>
              <div className="text-sm font-semibold text-green-600">
                +{growth}
              </div>
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2 p-5">
          <SectionTitle className="text-sm font-semibold tracking-tight">
            Score Breakdown
          </SectionTitle>

          <div className="space-y-4 mt-3">
            {trustBreakdown.map((b) => {
              const pct = (b.score / b.max) * 100;

              return (
                <div key={b.factor}>
                  <div className="flex justify-between text-[13px] mb-1.5">
                    <span>{b.factor}</span>
                    <span>
                      {b.score}/{b.max}
                    </span>
                  </div>

                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* HISTORY */}
      <Card className="mt-4 p-5">
        <SectionTitle className="text-sm font-semibold tracking-tight">
          Score History
        </SectionTitle>

        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trustHistory}>
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopOpacity={0.35} />
                  <stop offset="100%" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" fontSize={11} />
              <YAxis domain={[0, 100]} fontSize={11}  />
              <Tooltip />

              <Area
                type="monotone"
                dataKey="score"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="#93c5fd"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* BOTTOM */}
      <div className="grid lg:grid-cols-2 gap-4 mt-4">
        <Card className="p-5">
          <SectionTitle className="text-sm font-semibold tracking-tight">
            <span className="inline-flex items-center gap-2">
              <AlertTriangle className="size-4 text-warning" />
              Risk Flags
            </span>
          </SectionTitle>

          <div className="space-y-2">
            {riskFlags.map((f) => (
              <div key={f.id} className="p-2.5 rounded-md border">
                <div className="flex justify-between">
                  <p className="text-sm font-medium">{f.title}</p>
                  <StatusBadge status={severityLabel(f.severity)} />
                </div>

                <p className="text-[12px] text-muted-foreground mt-1">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <SectionTitle className="text-sm font-semibold tracking-tight">
            Frequently Asked
          </SectionTitle>

          <div className="divide-y">
            {faqs.map((f, i) => (
              <div key={i} className="py-3">
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex justify-between items-center"
                >
                  <span className="text-sm font-medium">{f.q}</span>

                  <ChevronDown
                    className={`size-4 transition-transform ${open === i ? "rotate-180" : ""
                      }`}
                  />
                </button>

                {open === i && (
                  <p className="text-[13px] text-muted-foreground mt-1.5 leading-relaxed">
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