import { Panel } from "@/components/ui-kit";
import { businesses } from "@/lib/mock-data";
import { toast } from "sonner";

export default function AdminTrust() {
  return (
    <>
      <Panel className="overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="text-left text-[11px] uppercase tracking-wider text-muted-foreground bg-slate-900/[0.02]">
            <tr>
              <th className="px-5 py-3">Business</th>
              <th className="px-5 py-3">Current</th>
              <th className="px-5 py-3">Override</th>
              <th className="px-5 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {businesses.map((b) => (
              <tr key={b.id} className="border-t border-slate-900/[0.06]">
                <td className="px-5 py-3 font-medium">{b.name}</td>
                <td className="px-5 py-3 font-mono">{b.trustScore}</td>
                <td className="px-5 py-3">
                  <input
                    defaultValue={b.trustScore}
                    type="number"
                    className="w-20 px-3 py-1.5 rounded-lg bg-slate-900/[0.03] border border-slate-900/[0.08] font-mono text-sm"
                  />
                </td>
                <td className="px-5 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => toast.success("Override saved")}
                    className="btn-primary  cursor-pointer text-xs py-1.5 px-3"
                  >
                    Apply
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </>
  );
}
