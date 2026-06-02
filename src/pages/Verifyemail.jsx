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
    <div className="min-h-screen flex flex-col px-4">
      {/* Logo */}
      <div className="pt-8 pl-2">
        <Link to="/" className="inline-flex items-center gap-3">
        <div className="size-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Sparkles className="size-4 text-white" />
          </div>

          <div>
            <h1 className="font-display font-bold text-xl leading-none">
              TrustGrid
            </h1>
            <p className="text-xs text-muted-foreground">
              Email verification
            </p>
          </div>
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-lg">
          <div className="glass-card rounded-3xl border border-border bg-card/80 backdrop-blur-sm shadow-xl p-8 text-center">
            {loading ? (
              <>
                <Loader2 className="size-16 mx-auto text-primary animate-spin" />

                <h2 className="mt-6 text-4xl font-display font-bold text-foreground">
                  Verifying email
                </h2>

                <p className="mt-4 text-lg text-muted-foreground">
                  Please wait while we securely verify your email address.
                </p>
              </>
            ) : verified ? (
              <>
                <CheckCircle2 className="size-20 mx-auto text-green-500" />

                <h2 className="mt-6 text-4xl font-display font-bold text-foreground">
                  Email verified
                </h2>

                <p className="mt-4 text-lg text-muted-foreground">
                  Your business account has been verified successfully.
                </p>

                <Link
                  to="/"
                  className="mt-8 w-full h-14 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-500 text-white font-semibold flex items-center justify-center hover:opacity-95 transition"
                >
                  Continue to login
                </Link>
              </>
            ) : (
              <>
                <XCircle className="size-20 mx-auto text-red-500" />

                <h2 className="mt-6 text-4xl font-display font-bold text-foreground">
                  Verification failed
                </h2>

                <p className="mt-4 text-lg text-muted-foreground">
                  The verification link is invalid or has expired.
                </p>

                <Link
                  to="/"
                  className="mt-8 w-full h-14 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-500 text-white font-semibold flex items-center justify-center hover:opacity-95 transition"
                >
                  Back to login
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
