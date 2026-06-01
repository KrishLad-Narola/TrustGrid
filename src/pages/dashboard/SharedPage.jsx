import { Card } from "@/components/ui-bits";
import { businesses } from "@/lib/mock-data";
import { Link2, Copy, Eye } from "lucide-react";
import { toast } from "sonner";

export default function SharedPage() {
  const copy = (id) => {
    navigator.clipboard?.writeText(`${window.location.origin}/profile/${id}`);
    toast.success("Public profile link copied");
  };

  return (
    <div className="grid md:grid-cols-2 gap-5">
      {businesses.slice(0, 4).map((b) => (
        <Card key={b.id}>
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground font-display font-semibold flex items-center justify-center shrink-0">
              {b.logo}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{b.name}</div>
              <div className="text-xs text-muted-foreground">{b.industry}</div>
            </div>
            <div className="text-xs font-mono text-muted-foreground shrink-0">
              <Eye className="size-3 inline mr-1" />
              {Math.floor(Math.random() * 80) + 20} views
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-border bg-input px-3 py-2 text-xs font-mono text-muted-foreground">
            <Link2 className="size-3.5 shrink-0" />
            <span className="truncate">trustgrid.io/profile/{b.id}</span>
            <button
              type="button"
              onClick={() => copy(b.id)}
              className="ml-auto size-7 grid place-items-center rounded-md hover:bg-muted"
              aria-label="Copy link"
            >
              <Copy className="size-3.5" />
            </button>
          </div>
        </Card>
      ))}
    </div>
  );
}
