/** Presentational primitives aligned with core-trust-suite reference UI */

export function StatusBadge({ status }) {
  const normalized =
    typeof status === "string"
      ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
      : "Draft";

  const map = {
    Verified: { bg: "bg-success/15", text: "text-success", dot: "bg-success" },
    Active: { bg: "bg-success/15", text: "text-success", dot: "bg-success" },
    Completed: { bg: "bg-primary/15", text: "text-primary", dot: "bg-primary" },
    Pending: { bg: "bg-warning/20", text: "text-accent-foreground", dot: "bg-warning" },
    Draft: { bg: "bg-muted", text: "text-muted-foreground", dot: "bg-muted-foreground" },
    Rejected: { bg: "bg-destructive/15", text: "text-destructive", dot: "bg-destructive" },
    Disputed: { bg: "bg-destructive/15", text: "text-destructive", dot: "bg-destructive" },
    Cancelled: { bg: "bg-muted", text: "text-muted-foreground", dot: "bg-muted-foreground" },
    High: { bg: "bg-destructive/15", text: "text-destructive", dot: "bg-destructive" },
    Medium: { bg: "bg-warning/20", text: "text-accent-foreground", dot: "bg-warning" },
    Low: { bg: "bg-success/15", text: "text-success", dot: "bg-success" },
  };

  const s = map[normalized] ?? map.Draft;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium ${s.bg} ${s.text}`}
    >
      <span className={`size-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

export function StatCard({ label, value, delta, hint, icon, accent }) {
  const subtext = delta ?? hint;
  const color =
    accent === "success"
      ? "text-success"
      : accent === "warning"
        ? "text-warning"
        : accent === "destructive" || accent === "danger"
          ? "text-destructive"
          : "text-primary";

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
        {icon && (
          <div className={`size-8 rounded-lg bg-muted flex items-center justify-center ${color}`}>
            {icon}
          </div>
        )}
      </div>
      <div className="font-mono text-3xl font-semibold tracking-tight">{value}</div>
      {subtext && <div className="text-[11px] text-muted-foreground mt-1">{subtext}</div>}
    </div>
  );
}

export function Card({ children, className = "" }) {
  return <div className={`glass-card p-5 ${className}`}>{children}</div>;
}

export function SectionTitle({ children, action }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-sm font-semibold tracking-tight uppercase text-muted-foreground">
        {children}
      </h3>
      {action}
    </div>
  );
}
