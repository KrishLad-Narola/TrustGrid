import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Loader2, Sparkles, ArrowLeft } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);

  const token = searchParams.get("token");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        await axios.post("http://192.168.100.149:3000/api/v1/auth/verify-email", { token });

        setVerified(true);
        toast.success("Email verified successfully");

        setTimeout(() => {
          navigate("/");
        }, 3000);
      } catch {
        setVerified(false);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      verifyEmail();
    } else {
      setLoading(false);
      setVerified(false);
      toast.error("Verification token missing");
    }
  }, [token, navigate]);

  return (
    <div className="min-h-screen px-4 py-10 flex flex-col">
      <div className="max-w-lg mx-auto w-full flex-1">
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
            <div className="text-xs text-muted-foreground">Email verification</div>
          </div>
        </div>

        <div className="glass-card p-8 text-center">
          {loading ? (
            <>
              <Loader2 className="size-14 mx-auto text-primary animate-spin" />
              <h1 className="mt-6 font-display text-2xl font-semibold">Verifying your email…</h1>
              <p className="mt-3 text-sm text-muted-foreground">
                Please wait while we securely verify your email address.
              </p>
            </>
          ) : verified ? (
            <>
              <CheckCircle2 className="size-14 mx-auto text-success" />
              <h1 className="mt-6 font-display text-2xl font-semibold">Email verified</h1>
              <p className="mt-3 text-sm text-muted-foreground">
                Your business account has been verified. Redirecting to login…
              </p>
              <Link to="/" className="btn-primary inline-flex mt-6">
                Continue to login
              </Link>
            </>
          ) : (
            <>
              <XCircle className="size-14 mx-auto text-destructive" />
              <h1 className="mt-6 font-display text-2xl font-semibold">Verification failed</h1>
              <p className="mt-3 text-sm text-muted-foreground">
                The verification link is invalid or has expired.
              </p>
              <Link to="/" className="btn-primary inline-flex mt-6">
                Back to login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
