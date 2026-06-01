import { Panel } from "@/components/ui-kit";
import { auditLogs } from "@/lib/mock-data";

export default function AdminAudit() {
  return (
    <>
      <Panel className="overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="text-left text-[11px] uppercase tracking-wider text-muted-foreground bg-slate-900/[0.02]">
            <tr><th className="px-5 py-3">ID</th><th className="px-5 py-3">Type</th><th className="px-5 py-3">Actor</th><th className="px-5 py-3">Target</th><th className="px-5 py-3">Timestamp</th></tr>
          </thead>
          <tbody>
            {auditLogs.map((l) => (
              <tr key={l.id} className="border-t border-slate-900/[0.06] hover:bg-slate-900/[0.03]">
                <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{l.id}</td>
                <td className="px-5 py-3"><span className="text-[11px] font-mono uppercase px-2 py-1 rounded-full bg-primary/15 text-primary">{l.type}</span></td>
                <td className="px-5 py-3 font-mono text-xs">{l.actor}</td>
                <td className="px-5 py-3">{l.target}</td>
                <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{l.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </>
  );
}
