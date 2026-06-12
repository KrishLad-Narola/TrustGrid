import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { z } from "zod";
import {
  ShieldCheck,
  Sparkles,
  Globe2,
  BadgeCheck,
  ArrowRight,
  LineChart,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";

import { TrustGauge } from "@/components/trust-gauge";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import axiosInstance from "@/API/axiosInstance";
import CompanyLogo from "@/components/ui/CompanyLogo";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function Landing() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const validatedData = loginSchema.parse({ email, password });
      setErrors({});

      const response = await axiosInstance.post("/auth/login", validatedData);

      const accessToken = response.data.accessToken || response.data.data?.accessToken;
      const refreshToken = response.data.refreshToken || response.data.data?.refreshToken;

      if (!accessToken || !refreshToken) {
        throw new Error("Tokens not received");
      }

      await login({ accessToken, refreshToken });

      const role = response.data.user?.role || response.data.data?.user?.role;

      toast.success(response.data.message || "Welcome back to TrustGrid");
      useEffect(() => {
        if (user?.role === "admin") {
          navigate("/admin/dashboard");
          return;
        }

        if (!user?.isKycApproved) {
          navigate("/kyc-submit");
          return;
        }

        navigate("/dashboard");
      }, [user]);
    } catch (error) {
      console.error(error);

      if (error instanceof z.ZodError) {
        const fieldErrors = {};
        error.errors.forEach((err) => {
          fieldErrors[err.path[0]] = err.message;
        });
        setErrors(fieldErrors);
        return;
      }
       toast.error(error.response?.data?.message ?? "Login failed");
    }
  };

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-10 backdrop-blur">
        <header className="max-w-7xl mx-auto px-6 md:px-10 py-4 flex items-center justify-between">
          <CompanyLogo />
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground">
              Features
            </a>
            <a href="#trust" className="hover:text-foreground">
              Trust Score
            </a>
            <a href="#security" className="hover:text-foreground">
              Security
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/register" className="btn-ghost">
              Register Business
            </Link>
          </div>
        </header>
      </div>

      <section
        id="trust"
        className="px-6 md:px-10 pt-10 pb-20 grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto"
      >
        <div className="flex flex-col justify-center">
          <div className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full border border-border bg-card text-xs font-mono text-muted-foreground mb-6">
            <span className="size-1.5 rounded-full bg-success animate-pulse" />
            LIVE · Verified business network
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight leading-[1.05]">
            Verify Once. <br />
            <span className="gradient-text">Trust Always.</span>
          </h1>
          <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-lg">
            The B2B compliance layer for modern deals. Authenticate businesses, surface risk flags,
            and underwrite trust with a transparent, audit-grade score.
          </p>

          <form onSubmit={handleLogin} className="mt-8 glass-card p-5 max-w-md">
            <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-3">
              Sign in
            </div>

            <label className="text-xs text-muted-foreground">Work email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full mt-1 px-3 py-2 rounded-lg bg-input border text-sm outline-none focus:ring-2 focus:ring-primary/30 ${
                errors.email ? "border-destructive" : "border-border"
              }`}
              placeholder="you@company.com"
              type="email"
              required
            />
            {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}

            <label className="text-xs text-muted-foreground mt-3 block">Password</label>
            <div className="relative mt-1">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-3 py-2 pr-10 rounded-lg bg-input border text-sm outline-none focus:ring-2 focus:ring-primary/30 ${
                  errors.password ? "border-destructive" : "border-border"
                }`}
                placeholder="••••••••"
                type={showPassword ? "text" : "password"}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.password && <p className="text-destructive text-xs mt-1">{errors.password}</p>}

            <div className="flex justify-end mt-2">
              <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                Forgot password?
              </Link>
            </div>

            <div className="flex gap-2 mt-4">
              <button type="submit" className="btn-primary cursor-pointer flex-1">
                Sign in <ArrowRight className="size-4" />
              </button>
            </div>
          </form>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 blur-3xl" />
          <div className="relative glass-card p-8 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Live Profile
                </div>
                <div className="font-display font-semibold mt-1">Helios Trade Networks</div>
                <div className="text-xs text-muted-foreground font-mono">U74999MH2018PLC312841</div>
              </div>
              <BadgeCheck className="size-6 text-success" />
            </div>
            <div className="flex justify-center my-4">
              <TrustGauge score={85} size={210} />
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4">
              {[
                { l: "KYC", v: "38/40" },
                { l: "Legal", v: "28/30" },
                { l: "Deals", v: "19/30" },
              ].map((s) => (
                <div key={s.l} className="rounded-lg border border-border p-3 text-center">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {s.l}
                  </div>
                  <div className="font-mono font-semibold mt-1">{s.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="px-6 md:px-10 py-16 border-t border-border bg-card/40">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-display font-bold tracking-tight">
            Built for trust, audited by design.
          </h2>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Three pillars power every score on TrustGrid.
          </p>
          <div className="grid md:grid-cols-3 gap-5 mt-10">
            {[
              {
                icon: ShieldCheck,
                title: "Verified KYC",
                desc: "OCR-extracted GST, PAN, CIN, and bank proofs reviewed by compliance officers.",
              },
              {
                icon: LineChart,
                title: "Dynamic Trust Score",
                desc: "A weighted 0–100 score that updates with every deal, document, and dispute.",
              },
              {
                icon: Lock,
                title: "Permission-gated profiles",
                desc: "Share what matters. Documents and risk flags reveal only with consent.",
              },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="glass-card p-6">
                  <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <Icon className="size-5" />
                  </div>
                  <div className="font-display font-semibold">{f.title}</div>
                  <p className="text-sm text-muted-foreground mt-2">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <footer
        id="security"
        className="px-6 md:px-10 py-8 text-xs text-muted-foreground flex items-center justify-between flex-wrap gap-3"
      >
        <div className="flex items-center gap-2">
          <Globe2 className="size-4" /> TrustGrid · Surat · 2026
        </div>
        <div className="font-mono">v1.0.0 · SOC2 in progress</div>
      </footer>
    </div>
  );
}
