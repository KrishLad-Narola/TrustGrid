import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowRight, Sparkles, Mail, Loader2, Clock3, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import axiosInstance from "@/API/axiosInstance";
import { z } from "zod";

const forgotPasswordSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Please enter a valid email address"),
});

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (loading || timer > 0) return;

    const validation = forgotPasswordSchema.safeParse({ email });
    if (!validation.success) {
      toast.error(validation.error.errors[0]?.message || "Invalid email");
      return;
    }

    try {
      setLoading(true);
      const response = await axiosInstance.post("/auth/forgot-password", { email });
      toast.success(response.data?.message || "Reset link sent to your email");
      setTimer(120);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-10 flex flex-col">
      <div className="w-full mx-auto flex flex-col justify-center items-center">
        <div className="flex justify-between w-full">

        <div className="flex items-center gap-2 mb-20">
          <div className="size-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Sparkles className="size-5 text-primary-foreground" />
          </div>
          <div>
            <div className="font-display font-bold">TrustGrid</div>
            <div className="text-xs text-muted-foreground">Password recovery</div>
          </div>
          </div>
          
        </div>

        <form onSubmit={handleForgotPassword} className="glass-card p-8 mt-10">
          <h1 className="font-display text-2xl font-semibold">Forgot your password?</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your registered business email and we&apos;ll send you a secure reset link.
          </p>

          <div className="mt-6">
            <label className="text-xs text-muted-foreground">Work email</label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="email"
                required
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-input border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
              />
            </div>
          </div>

          {timer > 0 && (
            <div className="mt-4 rounded-lg border border-border bg-muted/50 px-4 py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Clock3 className="size-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Reset link already sent</p>
                  <p className="text-xs text-muted-foreground">Request again after cooldown</p>
                </div>
              </div>
              <span className="font-mono text-lg font-semibold">{formatTime(timer)}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || timer > 0}
            className="btn-primary w-full mt-6 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-600 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Sending…
              </>
            ) : (
              <>
                Send reset link <ArrowRight className="size-4" />
              </>
            )}
          </button>

          <Link to="/" className="block text-center text-sm text-muted-foreground hover:text-foreground mt-5">
            Remembered your password? <span className="text-primary">Sign in →</span>
          </Link>
        </form>
      </div>
    </div>
  );
}
