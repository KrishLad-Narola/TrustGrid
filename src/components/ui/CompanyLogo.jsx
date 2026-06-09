import { Sparkles } from "lucide-react";

const CompanyLogo = () => {
  return (
    <div className="flex items-center gap-2">
      <div className="size-9 rounded-lg bg-linear-to-br from-primary to-accent flex items-center justify-center glow">
        <Sparkles className="size-5 text-primary-foreground" />
      </div>
      <div>
        <div className="font-display font-bold tracking-tight">TrustGrid</div>
        <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          B2B KYC & Trust
        </div>
      </div>
    </div>
  );
};

export default CompanyLogo;
