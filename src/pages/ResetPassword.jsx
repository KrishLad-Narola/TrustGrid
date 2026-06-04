import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { ArrowRight, Sparkles, Lock, Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { z } from "zod";

const resetPasswordSchema = z
  .object({
    password: z.string().trim().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().trim(),
    token: z.string().min(1, "Invalid reset link"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();

    const validation = resetPasswordSchema.safeParse({
      password,
      confirmPassword,
      token,
    });

    if (!validation.success) {
      const errors = validation.error.flatten();
      const firstError =
        errors.formErrors?.[0] ||
        errors.fieldErrors?.confirmPassword?.[0] ||
        errors.fieldErrors?.password?.[0] ||
        "Validation failed";

      return toast.error(firstError);
    }

    try {
      setLoading(true);

      const response = await axios.post("http://192.168.100.149:3000/api/v1/auth/reset-password", {
        token,
        password,
        confirmPassword,
      });

      toast.success(response?.data?.message || "Password reset successfully");

      setTimeout(() => {
        navigate("/");
      }, 1200);
    } catch (error) {
      console.log(error);

      if (error.response?.status === 400) {
        toast.error("Invalid or expired reset link");
      } else if (error.response?.status >= 500) {
        toast.error("Server error. Please try again later");
      } else if (error.request) {
        toast.error("Unable to connect to server");
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="max-w-lg mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="size-4" /> Back to home
        </Link>

        <div className="flex items-center gap-2 mb-6">
          <div className="size-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Sparkles className="size-5 text-primary-foreground" />
          </div>
          <div>
            <div className="font-display font-bold">TrustGrid</div>
            <div className="text-xs text-muted-foreground">Password reset</div>
          </div>
        </div>

        <form onSubmit={handleResetPassword} className="glass-card p-8">
          <h1 className="font-display text-2xl font-semibold">Reset your password</h1>
          <p className="mt-2 text-sm text-muted-foreground">Enter your new secure password to regain access.</p>

          <div className="mt-6">
            <label className="text-xs text-muted-foreground">New password</label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-input border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <div className="mt-4">
            <label className="text-xs text-muted-foreground">Confirm password</label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-input border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-6 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Resetting…
              </>
            ) : (
              <>
                Reset password <ArrowRight className="size-4" />
              </>
            )}
          </button>

          <Link to="/" className="block text-center text-sm cursor-pointer text-muted-foreground hover:text-foreground mt-5">
            Back to <span className="text-primary">Sign in →</span>
          </Link>
        </form>
      </div>
    </div>
  );
}
