import { Users, ShieldCheck, AlertOctagon, Flag, Check, X } from "lucide-react";
import { Card, SectionTitle, StatCard, StatusBadge } from "@/components/ui-bits";
import { adminQueue, businesses, kycDocuments, deals } from "@/lib/mock-data";
import { toast } from "sonner";

export default function AdminHome() {
  const pending = kycDocuments.filter((d) => d.status === "pending").length;
  const flagged = businesses.filter((b) => b.trustScore < 50).length;
  const disputed = deals.filter((d) => d.status === "disputed").length;

  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          label="Total Businesses"
          value={businesses.length.toLocaleString()}
          delta="↑ 4.2% wow"
          icon={<Users className="size-4" />}
        />
        <StatCard
          label="Pending Verifications"
          value={String(pending || adminQueue.length)}
          delta="Avg 6h to resolve"
          icon={<ShieldCheck className="size-4" />}
          accent="warning"
        />
        <StatCard
          label="Flagged Accounts"
          value={String(flagged)}
          delta="Manual review"
          icon={<Flag className="size-4" />}
          accent="destructive"
        />
        <StatCard
          label="Active Disputes"
          value={String(disputed)}
          delta="2 escalated"
          icon={<AlertOctagon className="size-4" />}
          accent="destructive"
        />
      </div>

      <Card>
        <SectionTitle>Verification Queue</SectionTitle>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left py-2">Business</th>
                <th className="text-left">Document</th>
                <th className="text-left">Uploaded</th>
                <th className="text-left">Status</th>
                <th className="text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {adminQueue.map((q) => (
                <tr key={q.id} className="hover:bg-muted/30">
                  <td className="py-2.5 font-medium">{q.business}</td>
                  <td className="py-2.5">{q.document}</td>
                  <td className="py-2.5 font-mono text-xs">{q.uploadedAt}</td>
                  <td className="py-2.5">
                    <StatusBadge status={q.status} />
                  </td>
                  <td className="py-2.5 text-right">
                    <div className="flex gap-1 justify-end">
                      <button
                        type="button"
                        onClick={() => toast.success("Approved")}
                        className="size-7 rounded-md bg-success/15 text-success flex items-center cursor-pointer justify-center"
                      >
                        <Check className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => toast.error("Rejected")}
                        className="size-7 rounded-md bg-destructive/15 text-destructive flex items-center cursor-pointer justify-center"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <SectionTitle>System Alerts</SectionTitle>
        <div className="space-y-2">
          {[
            { sev: "High", text: "GST API latency spiked above 2s for 12 minutes." },
            { sev: "Medium", text: "OCR confidence below threshold on 3 documents today." },
            { sev: "Low", text: "Scheduled maintenance window: Sat 02:00–04:00 IST." },
          ].map((a, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border gap-3">
              <span className="text-sm">{a.text}</span>
              <StatusBadge status={a.sev} />
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
