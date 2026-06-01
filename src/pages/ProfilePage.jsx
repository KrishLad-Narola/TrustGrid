import { Link, useParams } from "react-router-dom";
import { businesses, kycDocuments, deals, riskFlags, formatINR } from "@/lib/mock-data";
import { TrustGauge } from "@/components/trust-gauge";
import { StatusBadge } from "@/components/ui-kit";
import { ShieldCheck, MapPin, Globe, Calendar, Handshake, AlertTriangle, ArrowRight, Lock } from "lucide-react";

export default function ProfilePage() {
  const { id } = useParams();
  const b = businesses.find((x) => x.id === id);

  if (!b) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="text-center">
          <h1 className="font-display text-3xl">Profile not found</h1>
          <Link to="/" className="text-primary">Go home</Link>
        </div>
      </div>
    );
  }

  const docs = kycDocuments.filter((d) => d.status === "verified");
  const completed = deals.filter((d) => d.status === "completed").length;
  const active = deals.filter((d) => d.status === "active").length;

  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[400px] w-[800px] rounded-full bg-primary/20 blur-[120px]" />

      <header className="relative z-10 px-6 lg:px-12 h-16 flex items-center justify-between border-b border-slate-900/[0.06]">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-primary grid place-items-center ">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <div className="font-display font-semibold">Trustline</div>
        </Link>
        <div className="text-xs font-mono text-muted-foreground">Public profile</div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-6 lg:px-12 py-12">
        {/* Header card */}
        <div className="glass-card rounded-3xl p-8 shadow-card">
          <div className="flex flex-wrap items-start gap-8">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary to-primary grid place-items-center text-2xl font-display font-semibold ">{b.logo}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <StatusBadge status={b.kycStatus} />
                <span className="text-xs font-mono text-muted-foreground">Verified by Trustline</span>
              </div>
              <h1 className="font-display text-3xl font-semibold">{b.name}</h1>
              <div className="text-muted-foreground mt-1">{b.industry}</div>
              <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {b.location}</span>
                <span className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5" /> {b.website}</span>
                <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Founded {b.founded}</span>
              </div>
            </div>
            <TrustGauge score={b.trustScore} size={160} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
            <Stat label="Reg. number" value={b.registration} mono />
            <Stat label="GSTIN" value={b.gstin} mono />
            <Stat label="PAN" value={b.pan} mono />
            <Stat label="Active deals" value={String(active)} />
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary text-white text-sm font-medium ">
              <Handshake className="h-4 w-4" /> Initiate deal
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl glass text-sm hover:bg-slate-900/[0.06]">
              <Lock className="h-4 w-4" /> Request full access
            </button>
          </div>
        </div>

        {/* Documents + flags */}
        <div className="grid lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2 glass rounded-2xl p-6">
            <h3 className="font-display text-lg font-semibold mb-4">Verified KYC documents</h3>
            <div className="divide-y divide-slate-900/[0.06]">
              {docs.map((d) => (
                <div key={d.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-success/15 grid place-items-center"><ShieldCheck className="h-4 w-4 text-success" /></div>
                    <div>
                      <div className="text-sm font-medium">{d.type}</div>
                      <div className="text-[10px] font-mono text-muted-foreground">Verified {d.uploadedAt}</div>
                    </div>
                  </div>
                  <StatusBadge status="verified" />
                </div>
              ))}
            </div>
            <div className="mt-3 text-xs text-muted-foreground flex items-center gap-1.5">
              <Lock className="h-3 w-3" /> File contents are not publicly accessible.
            </div>
          </div>

          <div className="space-y-4">
            <div className="glass rounded-2xl p-5">
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Deal history</div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div><div className="font-mono text-2xl">{completed}</div><div className="text-xs text-muted-foreground">Completed</div></div>
                <div><div className="font-mono text-2xl">{active}</div><div className="text-xs text-muted-foreground">Active</div></div>
                <div><div className="font-mono text-2xl">{formatINR(16_500_000)}</div><div className="text-xs text-muted-foreground">Lifetime value</div></div>
                <div><div className="font-mono text-2xl text-success">98%</div><div className="text-xs text-muted-foreground">Completion</div></div>
              </div>
            </div>

            <div className="glass rounded-2xl p-5">
              <h4 className="font-display font-semibold flex items-center gap-2 mb-3"><AlertTriangle className="h-4 w-4 text-warning" /> Risk summary</h4>
              {riskFlags.slice(0, 2).map((f) => (
                <div key={f.id} className="text-xs text-muted-foreground py-1.5 flex items-center gap-2">
                  <span className={`h-1.5 w-1.5 rounded-full ${f.severity === "high" ? "bg-danger" : f.severity === "medium" ? "bg-warning" : "bg-primary"}`} />
                  {f.title}
                </div>
              ))}
              <button className="mt-2 text-xs text-primary inline-flex items-center gap-1 hover:gap-2 transition-all">View full report <ArrowRight className="h-3 w-3" /></button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Stat({ label, value, mono }) {
  return (
    <div className="glass rounded-xl px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`text-sm mt-0.5 ${mono ? "font-mono" : "font-medium"}`}>{value}</div>
    </div>
  );
}
