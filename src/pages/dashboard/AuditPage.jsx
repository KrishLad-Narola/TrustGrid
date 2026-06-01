import { useState } from "react";
import { Card } from "@/components/ui-bits";
import { auditLogs } from "@/lib/mock-data";
import { Download, Calendar } from "lucide-react";
import { toast } from "sonner";

const typeStyles = {
  "Document Upload": "bg-primary/15 text-primary",
  "Profile View": "bg-muted text-muted-foreground",
  "Deal Created": "bg-primary/15 text-primary",
  "Score Updated": "bg-success/15 text-success",
  Verification: "bg-warning/20 text-accent-foreground",
  Login: "bg-muted text-muted-foreground",
};

export default function AuditPage() {
  const [filter, setFilter] = useState("All");
  const types = ["All", ...new Set(auditLogs.map((l) => l.type))];
  const rows = filter === "All" ? auditLogs : auditLogs.filter((l) => l.type === filter);

  const exportCsv = () => {
    const csv = [
      "id,type,actor,target,timestamp",
      ...rows.map((r) => `${r.id},${r.type},${r.actor},${r.target},${r.timestamp}`),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "audit-logs.csv";
    a.click();
    toast.success("CSV exported");
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="size-3.5" /> Last 30 days
        </div>
        <button type="button" onClick={exportCsv} className="btn-ghost text-sm">
          <Download className="size-4" /> Export CSV
        </button>
      </div>

      <Card>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {types.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFilter(t)}
              className={`px-3 py-1.5 rounded-full text-xs border transition ${
                filter === t
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto -mx-5 -mb-5">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="text-xs uppercase text-muted-foreground bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3">ID</th>
                <th className="text-left px-4 py-3">Type</th>
                <th className="text-left px-4 py-3">Actor</th>
                <th className="text-left px-4 py-3">Target</th>
                <th className="text-left px-4 py-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((l) => (
                <tr key={l.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{l.id}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[11px] font-mono uppercase px-2 py-1 rounded-full ${
                        typeStyles[l.type] ?? "bg-muted text-muted-foreground"
                      }`}
                    >
                      {l.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{l.actor}</td>
                  <td className="px-4 py-3">{l.target}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{l.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
