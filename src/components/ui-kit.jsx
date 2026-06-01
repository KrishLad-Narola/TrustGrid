import { cn } from "@/lib/utils";
import { Card, SectionTitle, StatCard, StatusBadge } from "@/components/ui-bits";

export { Card, SectionTitle, StatCard, StatusBadge };

/** @deprecated Prefer Card from ui-bits */
export function Panel({ children, className, glow }) {
  return (
    <Card className={cn(glow && "glow", className)}>{children}</Card>
  );
}

export function PageHeader({ title, description, actions, kicker }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div>
        {kicker && (
          <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-primary mb-2">{kicker}</div>
        )}
        <h1 className="font-display text-3xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1.5 text-sm text-muted-foreground max-w-2xl">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
