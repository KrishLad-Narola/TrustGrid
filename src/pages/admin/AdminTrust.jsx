import { Panel } from "@/components/ui-kit";
import { businesses } from "@/lib/mock-data";
import { toast } from "sonner";

export default function AdminTrust() {
  return (
    <>
      <Panel className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[500px]">
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
                  <td className="px-5 py-3.5 font-medium">{b.name}</td>
                  <td className="px-5 py-3.5 font-mono text-xs">{b.trustScore}</td>
                  <td className="px-5 py-3.5">
                    <input
                      type="number"
                      defaultValue={b.trustScore}
                      className="w-16 px-2 py-1 text-xs border rounded bg-background"
                    />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => toast.success("Trust score updated")}
                      className="btn-primary py-1 text-xs"
                    >
                      Save
                    </button>
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
