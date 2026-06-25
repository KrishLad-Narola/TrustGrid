import { useState } from "react";
import { Panel, StatusBadge } from "@/components/ui-kit";
import { businesses } from "@/lib/mock-data";
import { Search, Flag, Pause, Edit3 } from "lucide-react";
import { toast } from "sonner";

export default function AdminBusinesses() {
  const [q, setQ] = useState("");
  const rows = businesses.filter((b) => b.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <Panel className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search businesses…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900/[0.03] border border-slate-900/[0.08] focus:outline-none focus:border-primary/50"
          />
        </div>
      </Panel>

      <Panel className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="text-left text-[11px] uppercase tracking-wider text-muted-foreground bg-slate-900/[0.02]">
              <tr>
                <th className="px-5 py-3 font-medium">Business</th>
                <th className="px-5 py-3 font-medium">Industry</th>
                <th className="px-5 py-3 font-medium">Trust</th>
                <th className="px-5 py-3 font-medium">KYC</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((b) => (
                <tr
                  key={b.id}
                  className="border-t border-slate-900/[0.06] hover:bg-slate-900/[0.03]"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-lg bg-gradient-to-br from-primary to-accent grid place-items-center text-xs font-semibold text-primary-foreground">
                        {b.logo}
                      </div>
                      <div>
                        <div className="font-medium">{b.name}</div>
                        <div className="text-[10px] font-mono text-muted-foreground">{b.gstin}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{b.industry}</td>
                  <td className="px-5 py-4 font-mono">
                    <span
                      className={
                        b.trustScore >= 75
                          ? "text-success"
                          : b.trustScore >= 50
                            ? "text-warning"
                            : "text-danger"
                      }
                    >
                      {b.trustScore}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={b.kycStatus} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => toast.success("Score override saved")}
                        title="Override score"
                        className="size-8 grid place-items-center cursor-pointer rounded-lg hover:bg-muted text-muted-foreground hover:text-primary"
                      >
                        <Edit3 className="size-4" />
                      </button>
                      <button
                        onClick={() => toast.warning("Business flagged for review")}
                        title="Flag"
                        className="h-8 w-8 grid place-items-center cursor-pointer rounded-lg hover:bg-slate-900/[0.03] text-muted-foreground hover:text-warning"
                      >
                        <Flag className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => toast.error("Account suspended")}
                        title="Suspend"
                        className="h-8 w-8 grid place-items-center cursor-pointer rounded-lg hover:bg-slate-900/[0.03] text-muted-foreground hover:text-danger"
                      >
                        <Pause className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
