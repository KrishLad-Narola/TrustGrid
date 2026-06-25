import { useState } from "react";
import { Panel } from "@/components/ui-kit";
import { deals, formatINR } from "@/lib/mock-data";
import { AlertOctagon, X, ShieldOff, ShieldCheck, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";

const disputes = deals
  .filter((d) => d.status === "disputed")
  .concat([
    {
      ...deals[0],
      id: "DL-2837",
      name: "Software License Renewal",
      counterparty: "Northwind Capital Partners",
      status: "disputed",
      value: 1_250_000,
      createdAt: "2025-09-14",
    },
  ]);

export default function AdminDisputes() {
  const [open, setOpen] = useState(null);
  const sel = disputes.find((d) => d.id === open);

  return (
    <>
      <Panel className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="text-left text-[11px] uppercase tracking-wider text-muted-foreground bg-slate-900/[0.02]">
              <tr>
                <th className="px-5 py-3 font-medium">Deal</th>
                <th className="px-5 py-3 font-medium">Parties</th>
                <th className="px-5 py-3 font-medium">Reason</th>
                <th className="px-5 py-3 font-medium">Severity</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium text-right"></th>
              </tr>
            </thead>
            <tbody>
              {disputes.map((d) => (
                <tr
                  key={d.id}
                  className="border-t border-slate-900/[0.06] hover:bg-slate-900/[0.03] cursor-pointer"
                  onClick={() => setOpen(d.id)}
                >
                  <td className="px-5 py-4">
                    <div className="font-medium">{d.name}</div>
                    <div className="text-[10px] font-mono text-muted-foreground">
                      {d.id} · {formatINR(d.value)}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">Helios ↔ {d.counterparty}</td>
                  <td className="px-5 py-4 text-muted-foreground">Quality issues</td>
                  <td className="px-5 py-4">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-danger/15 text-danger">
                      High
                    </span>
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-muted-foreground">
                    {d.createdAt}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <ArrowUpRight className="size-4 inline text-primary" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {sel && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setOpen(null)}
        >
          <div onClick={(e) => e.stopPropagation()} className="glass-card w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-[11px] font-mono uppercase tracking-widest text-danger">
                  Active dispute · {sel.id}
                </div>
                <h3 className="font-display text-xl font-semibold mt-1">{sel.name}</h3>
              </div>
              <button
                onClick={() => setOpen(null)}
                className="h-8 w-8 rounded-lg grid place-items-center hover:bg-slate-900/[0.03]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="text-sm text-muted-foreground mb-4">
              Helios Trade Networks raised a quality dispute against {sel.counterparty}.
              Counterparty disputes the claim citing acceptance documentation.
            </div>

            <div className="grid sm:grid-cols-3 gap-3 mb-5">
              <Stat label="Value" value={formatINR(sel.value)} />
              <Stat label="Filed" value={sel.createdAt} />
              <Stat label="Days open" value="9" />
            </div>

            <div className="flex flex-wrap gap-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  toast.success("Dispute closed");
                  setOpen(null);
                }}
                className="btn-ghost text-sm"
              >
                <ShieldCheck className="size-4" /> Close
              </button>
              <button
                onClick={() => {
                  toast.warning("Escalated to legal");
                  setOpen(null);
                }}
                className="px-3.5 py-2 rounded-xl bg-warning/15 text-warning border border-warning/30 text-sm inline-flex items-center gap-2"
              >
                <AlertOctagon className="h-4 w-4" /> Escalate
              </button>
              <button
                onClick={() => {
                  toast.error("Penalty applied");
                  setOpen(null);
                }}
                className="px-3.5 py-2 rounded-xl bg-danger text-white text-sm inline-flex items-center gap-2"
              >
                <ShieldOff className="h-4 w-4" /> Penalize
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="font-mono text-sm mt-0.5">{value}</div>
    </div>
  );
}
