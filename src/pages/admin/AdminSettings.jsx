import { Panel } from "@/components/ui-kit";

export default function AdminSettings() {
  return (
    <>
      <div className="grid lg:grid-cols-2 gap-6">
        <Panel>
          <h3 className="font-display text-lg font-semibold mb-4">Verification SLA</h3>
          <div className="text-sm text-muted-foreground">
            Standard turnaround target: <span className="font-mono text-foreground">24 hours</span>
          </div>
        </Panel>
        <Panel>
          <h3 className="font-display text-lg font-semibold mb-4">Risk thresholds</h3>
          <div className="text-sm text-muted-foreground">
            Auto-flag below trust score: <span className="font-mono text-danger">50</span>
          </div>
        </Panel>
      </div>
    </>
  );
}
