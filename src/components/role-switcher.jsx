import { Shield, UserCog } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export function RoleSwitcher() {
  const navigate = useNavigate();
  const location = useLocation();

  const role = location.pathname.startsWith("/admin") ? "admin" : "business";

  return (
    <div className="fixed bottom-4 right-4 z-50 glass-card rounded-2xl p-2 flex items-center gap-2 shadow-[var(--shadow-card)]">
      <button
        type="button"
        onClick={() => navigate("/dashboard")}
        className={`px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors ${
          role === "business"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        }`}
      >
        <Shield className="size-3.5" />
        Business
      </button>
      <button
        type="button"
        onClick={() => navigate("/admin")}
        className={`px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors ${
          role === "admin"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        }`}
      >
        <UserCog className="size-3.5" />
        Admin
      </button>
    </div>
  );
}
