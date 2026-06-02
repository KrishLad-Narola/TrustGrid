import { Link } from "react-router-dom";
import { useState } from "react";
import { Card, StatusBadge } from "@/components/ui-bits";
import { businesses } from "@/lib/mock-data";
import { Search, MapPin, ArrowUpRight } from "lucide-react";

export default function DirectoryPage() {
  const [q, setQ] = useState("");
  const [industry, setIndustry] = useState("All");
  const [scoreMin, setScoreMin] = useState(0);

  const industries = ["All", ...new Set(businesses.map((b) => b.industry))];
  const filtered = businesses.filter(
    (b) =>
      (industry === "All" || b.industry === industry) &&
      b.trustScore >= scoreMin &&
      (b.name.toLowerCase().includes(q.toLowerCase()) ||
        b.industry.toLowerCase().includes(q.toLowerCase()))
  );

  const scoreColor = (s) =>
    s >= 75 ? "text-success" : s >= 55 ? "text-warning" : "text-destructive";

  return (
    <>
      <Card>
        <div className="grid md:grid-cols-4 gap-3">
          <div className="md:col-span-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-input border border-border">
            <Search className="size-4 text-muted-foreground shrink-0" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name…"
              className="bg-transparent text-sm outline-none flex-1"
            />
          </div>
          <select
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="px-3 py-2 rounded-lg bg-input cursor-pointer border border-border text-sm outline-none"
          >
            {industries.map((i) => (
              <option key={i}>{i}</option>
            ))}
          </select>
          <div className="flex items-center  gap-3 px-3 py-2 rounded-lg bg-input border border-border">
            <span className="text-xs  text-muted-foreground whitespace-nowrap">Min Trust</span>
            <input
              type="range"
              min={0}
              max={100}
              value={scoreMin}
              onChange={(e) => setScoreMin(+e.target.value)}
              className="flex-1 accent-primary cursor-pointer"
            /> 
            <span className="font-mono text-xs w-7 text-right">{scoreMin}</span>
          </div>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((b) => (
          <Card key={b.id} className="flex flex-col hover:border-primary/30 transition-colors">
            <div className="flex items-start gap-3 mb-4">
              <div className="size-12 rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground font-display font-bold flex items-center justify-center shrink-0">
                {b.logo}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{b.name}</div>
                <div className="text-xs text-muted-foreground">{b.industry}</div>
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-1">
                  <MapPin className="size-3 shrink-0" /> {b.location}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Trust Score</div>
                <div className={`font-mono text-2xl font-semibold ${scoreColor(b.trustScore)}`}>
                  {b.trustScore}
                </div>
              </div>
              <StatusBadge status={b.kycStatus} />
            </div>
            <Link
              to={`/profile/${b.id}`}
              className="btn-ghost w-full justify-center text-xs mt-auto"
            >
              View profile <ArrowUpRight className="size-3.5" />
            </Link>
          </Card>
        ))}
      </div>
    </>
  );
}
