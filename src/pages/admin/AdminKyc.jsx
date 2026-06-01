import { useState } from "react";
import { Panel, StatusBadge } from "@/components/ui-kit";
import { kycDocuments } from "@/lib/mock-data";
import { Check, X, ChevronDown, FileText } from "lucide-react";
import { toast } from "sonner";

export default function AdminKyc() {
  const [expanded, setExpanded] = useState(null);
  const [reject, setReject] = useState(null);

  return (
    <>
      <div className="flex flex-wrap gap-2 justify-end">
        <button type="button" onClick={() => toast.success("Bulk approved 12 documents")} className="btn-ghost text-sm border-success/20 text-success">
          <Check className="size-4" /> Approve all
        </button>
        <button type="button" onClick={() => toast.error("Bulk rejected 3 documents")} className="btn-ghost text-sm border-destructive/20 text-destructive">
          <X className="size-4" /> Reject all
        </button>
      </div>

      <Panel className="overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="text-left text-[11px] uppercase tracking-wider text-muted-foreground bg-slate-900/[0.02]">
            <tr>
              <th className="px-5 py-3 font-medium">Business</th>
              <th className="px-5 py-3 font-medium">Document</th>
              <th className="px-5 py-3 font-medium">Uploaded</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {kycDocuments.map((d) => (
              <div key={d.id} className="contents">
                <tr className="border-t border-slate-900/[0.06] hover:bg-slate-900/[0.03]">
                  <td className="px-5 py-4 font-medium">Helios Trade Networks</td>
                  <td className="px-5 py-4">{d.type}</td>
                  <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{d.uploadedAt}</td>
                  <td className="px-5 py-4"><StatusBadge status={d.status} /></td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => toast.success("Document approved")} className="px-2.5 py-1.5 rounded-lg bg-success/15 text-success text-xs hover:bg-success/25"><Check className="h-3.5 w-3.5" /></button>
                      <button onClick={() => setReject(d.id)} className="px-2.5 py-1.5 rounded-lg bg-danger/15 text-danger text-xs hover:bg-danger/25"><X className="h-3.5 w-3.5" /></button>
                      <button onClick={() => setExpanded(expanded === d.id ? null : d.id)} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-slate-900/[0.03]"><ChevronDown className={`h-4 w-4 transition ${expanded === d.id ? "rotate-180" : ""}`} /></button>
                    </div>
                  </td>
                </tr>
                {expanded === d.id && (
                  <tr className="bg-slate-900/[0.02]">
                    <td colSpan="5" className="px-5 py-5">
                      <div className="grid md:grid-cols-2 gap-5">
                        <div className="rounded-xl border border-border bg-muted/30 p-4 h-56 grid place-items-center">
                          <div className="text-center">
                            <FileText className="size-12 text-primary mx-auto mb-2 opacity-60" />
                            <div className="text-sm">{d.name}</div>
                            <div className="text-xs text-muted-foreground mt-1">Document preview</div>
                          </div>
                        </div>
                        <div>
                          <div className="text-xs font-mono uppercase tracking-widest text-primary mb-2">OCR extraction</div>
                          <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2 text-sm">
                            {Object.entries(d.extracted ?? { GSTIN: "27AAACH1234A1Z9", "Legal Name": "Helios Trade Networks Pvt Ltd", "Valid Until": "2026-09-11" }).map(([k, v]) => (
                              <div key={k} className="flex justify-between border-b border-slate-900/[0.06] pb-2 last:border-0">
                                <span className="text-muted-foreground">{k}</span>
                                <span className="font-mono">{v}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </div>
            ))}
          </tbody>
        </table>
      </Panel>

      {reject && <RejectModal onClose={() => setReject(null)} />}
    </>
  );
}

function RejectModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="glass-card w-full max-w-md p-6">
        <h3 className="font-display text-xl font-semibold">Reject document</h3>
        <p className="text-sm text-muted-foreground mt-1">Provide a reason — the business will be notified.</p>
        <div className="mt-4 space-y-3">
          <select className="w-full px-4 py-2.5 rounded-xl bg-slate-900/[0.03] border border-slate-900/[0.08]">
            {["Illegible scan", "Expired document", "Mismatched details", "Suspected forgery", "Other"].map((o) => <option key={o} className="bg-surface">{o}</option>)}
          </select>
          <textarea rows={3} placeholder="Additional notes…" className="w-full px-4 py-2.5 rounded-xl bg-slate-900/[0.03] border border-slate-900/[0.08]" />
          <button onClick={() => { toast.error("Document rejected"); onClose(); }} className="w-full px-4 py-2.5 rounded-xl bg-danger text-white text-sm font-medium">Submit rejection</button>
        </div>
      </div>
    </div>
  );
}
